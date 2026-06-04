/**
 * Agent 引擎 —— 实现 ReAct (Reasoning + Acting) 循环
 * 使用 OpenAI 原生 Function Calling，不再依赖正则解析
 *
 * 工作流程:
 *   1. 用户提问 + 工具定义 → 发给 LLM
 *   2. LLM 决定: 直接回答(content) / 调用工具(tool_calls)
 *   3. 如果调用工具 → 执行工具 → 将结果反馈给 LLM → 回到步骤 2
 *   4. 如果直接回答 → 输出结果
 *   5. 最多循环 maxIterations 次，防止死循环
 */

const LLMService = require('../services/llm')
const prompts = require('./prompts')

class AgentEngine {
    /**
     * @param {object} options
     * @param {LLMService} options.llm - LLM 服务实例
     * @param {Array} options.tools - 工具定义数组
     * @param {number} options.maxIterations - 最大推理轮次，默认 8
     */
    constructor({ llm, tools, maxIterations = 8 }) {
        this.llm = llm || new LLMService()
        this.tools = tools || []
        this.toolMap = Object.fromEntries(this.tools.map(t => [t.name, t]))
        this.maxIterations = maxIterations
    }

    /**
     * 将内部工具定义转为 OpenAI Function Calling 格式
     */
    getOpenAITools() {
        return this.tools.map(t => ({
            type: 'function',
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters,
            },
        }))
    }

    /**
     * 执行 Agent 分析（非流式）
     * @param {string} userQuery - 用户问题
     * @param {object} context - 额外上下文
     * @returns {Promise<object>} 分析结果
     */
    async run(userQuery, context = {}) {
        const messages = [
            { role: 'system', content: this.buildSystemPrompt() },
            { role: 'user', content: this.buildUserMessage(userQuery, context) },
        ]
        const tools = this.getOpenAITools()
        const steps = []

        for (let i = 0; i < this.maxIterations; i++) {
            // 1. 调用 LLM（传入工具定义）
            const message = await this.llm.chat(messages, { tools })

            // 2. 检查是否有工具调用（原生 tool_calls 字段）
            if (message.tool_calls) {
                // 3. 把 assistant 的 tool_calls 消息加入对话历史
                messages.push(message)

                // 4. 逐个执行工具，结果作为 tool role 消息回传
                for (const tc of message.tool_calls) {
                    const name = tc.function.name
                    let args = {}
                    try { args = JSON.parse(tc.function.arguments) } catch {}

                    steps.push({ type: 'tool_call', name, args })

                    let toolResult
                    try {
                        const tool = this.toolMap[name]
                        toolResult = await tool.execute(args)
                    } catch (e) {
                        toolResult = { error: e.message }
                    }

                    steps.push({ type: 'tool_result', name, result: toolResult })

                    // Function Calling 要求用 tool role 回传结果
                    messages.push({
                        role: 'tool',
                        tool_call_id: tc.id,
                        content: JSON.stringify(toolResult),
                    })
                }
                // 继续下一轮，让 LLM 根据工具结果决定下一步
                continue
            }

            // 5. 没有工具调用，LLM 给出了最终回答
            const answer = message.content || ''
            steps.push({ type: 'answer', content: answer })
            return { answer, steps, iterations: i + 1 }
        }

        // 超过最大轮次
        const fallbackAnswer = '分析轮次已达上限，请尝试缩小分析范围或更具体地描述问题。'
        steps.push({ type: 'answer', content: fallbackAnswer })
        return { answer: fallbackAnswer, steps, iterations: this.maxIterations }
    }

    /**
     * 执行 Agent 分析（流式输出）
     * @param {string} userQuery
     * @param {object} context
     * @returns {AsyncGenerator<object>} 逐步输出
     */
    async *runStream(userQuery, context = {}) {
        const messages = [
            { role: 'system', content: this.buildSystemPrompt() },
            { role: 'user', content: this.buildUserMessage(userQuery, context) },
        ]
        const tools = this.getOpenAITools()

        for (let i = 0; i < this.maxIterations; i++) {
            // 流式调用 LLM
            let fullMessage = null
            for await (const chunk of this.llm.chatStream(messages, { tools })) {
                if (chunk.type === 'content') {
                    yield { type: 'chunk', content: chunk.content }
                }
                if (chunk.done) {
                    fullMessage = chunk.message
                }
            }

            if (!fullMessage) {
                yield { type: 'error', content: 'LLM 未返回有效响应' }
                return
            }

            // 检查是否有工具调用
            if (fullMessage.tool_calls) {
                // 把 assistant 的 tool_calls 消息加入历史
                messages.push(fullMessage)

                for (const tc of fullMessage.tool_calls) {
                    const name = tc.function.name
                    let args = {}
                    try { args = JSON.parse(tc.function.arguments) } catch {}

                    yield { type: 'tool_call', name, args }

                    let toolResult
                    try {
                        const tool = this.toolMap[name]
                        toolResult = await tool.execute(args)
                    } catch (e) {
                        toolResult = { error: e.message }
                    }

                    yield { type: 'tool_result', name, result: toolResult }

                    messages.push({
                        role: 'tool',
                        tool_call_id: tc.id,
                        content: JSON.stringify(toolResult),
                    })
                }
                // 继续下一轮
                continue
            }

            // 没有工具调用，输出最终回答
            yield { type: 'answer', content: fullMessage.content || '' }
            return
        }

        yield { type: 'answer', content: '分析轮次已达上限，请尝试缩小分析范围。' }
    }

    /**
     * 构建系统提示词
     * 工具描述已通过 Function Calling 传给 API，这里只保留分析指南
     */
    buildSystemPrompt() {
        return prompts.systemPrompt
    }

    /**
     * 构建用户消息（注入上下文）
     */
    buildUserMessage(query, context) {
        let msg = query
        const contextParts = []
        if (context.timeRange) {
            contextParts.push(`时间范围: ${context.timeRange.start} ~ ${context.timeRange.end}`)
        }
        if (context.pageURL) {
            contextParts.push(`目标页面: ${context.pageURL}`)
        }
        if (contextParts.length > 0) {
            msg += `\n\n[上下文]\n${contextParts.join('\n')}`
        }
        return msg
    }

    /**
     * 获取 Agent 状态信息
     */
    getInfo() {
        return {
            tools: this.tools.map(t => ({ name: t.name, description: t.description })),
            maxIterations: this.maxIterations,
            llm: {
                model: this.llm.model,
                provider: this.llm.config.provider,
            },
        }
    }
}

module.exports = AgentEngine
