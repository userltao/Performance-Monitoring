/**
 * 异常检测模块 —— 基于统计方法的规则层检测
 * 不依赖 LLM，可作为低成本的实时监控
 */

const { flattenData } = require('./tools')

/**
 * 检测异常
 * @param {Array} monitorDataStore - 数据存储
 * @param {string} metric - 检测指标: error_rate | lcp | cls | fid | fps | all
 * @param {string} sensitivity - 灵敏度: low(3σ) | medium(2σ) | high(1.5σ)
 * @returns {object} { anomalies: [], summary: string }
 */
function detectAnomalies(monitorDataStore, metric = 'all', sensitivity = 'medium') {
    const allItems = flattenData(monitorDataStore)
    const anomalies = []

    const sigmaMap = { low: 3, medium: 2, high: 1.5 }
    const sigma = sigmaMap[sensitivity] || 2

    // 错误率异常（按5分钟窗口）
    if (metric === 'error_rate' || metric === 'all') {
        const errors = allItems.filter(i => i.type === 'error')
        const windowMs = 5 * 60 * 1000
        const windows = []
        const now = Date.now()

        for (let t = now - 60 * 60 * 1000; t < now; t += windowMs) {
            const count = errors.filter(i => {
                const ts = new Date(i.timestamp).getTime()
                return ts >= t && ts < t + windowMs
            }).length
            windows.push(count)
        }

        if (windows.length >= 5) {
            const counts = windows.slice(0, -1)
            const mean = counts.reduce((a, b) => a + b, 0) / counts.length
            const std = Math.sqrt(counts.reduce((s, v) => s + (v - mean) ** 2, 0) / counts.length)
            const latest = windows[windows.length - 2]

            if (latest > mean + sigma * std && std > 0) {
                anomalies.push({
                    metric: 'error_rate',
                    severity: latest > mean + 3 * std ? 'critical' : 'warning',
                    current: latest,
                    baseline: Math.round(mean * 100) / 100,
                    threshold: Math.round((mean + sigma * std) * 100) / 100,
                    message: `错误数从基线 ${Math.round(mean)} 突增至 ${latest}（最近5分钟窗口）`,
                })
            }
        }
    }

    // LCP 异常
    if (metric === 'lcp' || metric === 'all') {
        const values = allItems
            .filter(i => i.subType === 'largest-contentful-paint')
            .map(i => i.LCP)
            .filter(v => typeof v === 'number')
        const anomaly = detectMetricAnomaly(values, 'LCP', sigma, 2500, 4000)
        if (anomaly) anomalies.push(anomaly)
    }

    // CLS 异常
    if (metric === 'cls' || metric === 'all') {
        const values = allItems
            .filter(i => i.subType === 'layout-shift')
            .map(i => i.CLS)
            .filter(v => typeof v === 'number')
        const anomaly = detectMetricAnomaly(values, 'CLS', sigma, 0.1, 0.25)
        if (anomaly) anomalies.push(anomaly)
    }

    // FID 异常
    if (metric === 'fid' || metric === 'all') {
        const values = allItems
            .filter(i => i.subType === 'first-input')
            .map(i => i.FID)
            .filter(v => typeof v === 'number')
        const anomaly = detectMetricAnomaly(values, 'FID', sigma, 100, 300)
        if (anomaly) anomalies.push(anomaly)
    }

    // FPS 异常
    if (metric === 'fps' || metric === 'all') {
        const values = allItems
            .filter(i => i.subType === 'fps')
            .map(i => i.FPS)
            .filter(v => typeof v === 'number')

        if (values.length >= 5) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length
            if (mean < 30) {
                anomalies.push({
                    metric: 'FPS',
                    severity: mean < 20 ? 'critical' : 'warning',
                    current: Math.round(mean * 100) / 100,
                    baseline: null,
                    message: `FPS 均值仅 ${Math.round(mean)}，页面存在严重卡顿（标准 >= 50）`,
                })
            }
        }
    }

    return {
        anomalies,
        summary: anomalies.length === 0
            ? '✅ 所有指标正常，未检测到异常'
            : `⚠️ 检测到 ${anomalies.length} 个异常`,
    }
}

/**
 * 检测单个指标的异常
 */
function detectMetricAnomaly(values, name, sigma, goodThreshold, poorThreshold) {
    if (values.length < 5) return null

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
    const latest = values[values.length - 1]

    const isSpike = std > 0 && latest > mean + sigma * std
    const isPoor = latest > poorThreshold
    const isBad = latest > goodThreshold

    if (isSpike || isPoor) {
        return {
            metric: name,
            severity: isPoor ? 'critical' : isSpike ? 'warning' : 'info',
            current: Math.round(latest * 100) / 100,
            baseline: Math.round(mean * 100) / 100,
            threshold: Math.round((mean + sigma * std) * 100) / 100,
            rating: isPoor ? 'poor' : isBad ? 'needs-improvement' : 'good',
            message: `${name} 最新值 ${Math.round(latest)}，基线 ${Math.round(mean)}，评级: ${isPoor ? '差' : isBad ? '需改进' : '好'}`,
        }
    }

    return null
}

module.exports = { detectAnomalies }
