import { lazyReportCache, report } from '../utils/report'
import { getUUID } from './utils'
import { onBeforeunload, executeAfterLoad, getPageURL } from '../utils/utils'

let timer           // 滚动防抖定时器
let startTime = 0   // 开始记录时间
let hasReport = false // 是否已经上报过一次
let pageHeight = 0  // 页面总高度
let scrollTop = 0   // 滚动了多少
let viewportHeight = 0 // 屏幕可视高度

// 记录页面级别的最大滚动深度
let maxScrollDepth = 0

export default function pageAccessHeight() {
    // 使用捕获阶段监听 scroll 事件，这样既能捕获 window 的滚动，
    // 也能捕获子元素（如 div 滚动容器）的滚动事件
    window.addEventListener('scroll', onScroll, true)

    // 页面离开时：上报最终阅读高度
    onBeforeunload(() => {
        const now = performance.now()
        updateScrollMetrics()

        report({
            startTime: now,
            duration: now - startTime,
            type: 'behavior',
            subType: 'page-access-height',
            pageURL: getPageURL(),
            scrollDepth: Math.round(Math.min(maxScrollDepth, 1) * 100),
            maxScrollDepth: Math.round(Math.min(maxScrollDepth, 1) * 100),
            value: toPercent(maxScrollDepth),
            uuid: getUUID(),
        }, true)
    })

    // 页面加载完成后初始化记录当前访问高度、时间
    executeAfterLoad(() => {
        startTime = performance.now()
        updateScrollMetrics()
        maxScrollDepth = (scrollTop + viewportHeight) / pageHeight
    })
}

function onScroll(e) {
    clearTimeout(timer)
    const now = performance.now()

    // 更新滚动指标
    updateScrollMetrics()

    // 计算当前滚动深度比例
    const currentDepth = pageHeight > 0 ? (scrollTop + viewportHeight) / pageHeight : 0

    // 更新最大滚动深度
    if (currentDepth > maxScrollDepth) {
        maxScrollDepth = currentDepth
    }

    if (!hasReport) {
        hasReport = true
        lazyReportCache({
            startTime: now,
            duration: now - startTime,
            type: 'behavior',
            subType: 'page-access-height',
            pageURL: getPageURL(),
            scrollDepth: Math.round(Math.min(currentDepth, 1) * 100),
            maxScrollDepth: Math.round(Math.min(maxScrollDepth, 1) * 100),
            value: toPercent(currentDepth),
            uuid: getUUID(),
        })
    }

    timer = setTimeout(() => {
        hasReport = false
        startTime = now
        updateScrollMetrics()
    }, 500)
}

function updateScrollMetrics() {
    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    viewportHeight = window.innerHeight
}

function toPercent(val) {
    if (val >= 1) return '100%'
    return (val * 100).toFixed(2) + '%'
}
