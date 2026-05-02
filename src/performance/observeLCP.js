import { isSupportPerformanceObserver } from './utils'
import { onBFCacheRestore, getPageURL } from '../utils/utils'
import { lazyReportCache } from '../utils/report'

let lcpDone = false
export function isLCPDone() {
    return lcpDone
}

export default function observeLCP() {
    if (!isSupportPerformanceObserver()) {
        lcpDone = true
        return
    }

    let observer = null;

    //list是PerformanceObserverList对象，包含了所有触发的PerformanceEntry对象，即一条条的LCP数据，是浏览器执行回调的时候传过来的
    const entryHandler = (list) => {
        lcpDone = true

        //只处理第一次的LCP，后续不处理
        if (observer) {
            observer.disconnect()
        }


        for (const entry of list.getEntries()) {
            const json = entry.toJSON()
            delete json.duration

            /* entry 是一个 LargestContentfulPaint 实例
            {
                // 基础属性
                name: "largest-contentful-paint",
                entryType: "largest-contentful-paint",
                startTime: 245.8,  // 元素渲染完成的时间（毫秒）
                duration: 0,       // LCP 没有时长概念，始终为 0
                
                // LCP 特有属性
                size: 250000,      // 元素面积（宽×高，单位像素）
                renderTime: 245.8, // 渲染时间
                loadTime: 245.8,   // 加载时间
                
                // 触发元素
                element: <img src="hero.jpg" width="500" height="500">,
                
                // 元素尺寸
                width: 500,
                height: 500,
                
                // 其他
                id: "",
                url: ""
            }  */
            const reportData = {
                ...json,
                target: entry.element?.tagName,
                name: entry.entryType,
                subType: entry.entryType,
                type: 'performance',
                pageURL: getPageURL(),
            }

            lazyReportCache(reportData)
        }
    }

    observer = new PerformanceObserver(entryHandler)
    observer.observe({ type: 'largest-contentful-paint', buffered: true })

    // 如果是从BFCache恢复，需要手动触发LCP事件，因为BFCache中没有LCP事件（不会重新加载），需要手动触发一个
    onBFCacheRestore(event => {
        // requestAnimationFrame 是浏览器提供的 API，用于在下一次浏览器重绘之前执行指定的回调函数。
        requestAnimationFrame(() => {
            lazyReportCache({
                startTime: performance.now() - event.timeStamp,
                name: 'largest-contentful-paint',
                subType: 'largest-contentful-paint',
                type: 'performance',
                pageURL: getPageURL(),
                bfc: true,
            })
        })
    })
}