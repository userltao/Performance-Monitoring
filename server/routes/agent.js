/**
 * Agent API 路由
 * 提供 AI 分析、健康检查、报告生成等接口
 */

const express = require('express')
const { flattenData } = require('../agent/tools')
const { detectAnomalies } = require('../agent/anomaly')

/**
 * 创建 Agent 路由
 * @param {AgentEngine} agentEngine - Agent 引擎实例
 * @param {Array} monitorDataStore - 数据存储数组引用
 * @returns {express.Router}
 */
function createAgentRoutes(agentEngine, monitorDataStore) {
    const router = express.Router()

    /**
     * POST /agent/analyze
     * 一次性分析（等待完整结果返回）
     * Body: { query: string, context?: { timeRange?, pageURL? } }
     */
    router.post('/analyze', async (req, res) => {
        const { query, context } = req.body

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: '请提供分析问题 (query)' })
        }

        try {
            const result = await agentEngine.run(query, context || {})
            res.json({
                success: true,
                answer: result.answer,
                iterations: result.iterations,
                steps: result.steps,
            })
        } catch (e) {
            console.error('Agent 分析失败:', e)
            res.status(500).json({ error: `分析失败: ${e.message}` })
        }
    })

    /**
     * GET /agent/analyze/stream
     * SSE 流式分析（实时输出推理过程）
     * Query: query, context (JSON string)
     */
    router.get('/analyze/stream', async (req, res) => {
        const { query, context } = req.query

        if (!query) {
            return res.status(400).json({ error: '请提供分析问题 (query)' })
        }

        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no')

        try {
            const parsedContext = context ? JSON.parse(context) : {}
            for await (const step of agentEngine.runStream(query, parsedContext)) {
                res.write(`data: ${JSON.stringify(step)}\n\n`)
            }
            res.write('data: [DONE]\n\n')
        } catch (e) {
            console.error('Agent 流式分析失败:', e)
            res.write(`data: ${JSON.stringify({ type: 'error', content: e.message })}\n\n`)
        }

        res.end()
    })

    /**
     * GET /agent/health
     * 快速健康检查（纯规则层，不调用 LLM，零成本）
     */
    router.get('/health', (req, res) => {
        try {
            const result = detectAnomalies(monitorDataStore, 'all', 'medium')
            res.json(result)
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    })

    /**
     * GET /agent/info
     * 获取 Agent 配置信息（可用工具列表、模型信息等）
     */
    router.get('/info', (req, res) => {
        try {
            const info = agentEngine.getInfo()
            res.json(info)
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    })

    /**
     * POST /agent/report
     * 生成结构化分析报告（调用 LLM 汇总分析）
     * Body: { timeRange?, pageURL? }
     */
    router.post('/report', async (req, res) => {
        const { timeRange, pageURL } = req.body || {}

        try {
            // 收集各维度数据
            const allItems = flattenData(monitorDataStore)
            const errors = allItems.filter(i => i.type === 'error')
            const perf = allItems.filter(i => i.type === 'performance')
            const behavior = allItems.filter(i => i.type === 'behavior')
            const anomalies = detectAnomalies(monitorDataStore, 'all', 'medium')

            const query = `请根据以下监控数据生成一份完整的分析报告。

## 数据概览
- 总数据量: ${allItems.length} 条
- 错误: ${errors.length} 条
- 性能指标: ${perf.length} 条
- 用户行为: ${behavior.length} 条

## 异常检测结果
${JSON.stringify(anomalies, null, 2)}

## 错误子类型分布
${JSON.stringify(getDistribution(errors, 'subType'), null, 2)}

## 性能子类型分布
${JSON.stringify(getDistribution(perf, 'subType'), null, 2)}

请输出结构化的分析报告，包含：
1. 整体健康评分（A/B/C/D/F）
2. 关键问题列表（按严重程度排序）
3. 性能指标分析
4. 错误趋势分析
5. 优化建议（按优先级排序）`

            const context = {}
            if (timeRange) context.timeRange = timeRange
            if (pageURL) context.pageURL = pageURL

            const result = await agentEngine.run(query, context)
            res.json({ success: true, report: result.answer })
        } catch (e) {
            console.error('报告生成失败:', e)
            res.status(500).json({ error: `报告生成失败: ${e.message}` })
        }
    })

    return router
}

/**
 * 统计字段分布
 */
function getDistribution(items, field) {
    const counts = {}
    for (const item of items) {
        const val = item[field] || 'unknown'
        counts[val] = (counts[val] || 0) + 1
    }
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => ({ [field]: key, count }))
}

module.exports = createAgentRoutes
