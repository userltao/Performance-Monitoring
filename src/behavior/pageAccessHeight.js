import { lazyReportCache, report } from '../utils/report'
import { getUUID } from './utils'
import { onBeforeunload, executeAfterLoad, getPageURL } from '../utils/utils'

let timer           // 滚动防抖定时器
let startTime = 0   // 开始记录时间
let hasReport = false // 是否已经上报过一次
let pageHeight = 0  // 页面总高度
let scrollTop = 0   // 滚动了多少
let viewportHeight = 0 // 屏幕可视高度

export default function pageAccessHeight() {
    window.addEventListener('scroll', onScroll)

    // 页面离开时：上报最终阅读高度
    onBeforeunload(() => {
        const now = performance.now()
        report({
            startTime: now,
            duration: now - startTime,
            type: 'behavior',
            subType: 'page-access-height',
            pageURL: getPageURL(),
            value: toPercent((scrollTop + viewportHeight) / pageHeight),
            uuid: getUUID(),
        }, true)
    })

    // 页面加载完成后初始化记录当前访问高度、时间
    executeAfterLoad(() => {
        startTime = performance.now()
        pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        viewportHeight = window.innerHeight
    })
}

function onScroll() {
    clearTimeout(timer)
    const now = performance.now()

    if (!hasReport) {
        hasReport = true
        lazyReportCache({
            startTime: now,
            duration: now - startTime,
            type: 'behavior',
            subType: 'page-access-height',
            pageURL: getPageURL(),
            value: toPercent((scrollTop + viewportHeight) / pageHeight),
            uuid: getUUID(),
        })
    }

    timer = setTimeout(() => {
        hasReport = false
        startTime = now
        pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        viewportHeight = window.innerHeight
    }, 500)
}

function toPercent(val) {
    if (val >= 1) return '100%'
    return (val * 100).toFixed(2) + '%'
}