import { isSupportPerformanceObserver } from './utils'
import { onBFCacheRestore, deepCopy, getPageURL, onHidden } from '../utils/utils'
import { lazyReportCache } from '../utils/report'

export default function observeCLS() {
    if (!isSupportPerformanceObserver()) return

    onBFCacheRestore(() => {
        observeCLS()
    })

    // 当前会话窗口内累计的 CLS 分数
    let sessionValue = 0
    // 存储当前会话内所有偏移的详细信息
    //{ startTime: 1200, value: 0.05, hadRecentInput: false, ... },
    let sessionEntries = []
    // 全局最大 CLS 记录
    const cls = {
        subType: 'layout-shift',//子类型标识
        name: 'layout-shift',//指标名称
        type: 'performance',//数据类型
        pageURL: getPageURL(),//页面URL
        value: 0,//历史最大会话分数（初始0）

    }

    const entryHandler = (list) => {
        for (const entry of list.getEntries()) {
            // 只有在 “用户最近没有操作” 时，才计算这次布局偏移。用户主动操作引发的页面变动，不算 CLS！
            if (!entry.hadRecentInput) {
                const firstSessionEntry = sessionEntries[0]
                const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

                // 如果：
                // 1. 本次偏移 距离 上一次偏移 < 1秒
                // 并且
                // 2. 本次偏移 距离 会话第一次偏移 < 5秒
                // → 计入【当前会话】，累加分数
                // 否则 → 【新开一个会话】，重新计算
                if (
                    sessionValue
                    && entry.startTime - lastSessionEntry.startTime < 1000
                    && entry.startTime - firstSessionEntry.startTime < 5000
                ) {
                    sessionValue += entry.value
                    sessionEntries.push(formatCLSEntry(entry))
                } else {
                    sessionValue = entry.value
                    sessionEntries = [formatCLSEntry(entry)]
                }

                // 如果 当前会话累计的布局偏移分数 > 历史记录的最大CLS分数
                // 就更新最终CLS为这个更大的值，并保存这次会话的详细数据
                if (sessionValue > cls.value) {
                    cls.value = sessionValue
                    cls.entries = sessionEntries
                    cls.startTime = performance.now()
                    lazyReportCache(deepCopy(cls))
                }
            }
        }
    }

    const observer = new PerformanceObserver(entryHandler)
    observer.observe({ type: 'layout-shift', buffered: true })

    //当页面要隐藏 / 切换 tab / 最小化 / 关闭页面时，把 PerformanceObserver 还没来得及触发回调的性能数据一次性全部取出来，强行执行一遍处理逻辑，保证数据不丢失！
    if (observer) {
        onHidden(() => {
            observer.takeRecords().map(entryHandler)
        })
    }
}

function formatCLSEntry(entry) {
    const result = entry.toJSON()
    delete result.duration
    delete result.sources

    return result
}