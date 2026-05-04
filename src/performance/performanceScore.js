import { getPageURL } from '../utils/utils'
import { lazyReportCache } from '../utils/report'

// Web Vitals 评分阈值 (基于 Google 标准)
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
}

// 指标权重 (Google 推荐)
const WEIGHTS = {
    LCP: 0.3,
    FID: 0.3,
    CLS: 0.4,
}

// 存储各指标的最新值
const metrics = {
    LCP: null,
    FID: null,
    CLS: null,
}

/**
 * 计算单个指标的分数 (0-100)
 * 使用分段线性插值
 * @param {number} value - 指标值
 * @param {Object} threshold - 阈值配置 { good, poor }
 * @returns {number} 分数 (0-100)
 */
export function calculateMetricScore(value, threshold) {
    if (value <= threshold.good) {
        return 100
    }
    if (value >= threshold.poor) {
        return 0
    }
    // 线性插值: good=100分, poor=0分
    const score = 100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 100
    return Math.round(score * 100) / 100
}

/**
 * 计算综合性能分数
 * @returns {Object} 评分结果
 */
export function calculatePerformanceScore() {
    const { LCP, FID, CLS } = metrics

    // 如果没有任何指标数据，返回 null
    if (LCP === null && FID === null && CLS === null) {
        return null
    }

    const scores = {}
    let totalWeight = 0
    let weightedSum = 0

    // 计算各指标分数
    if (LCP !== null) {
        scores.LCP = calculateMetricScore(LCP, THRESHOLDS.LCP)
        weightedSum += scores.LCP * WEIGHTS.LCP
        totalWeight += WEIGHTS.LCP
    }

    if (FID !== null) {
        scores.FID = calculateMetricScore(FID, THRESHOLDS.FID)
        weightedSum += scores.FID * WEIGHTS.FID
        totalWeight += WEIGHTS.FID
    }

    if (CLS !== null) {
        scores.CLS = calculateMetricScore(CLS, THRESHOLDS.CLS)
        weightedSum += scores.CLS * WEIGHTS.CLS
        totalWeight += WEIGHTS.CLS
    }

    // 按实际有权重的比例计算综合分数
    const totalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0

    // 获取评级
    const rating = getRating(totalScore)

    return {
        totalScore,
        rating,
        scores,
        metrics: { LCP, FID, CLS },
        weights: WEIGHTS,
    }
}

/**
 * 根据分数获取评级
 * @param {number} score - 综合分数 (0-100)
 * @returns {string} 评级: 'good' | 'needs-improvement' | 'poor'
 */
export function getRating(score) {
    if (score >= 90) return 'good'
    if (score >= 50) return 'needs-improvement'
    return 'poor'
}

/**
 * 更新指标值
 * @param {string} metricName - 指标名称 (LCP/FID/CLS)
 * @param {number} value - 指标值
 */
export function updateMetric(metricName, value) {
    if (metricName in metrics) {
        metrics[metricName] = value
    }
}

/**
 * 获取当前存储的指标值
 * @returns {Object} 指标值
 */
export function getMetrics() {
    return { ...metrics }
}

/**
 * 重置所有指标 (用于测试或页面重新加载)
 */
export function resetMetrics() {
    metrics.LCP = null
    metrics.FID = null
    metrics.CLS = null
}

/**
 * 初始化性能评分监听
 * 监听 LCP/FID/CLS 事件并计算综合分数
 */
export default function observePerformanceScore() {
    // 监听自定义事件来获取指标值
    const originalReport = lazyReportCache

    // 使用 PerformanceObserver 监听 LCP
    if (window.PerformanceObserver) {
        try {
            // 监听 LCP
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                const lastEntry = entries[entries.length - 1]
                if (lastEntry) {
                    updateMetric('LCP', lastEntry.startTime)
                    reportScore()
                }
            })
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

            // 监听 FID
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries()
                if (entries.length > 0) {
                    updateMetric('FID', entries[0].duration)
                    reportScore()
                }
            })
            fidObserver.observe({ type: 'first-input', buffered: true })

            // 监听 CLS
            let clsValue = 0
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value
                        updateMetric('CLS', clsValue)
                        reportScore()
                    }
                }
            })
            clsObserver.observe({ type: 'layout-shift', buffered: true })
        } catch (e) {
            // 静默处理不支持的浏览器
        }
    }

    // 监听页面隐藏时上报最终分数
    const onHidden = () => {
        if (document.visibilityState === 'hidden') {
            reportScore(true)
        }
    }
    document.addEventListener('visibilitychange', onHidden, { once: true })

    // 监听页面卸载时上报
    window.addEventListener('beforeunload', () => {
        reportScore(true)
    }, { once: true })
}

/**
 * 上报性能分数
 * @param {boolean} isImmediate - 是否立即上报
 */
function reportScore(isImmediate = false) {
    const scoreData = calculatePerformanceScore()
    if (scoreData) {
        const reportData = {
            ...scoreData,
            subType: 'performance-score',
            name: 'performance-score',
            type: 'performance',
            pageURL: getPageURL(),
        }

        if (isImmediate) {
            // 使用 report 直接上报
            const { report } = require('../utils/report')
            report(reportData, true)
        } else {
            lazyReportCache(reportData)
        }
    }
}
