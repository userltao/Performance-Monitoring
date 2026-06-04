/**
 * LLM 服务层 —— 封装大模型调用，支持多供应商切换
 * 兼容所有 OpenAI 格式的 API（OpenAI / DeepSeek / 通义千问 / Ollama 等）
 */
// llm.js 封装了调用大模型 API 的所有细节
// （拼 URL、带 API Key、构造请求体、解析响应），
// 对外只暴露 chat()（非流式，等完整回复）和 chatStream()（流式，逐 token 输出）两个方法，
// 通过配置 baseURL 和 apiKey 就能切换 OpenAI、DeepSeek、通义千问等任何兼容 OpenAI 格式的模型，
// 调用方不需要关心底层 HTTP 请求怎么发、响应怎么解析。
const DEFAULT_CONFIG = {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.1,
    maxTokens: 4096,
}

class LLMService {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config }
        this.apiKey = config.apiKey || process.env.LLM_API_KEY
        this.baseURL = config.baseURL || process.env.LLM_BASE_URL
        this.model = config.model || process.env.LLM_MODEL || DEFAULT_CONFIG.model
    }

    /**
     * 同步对话（非流式），支持 Function Calling
     * @param {Array} messages - [{role, content}]
     * @param {object} options - 覆盖默认配置，可传 tools
     * @returns {Promise<object>} 完整 message 对象（含 content 和 tool_calls）
     */
    async chat(messages, options = {}) {
        const body = {
            model: options.model || this.model,
            messages,
            temperature: options.temperature ?? this.config.temperature,
            max_tokens: options.maxTokens || this.config.maxTokens,
        }

        if (options.jsonMode) {
            body.response_format = { type: 'json_object' }
        }

        // Function Calling: 传入工具定义
        if (options.tools) {
            body.tools = options.tools
        }

        const response = await this._fetch('/chat/completions', body)
        return response.choices[0].message
    }

    /**
     * 流式对话，支持 Function Calling
     * @param {Array} messages
     * @param {object} options - 可传 tools
     * @returns {AsyncGenerator<object>} 逐 chunk 输出，最后一个 chunk 包含完整 message
     */
    async *chatStream(messages, options = {}) {
        const body = {
            model: options.model || this.model,
            messages,
            temperature: options.temperature ?? this.config.temperature,
            stream: true,
        }

        if (options.tools) {
            body.tools = options.tools
        }

        const resp = await this._rawFetch('/chat/completions', body)
        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        // 聚合流式 tool_calls 的增量
        let toolCalls = []
        let contentBuffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop()

            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed || !trimmed.startsWith('data: ')) continue
                const data = trimmed.slice(6)
                if (data === '[DONE]') {
                    // 流结束，返回完整 message
                    yield {
                        done: true,
                        message: {
                            role: 'assistant',
                            content: contentBuffer || null,
                            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                        },
                    }
                    return
                }

                try {
                    const parsed = JSON.parse(data)
                    const delta = parsed.choices?.[0]?.delta
                    if (!delta) continue

                    // 文本内容增量
                    if (delta.content) {
                        contentBuffer += delta.content
                        yield { type: 'content', content: delta.content }
                    }

                    // Function Calling 增量
                    if (delta.tool_calls) {
                        for (const tc of delta.tool_calls) {
                            const idx = tc.index ?? 0
                            if (!toolCalls[idx]) {
                                toolCalls[idx] = { id: '', type: 'function', function: { name: '', arguments: '' } }
                            }
                            if (tc.id) toolCalls[idx].id += tc.id
                            if (tc.function?.name) toolCalls[idx].function.name += tc.function.name
                            if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments
                        }
                    }
                } catch { }
            }
        }
    }

    /**
     * 发送请求并解析 JSON
     */
    async _fetch(path, body) {
        const resp = await this._rawFetch(path, body)

        if (!resp.ok) {
            const text = await resp.text()
            throw new Error(`LLM API 错误 (${resp.status}): ${text}`)
        }

        return resp.json()
    }

    /**
     * 底层 fetch，返回原始 Response
     */
    async _rawFetch(path, body) {
        const baseURL = this.baseURL || 'https://api.openai.com/v1'
        const url = `${baseURL.replace(/\/+$/, '')}${path}`

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
        })
    }
}

module.exports = LLMService
