import { isSupportPerformanceObserver } from './utils'
import { onBFCacheRestore, getPageURL } from '../utils/utils'
import { lazyReportCache } from '../utils/report'

export default function observePaint() {
    if (!isSupportPerformanceObserver()) return

    const entryHandler = (list) => {
        for (const entry of list.getEntries()) {
            //  只有监听到 FCP 才取消监听。
            // 如果只触发 FP，不会取消，继续监听，直到 FCP 出现。
            if (entry.name === 'first-contentful-paint') {
                observer.disconnect()
            }

            const json = entry.toJSON()
            delete json.duration

            const reportData = {
                ...json,
                subType: entry.name,
                type: 'performance',
                pageURL: getPageURL(),
            }

            lazyReportCache(reportData)
        }
    }

    const observer = new PerformanceObserver(entryHandler)
    observer.observe({ type: 'paint', buffered: true })

    //页面从 “后退 / 前进缓存” 回来时，FP/FCP 不会自动触发，所以我们要手动伪造上报
    onBFCacheRestore(event => {
        // 等浏览器下一帧真正渲染出来再执行（保证时间算得准）
        requestAnimationFrame(() => {
            ['first-paint', 'first-contentful-paint'].forEach(type => {
                lazyReportCache({
                    // 当前时间 - 页面被缓存的时间= 页面恢复耗时
                    startTime: performance.now() - event.timeStamp,
                    name: type,
                    subType: type,
                    type: 'performance',
                    pageURL: getPageURL(),
                    // 上报一条伪造的 FP/ FCP 数据，并打上标记：我是从缓存恢复的！
                    bfc: true,
                })
            })
        })
    })
}