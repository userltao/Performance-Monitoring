/**
 * Agent 工具集 —— 每个工具包含 name/description/parameters/execute
 * Agent 引擎会把工具定义发给 LLM，由 LLM 决定调用哪个工具
 */

/**
 * 将 monitorDataStore 中的嵌套数据展平为事件列表
 */
function flattenData(storeItems) {
    const result = []
    for (const item of storeItems) {
        const ts = item.timestamp
        const d = item.data
        if (Array.isArray(d.data)) {
            for (const ev of d.data) {
                result.push({ timestamp: ts, appID: d.appID, userID: d.userID, ...ev })
            }
        } else {
            result.push({ timestamp: ts, appID: d.appID, userID: d.userID, ...d.data })
        }
    }
    return result
}

/**
 * 计算数值数组的统计指标
 */
function computeNumericStats(values) {
    if (!values.length) return null
    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const avg = sum / sorted.length
    const p50 = sorted[Math.floor(sorted.length * 0.5)]
    const p90 = sorted[Math.floor(sorted.length * 0.9)]
    const p99 = sorted[Math.floor(sorted.length * 0.99)]
    return {
        count: sorted.length,
        avg: Math.round(avg * 100) / 100,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: Math.round(p50 * 100) / 100,
        p90: Math.round(p90 * 100) / 100,
        p99: Math.round(p99 * 100) / 100,
    }
}

/**
 * 创建工具集
 * @param {Array} monitorDataStore - server.js 中的数据存储数组引用
 * @returns {Array} 工具定义数组
 */
function createTools(monitorDataStore) {
    return [
        // ─── 工具 1: 查询错误 ───
        {
            name: 'query_errors',
            description: '查询错误数据，支持按子类型(js/promise/resource/vue/console-error)、时间范围、页面URL过滤。返回错误列表和总数。',
            parameters: {
                type: 'object',
                properties: {
                    subType: {
                        type: 'string',
                        enum: ['js', 'promise', 'resource', 'vue', 'console-error'],
                        description: '错误子类型',
                    },
                    pageURL: {
                        type: 'string',
                        description: '页面URL，支持模糊匹配',
                    },
                    startTime: {
                        type: 'string',
                        description: '起始时间 ISO 格式，如 2024-01-01T00:00:00Z',
                    },
                    endTime: {
                        type: 'string',
                        description: '结束时间 ISO 格式',
                    },
                    limit: {
                        type: 'number',
                        description: '返回条数上限，默认 50',
                    },
                },
            },
            execute({ subType, pageURL, startTime, endTime, limit = 50 } = {}) {
                let items = flattenData(monitorDataStore).filter(i => i.type === 'error')

                if (subType) items = items.filter(i => i.subType === subType)
                if (pageURL) items = items.filter(i => (i.pageURL || '').includes(pageURL))
                if (startTime) items = items.filter(i => i.timestamp >= startTime)
                if (endTime) items = items.filter(i => i.timestamp <= endTime)

                // 按时间倒序
                items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))

                return {
                    total: items.length,
                    items: items.slice(0, limit),
                }
            },
        },

        // ─── 工具 2: 查询性能指标 ───
        {
            name: 'query_performance',
            description: '查询性能指标数据，支持按子类型过滤。可用子类型: largest-contentful-paint(lcp), layout-shift(cls), first-input(fid), fps, first-paint(fp), first-contentful-paint(fcp), resource, navigation, load, domcontentloaded, xhr, fetch, performance-score。返回指标数据和统计摘要(avg/p50/p90/p99)。',
            parameters: {
                type: 'object',
                properties: {
                    subType: {
                        type: 'string',
                        description: '性能子类型，如 largest-contentful-paint, layout-shift, first-input, fps 等',
                    },
                    pageURL: {
                        type: 'string',
                        description: '页面URL，支持模糊匹配',
                    },
                    startTime: {
                        type: 'string',
                        description: '起始时间 ISO 格式',
                    },
                    endTime: {
                        type: 'string',
                        description: '结束时间 ISO 格式',
                    },
                    limit: {
                        type: 'number',
                        description: '返回条数上限，默认 100',
                    },
                },
            },
            execute({ subType, pageURL, startTime, endTime, limit = 100 } = {}) {
                let items = flattenData(monitorDataStore).filter(i => i.type === 'performance')

                if (subType) items = items.filter(i => i.subType === subType)
                if (pageURL) items = items.filter(i => (i.pageURL || '').includes(pageURL))
                if (startTime) items = items.filter(i => i.timestamp >= startTime)
                if (endTime) items = items.filter(i => i.timestamp <= endTime)

                // 自动提取数值字段做统计
                const stats = {}
                const numericFields = ['LCP', 'CLS', 'FID', 'FP', 'FCP', 'duration', 'value', 'score', 'FPS']
                for (const field of numericFields) {
                    const values = items.map(i => i[field]).filter(v => typeof v === 'number')
                    if (values.length > 0) {
                        stats[field] = computeNumericStats(values)
                    }
                }

                return {
                    total: items.length,
                    stats,
                    items: items.slice(0, limit),
                }
            },
        },

        // ─── 工具 3: 获取性能评分 ───
        {
            name: 'get_performance_score',
            description: '获取页面综合性能评分(0-100)及各指标评级(good/needs-improvement/poor)。评分基于 LCP/FID/CLS 的加权计算。',
            parameters: {
                type: 'object',
                properties: {
                    pageURL: {
                        type: 'string',
                        description: '页面URL，不传则返回所有页面的评分',
                    },
                },
            },
            execute({ pageURL } = {}) {
                let items = flattenData(monitorDataStore)
                    .filter(i => i.type === 'performance' && i.subType === 'performance-score')

                if (pageURL) items = items.filter(i => (i.pageURL || '').includes(pageURL))

                if (items.length === 0) {
                    return { message: '暂无性能评分数据，可能尚未收集到足够的 Web Vitals 指标' }
                }

                const latest = items[items.length - 1]
                return {
                    score: latest.score,
                    rating: latest.score >= 90 ? 'good' : latest.score >= 50 ? 'needs-improvement' : 'poor',
                    details: latest,
                    historyCount: items.length,
                }
            },
        },

        // ─── 工具 4: 错误聚类分析 ───
        {
            name: 'analyze_error_pattern',
            description: '分析错误聚类模式：按错误消息+页面+行号聚合，找出高频错误 Top N。适合快速定位最严重的问题。',
            parameters: {
                type: 'object',
                properties: {
                    topN: {
                        type: 'number',
                        description: '返回前 N 个高频错误，默认 10',
                    },
                    timeWindow: {
                        type: 'number',
                        description: '时间窗口（分钟），默认 60',
                    },
                },
            },
            execute({ topN = 10, timeWindow = 60 } = {}) {
                const cutoff = new Date(Date.now() - timeWindow * 60 * 1000).toISOString()
                const errors = flattenData(monitorDataStore)
                    .filter(i => i.type === 'error' && i.timestamp >= cutoff)

                if (errors.length === 0) {
                    return { message: `最近 ${timeWindow} 分钟内无错误数据` }
                }

                // 按 错误消息+页面+行号 聚合
                const clusters = {}
                for (const err of errors) {
                    const key = [
                        err.msg || err.error || err.reason || '',
                        err.pageURL || '',
                        err.line || '',
                    ].join('|')

                    if (!clusters[key]) {
                        clusters[key] = {
                            fingerprint: key,
                            count: 0,
                            pages: new Set(),
                            sample: err,
                            firstSeen: err.timestamp,
                            lastSeen: err.timestamp,
                        }
                    }
                    clusters[key].count++
                    if (err.pageURL) clusters[key].pages.add(err.pageURL)
                    if (err.timestamp > clusters[key].lastSeen) clusters[key].lastSeen = err.timestamp
                }

                const ranked = Object.values(clusters)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, topN)
                    .map(c => ({
                        count: c.count,
                        affectedPages: [...c.pages],
                        firstSeen: c.firstSeen,
                        lastSeen: c.lastSeen,
                        sample: {
                            subType: c.sample.subType,
                            msg: c.sample.msg || c.sample.error || c.sample.reason,
                            pageURL: c.sample.pageURL,
                            line: c.sample.line,
                            column: c.sample.column,
                        },
                    }))

                return {
                    timeWindow,
                    totalErrors: errors.length,
                    uniquePatterns: Object.keys(clusters).length,
                    topErrors: ranked,
                }
            },
        },

        // ─── 工具 5: 用户行为分析 ───
        {
            name: 'analyze_user_behavior',
            description: '分析用户行为数据。type 可选: pv(页面访问统计)、click(点击行为)、duration(停留时长分布)、scroll(滚动深度分布)。',
            parameters: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['pv', 'click', 'duration', 'scroll'],
                        description: '行为类型',
                    },
                    pageURL: {
                        type: 'string',
                        description: '页面URL，支持模糊匹配',
                    },
                },
            },
            execute({ type, pageURL } = {}) {
                let behaviors = flattenData(monitorDataStore).filter(i => i.type === 'behavior')
                if (pageURL) behaviors = behaviors.filter(i => (i.pageURL || '').includes(pageURL))

                if (type === 'pv') {
                    const pvData = behaviors.filter(i => i.subType === 'pv')
                    const pageCounts = {}
                    for (const pv of pvData) {
                        const url = pv.pageURL || 'unknown'
                        pageCounts[url] = (pageCounts[url] || 0) + 1
                    }
                    return {
                        totalPV: pvData.length,
                        uniquePages: Object.keys(pageCounts).length,
                        topPages: Object.entries(pageCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 20)
                            .map(([url, count]) => ({ url, count })),
                    }
                }

                if (type === 'click') {
                    const clicks = behaviors.filter(i => i.subType === 'click')
                    // 按点击目标元素聚合
                    const targetCounts = {}
                    for (const c of clicks) {
                        const target = c.target || c.outerHTML?.substring(0, 60) || 'unknown'
                        targetCounts[target] = (targetCounts[target] || 0) + 1
                    }
                    return {
                        totalClicks: clicks.length,
                        topTargets: Object.entries(targetCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 20)
                            .map(([target, count]) => ({ target, count })),
                    }
                }

                if (type === 'duration') {
                    const durations = behaviors
                        .filter(i => i.subType === 'page-access-duration')
                        .map(i => i.duration)
                        .filter(v => typeof v === 'number')
                    return {
                        total: durations.length,
                        stats: computeNumericStats(durations),
                        unit: 'ms',
                    }
                }

                if (type === 'scroll') {
                    const scrolls = behaviors
                        .filter(i => i.subType === 'page-access-height')
                        .map(i => i.scrollDepth != null ? i.scrollDepth : i.maxScrollDepth)
                        .filter(v => typeof v === 'number')
                    return {
                        total: scrolls.length,
                        stats: computeNumericStats(scrolls),
                        unit: '%',
                    }
                }

                // 不指定 type，返回概览
                const subTypeCounts = {}
                for (const b of behaviors) {
                    const st = b.subType || 'unknown'
                    subTypeCounts[st] = (subTypeCounts[st] || 0) + 1
                }
                return {
                    total: behaviors.length,
                    breakdown: subTypeCounts,
                }
            },
        },

        // ─── 工具 6: 异常检测 ───
        {
            name: 'detect_anomalies',
            description: '基于统计方法检测异常指标。检测错误率突增、LCP/CLS/FID 劣化、FPS 骤降等。返回异常列表和严重程度。',
            parameters: {
                type: 'object',
                properties: {
                    metric: {
                        type: 'string',
                        enum: ['error_rate', 'lcp', 'cls', 'fid', 'fps', 'all'],
                        description: '要检测的指标，默认 all',
                    },
                    sensitivity: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                        description: '灵敏度，low=3σ, medium=2σ, high=1.5σ',
                    },
                },
            },
            execute({ metric = 'all', sensitivity = 'medium' } = {}) {
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
                        const counts = windows.slice(0, -1) // 排除当前不完整窗口
                        const mean = counts.reduce((a, b) => a + b, 0) / counts.length
                        const std = Math.sqrt(counts.reduce((s, v) => s + (v - mean) ** 2, 0) / counts.length)
                        const latest = windows[windows.length - 2] // 最近一个完整窗口
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
                    const lcpValues = allItems
                        .filter(i => i.subType === 'largest-contentful-paint')
                        .map(i => i.LCP)
                        .filter(v => typeof v === 'number')
                    const anomaly = detectMetricAnomaly(lcpValues, 'LCP', sigma, 2500, 4000)
                    if (anomaly) anomalies.push(anomaly)
                }

                // CLS 异常
                if (metric === 'cls' || metric === 'all') {
                    const clsValues = allItems
                        .filter(i => i.subType === 'layout-shift')
                        .map(i => i.CLS)
                        .filter(v => typeof v === 'number')
                    const anomaly = detectMetricAnomaly(clsValues, 'CLS', sigma, 0.1, 0.25)
                    if (anomaly) anomalies.push(anomaly)
                }

                // FID 异常
                if (metric === 'fid' || metric === 'all') {
                    const fidValues = allItems
                        .filter(i => i.subType === 'first-input')
                        .map(i => i.FID)
                        .filter(v => typeof v === 'number')
                    const anomaly = detectMetricAnomaly(fidValues, 'FID', sigma, 100, 300)
                    if (anomaly) anomalies.push(anomaly)
                }

                // FPS 异常
                if (metric === 'fps' || metric === 'all') {
                    const fpsValues = allItems
                        .filter(i => i.subType === 'fps')
                        .map(i => i.FPS)
                        .filter(v => typeof v === 'number')
                    if (fpsValues.length >= 5) {
                        const mean = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length
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
            },
        },
    ]
}

/**
 * 检测单个指标的异常
 */
function detectMetricAnomaly(values, name, sigma, goodThreshold, poorThreshold) {
    if (values.length < 5) return null

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length)
    const latest = values[values.length - 1]

    // 检测是否超过统计阈值
    const isSpike = std > 0 && latest > mean + sigma * std
    // 检测是否超过 Web Vitals 标准
    const isPoor = latest > poorThreshold
    const isBad = latest > goodThreshold

    if (isSpike || isPoor) {
        const severity = isPoor ? 'critical' : isSpike ? 'warning' : 'info'
        return {
            metric: name,
            severity,
            current: Math.round(latest * 100) / 100,
            baseline: Math.round(mean * 100) / 100,
            threshold: Math.round((mean + sigma * std) * 100) / 100,
            rating: isPoor ? 'poor' : isBad ? 'needs-improvement' : 'good',
            message: `${name} 最新值 ${Math.round(latest)}，基线 ${Math.round(mean)}，评级: ${isPoor ? '差' : isBad ? '需改进' : '好'}`,
        }
    }
    return null
}

module.exports = { createTools, flattenData }
