const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.text())

// 存储监控数据
const monitorDataStore = []

app.post('/reportData', (req, res) => {
    console.log(req.body.length)
    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        monitorDataStore.push({
            timestamp: new Date().toISOString(),
            data: data
        })
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

// 清空监控数据
app.post('/clearMonitorData', (req, res) => {
    monitorDataStore.length = 0
    res.status(200).json({
        success: true,
        message: '数据已清空'
    })
})

app.listen(8080, () => {
    console.log('server listen on port 8080...')
})