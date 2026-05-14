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
    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
        console.log('上报数据:', JSON.stringify(data, null, 2))
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

// 数据看板页面
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>Monitor Dashboard</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; color: #333; }
.header { background: #1a1a2e; color: #fff; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { font-size: 18px; }
.header .actions { display: flex; gap: 8px; }
.header button { padding: 6px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-refresh { background: #1890ff; color: #fff; }
.btn-clear { background: #ff4d4f; color: #fff; }
.btn-refresh:hover { background: #40a9ff; }
.btn-clear:hover { background: #ff7875; }
.stats { display: flex; gap: 16px; padding: 16px 24px; }
.stat-card { flex: 1; background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-card .label { font-size: 13px; color: #999; margin-bottom: 4px; }
.stat-card .value { font-size: 28px; font-weight: 600; }
.stat-card.error .value { color: #ff4d4f; }
.stat-card.perf .value { color: #52c41a; }
.stat-card.behavior .value { color: #1890ff; }
.stat-card.total .value { color: #722ed1; }
.filters { padding: 0 24px 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.filters select, .filters input { padding: 6px 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; }
.filters input { width: 260px; }
.table-wrap { padding: 0 24px 24px; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
th { background: #fafafa; text-align: left; padding: 10px 12px; font-size: 13px; color: #666; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; }
td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; vertical-align: top; }
tr:hover { background: #f5f5f5; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #fff; }
.tag-error { background: #ff4d4f; }
.tag-perf { background: #52c41a; }
.tag-behavior { background: #1890ff; }
.detail-btn { color: #1890ff; cursor: pointer; border: none; background: none; font-size: 13px; }
.detail-btn:hover { text-decoration: underline; }
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; justify-content: center; align-items: center; }
.modal-overlay.active { display: flex; }
.modal { background: #fff; border-radius: 8px; width: 700px; max-height: 80vh; overflow: auto; padding: 20px; }
.modal h3 { margin-bottom: 12px; }
.modal pre { background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
.modal .close-btn { float: right; cursor: pointer; font-size: 20px; color: #999; }
.empty { text-align: center; padding: 60px; color: #999; font-size: 14px; }
</style>
</head>
<body>
<div class="header">
    <h1>Monitor Dashboard</h1>
    <div class="actions">
        <button class="btn-refresh" onclick="loadData()">刷新数据</button>
        <button class="btn-clear" onclick="clearData()">清空数据</button>
    </div>
</div>
<div class="stats">
    <div class="stat-card total"><div class="label">总数</div><div class="value" id="stat-total">0</div></div>
    <div class="stat-card error"><div class="label">错误</div><div class="value" id="stat-error">0</div></div>
    <div class="stat-card perf"><div class="label">性能</div><div class="value" id="stat-perf">0</div></div>
    <div class="stat-card behavior"><div class="label">行为</div><div class="value" id="stat-behavior">0</div></div>
</div>
<div class="filters">
    <select id="filter-type" onchange="renderTable()">
        <option value="">全部类型</option>
        <option value="error">错误</option>
        <option value="performance">性能</option>
        <option value="behavior">行为</option>
    </select>
    <select id="filter-subtype" onchange="renderTable()">
        <option value="">全部子类型</option>
    </select>
    <input type="text" id="filter-search" placeholder="搜索内容..." oninput="renderTable()">
</div>
<div class="table-wrap">
    <table>
        <thead><tr><th>时间</th><th>类型</th><th>子类型</th><th>页面</th><th>摘要</th><th>操作</th></tr></thead>
        <tbody id="tbody"></tbody>
    </table>
    <div class="empty" id="empty" style="display:none">暂无数据，请先触发一些监控事件</div>
</div>
<div class="modal-overlay" id="modal" onclick="if(event.target===this)closeModal()">
    <div class="modal">
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <h3 id="modal-title">详情</h3>
        <pre id="modal-content"></pre>
    </div>
</div>
<script>
let allItems = [];

async function loadData() {
    const resp = await fetch('/getMonitorData');
    const json = await resp.json();
    allItems = (json.data || []).reverse();
    updateStats();
    updateSubtypes();
    renderTable();
}

function flattenData(storeItems) {
    const result = [];
    for (const item of storeItems) {
        const ts = item.timestamp;
        const d = item.data;
        if (Array.isArray(d.data)) {
            for (const ev of d.data) {
                result.push({ timestamp: ts, appID: d.appID, userID: d.userID, ...ev });
            }
        } else {
            result.push({ timestamp: ts, appID: d.appID, userID: d.userID, ...d.data });
        }
    }
    return result;
}

function updateStats() {
    const items = flattenData(allItems);
    document.getElementById('stat-total').textContent = items.length;
    document.getElementById('stat-error').textContent = items.filter(i => i.type === 'error').length;
    document.getElementById('stat-perf').textContent = items.filter(i => i.type === 'performance').length;
    document.getElementById('stat-behavior').textContent = items.filter(i => i.type === 'behavior').length;
}

function updateSubtypes() {
    const items = flattenData(allItems);
    const subtypes = [...new Set(items.map(i => i.subType).filter(Boolean))];
    const sel = document.getElementById('filter-subtype');
    const current = sel.value;
    sel.innerHTML = '<option value="">全部子类型</option>' + subtypes.map(s => '<option value="'+s+'">'+s+'</option>').join('');
    sel.value = current;
}

function renderTable() {
    const type = document.getElementById('filter-type').value;
    const subtype = document.getElementById('filter-subtype').value;
    const search = document.getElementById('filter-search').value.toLowerCase();
    let items = flattenData(allItems);
    if (type) items = items.filter(i => i.type === type);
    if (subtype) items = items.filter(i => i.subType === subtype);
    if (search) items = items.filter(i => JSON.stringify(i).toLowerCase().includes(search));

    const tbody = document.getElementById('tbody');
    const empty = document.getElementById('empty');
    if (!items.length) { tbody.innerHTML = ''; empty.style.display = ''; return; }
    empty.style.display = 'none';

    tbody.innerHTML = items.map((item, idx) => {
        const typeTag = item.type === 'error' ? 'tag-error' : item.type === 'performance' ? 'tag-perf' : 'tag-behavior';
        const summary = getSummary(item);
        return '<tr>'
            + '<td>' + (item.timestamp ? new Date(item.timestamp).toLocaleString() : '-') + '</td>'
            + '<td><span class="tag ' + typeTag + '">' + (item.type || '-') + '</span></td>'
            + '<td>' + (item.subType || '-') + '</td>'
            + '<td>' + truncate(item.pageURL || '-', 40) + '</td>'
            + '<td>' + truncate(summary, 60) + '</td>'
            + '<td><button class="detail-btn" onclick="showDetail(' + idx + ')">查看详情</button></td>'
            + '</tr>';
    }).join('');
    window._filteredItems = items;
}

function getSummary(item) {
    if (item.msg) return item.msg;
    if (item.error) return item.error.split('\\n')[0];
    if (item.reason) return String(item.reason).split('\\n')[0];
    if (item.url) return item.url;
    if (item.name) return item.name;
    if (item.subType === 'lcp') return 'LCP: ' + (item.LCP || item.value || '-');
    if (item.subType === 'cls') return 'CLS: ' + (item.CLS || item.value || '-');
    if (item.subType === 'fid') return 'FID: ' + (item.FID || item.value || '-');
    if (item.score !== undefined) return 'Score: ' + item.score;
    if (item.duration !== undefined) return 'Duration: ' + item.duration + 'ms';
    return JSON.stringify(item).substring(0, 80);
}

function truncate(str, len) { return str.length > len ? str.substring(0, len) + '...' : str; }

function showDetail(idx) {
    const item = window._filteredItems[idx];
    document.getElementById('modal-title').textContent = (item.subType || item.type || '详情');
    document.getElementById('modal-content').textContent = JSON.stringify(item, null, 2);
    document.getElementById('modal').classList.add('active');
}

function closeModal() { document.getElementById('modal').classList.remove('active'); }

async function clearData() {
    if (!confirm('确定清空所有数据？')) return;
    await fetch('/clearMonitorData', { method: 'POST' });
    loadData();
}

loadData();
setInterval(loadData, 5000);
</script>
</body>
</html>`)
})

app.listen(8080, () => {
    console.log('server listen on port 8080...')
    console.log('数据看板: http://localhost:8080/dashboard')
})