require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.text())

// 存储监控数据
const monitorDataStore = []

// SSE 客户端列表
const sseClients = new Set()

// 广播新数据给所有 SSE 客户端
function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of sseClients) {
        client.write(payload)
    }
}

app.post('/reportData', (req, res) => {
    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        console.log('上报数据:', JSON.stringify(data, null, 2))
        const record = {
            timestamp: new Date().toISOString(),
            data: data
        }
        monitorDataStore.push(record)
        // 实时推送给所有 Dashboard
        broadcast('newData', record)
    } catch (e) {
        console.error('数据解析失败:', e)
    }
    res.status(200).send('')
})

// 获取所有监控数据
app.get('/getMonitorData', (req, res) => {
    res.status(200).json({
        success: true,
        data: monitorDataStore
    })
})

// SSE 实时推送端点
app.get('/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })
    res.write(': connected\n\n')

    sseClients.add(res)

    // 心跳，防止连接被代理/浏览器断开
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000)

    req.on('close', () => {
        clearInterval(heartbeat)
        sseClients.delete(res)
    })
})

// 清空监控数据
app.post('/clearMonitorData', (req, res) => {
    monitorDataStore.length = 0
    broadcast('clear', {})
    res.status(200).json({
        success: true,
        message: '数据已清空'
    })
})

// 数据看板页面（静态 HTML 模板）
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'))
})

// ──────────────────────────────────────────────
// AI Agent 集成
// ──────────────────────────────────────────────
const LLMService = require('./server/services/llm')
const AgentEngine = require('./server/agent/engine')
const { createTools } = require('./server/agent/tools')
const createAgentRoutes = require('./server/routes/agent')

// 初始化 LLM 服务（通过环境变量配置）
const llm = new LLMService({
    provider: process.env.LLM_PROVIDER || 'openai',
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    apiKey: process.env.LLM_API_KEY || '',
    baseURL: process.env.LLM_BASE_URL || '',
})

// 创建 Agent 工具集（传入数据存储引用）
const tools = createTools(monitorDataStore)

// 创建 Agent 引擎
const agentEngine = new AgentEngine({ llm, tools })

// 注册 Agent 路由
app.use('/agent', createAgentRoutes(agentEngine, monitorDataStore))

app.listen(8080, () => {
    console.log('server listen on port 8080...')
    console.log('数据看板:   http://localhost:8080/dashboard')
    console.log('AI 分析:    POST http://localhost:8080/agent/analyze')
    console.log('健康检查:   GET  http://localhost:8080/agent/health')
    console.log('Agent 信息: GET  http://localhost:8080/agent/info')
})