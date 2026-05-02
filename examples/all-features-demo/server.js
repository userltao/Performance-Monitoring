const http = require('http');
const querystring = require('querystring');

const PORT = 8080;

// 存储监控数据
let monitorData = [];

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/reportData') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('\n========== 收到监控数据 ==========');
      console.log('时间:', new Date().toLocaleString());
      console.log('Content-Type:', req.headers['content-type']);

      try {
        // 尝试解析 JSON 数据
        const data = JSON.parse(body);
        console.log('数据类型:', data.type || 'unknown');
        console.log('数据类型:', data.subType || 'unknown');
        console.log('数据内容:', JSON.stringify(data, null, 2));
        
        // 存储数据
        monitorData.push({
          timestamp: Date.now(),
          data: data
        });
      } catch (e) {
        // 如果不是 JSON，尝试作为表单数据解析
        console.log('原始数据:', body);
      }

      console.log('=====================================\n');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: '数据已接收' }));
    });
  } else if (req.url === '/getMonitorData') {
    // 返回监控数据
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: monitorData }));
  } else if (req.url === '/clearMonitorData') {
    // 清空监控数据
    monitorData = [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: '数据已清空' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`监控数据接收服务器运行在 http://localhost:${PORT}`);
  console.log(`SDK 数据上报地址: http://localhost:${PORT}/reportData`);
  console.log('\n等待接收监控数据...\n');
});