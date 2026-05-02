import { isSupportPerformanceObserver } from './utils'
import { onBFCacheRestore, getPageURL } from '../utils/utils'
import { lazyReportCache } from '../utils/report'

export default function observeFID() {
    // 如果是从BFCache恢复，需要手动触发FID事件，因为BFCache中没有FID事件（不会重新加载），需要手动触发一个
    onBFCacheRestore(() => {
        observeFID()
    })

    if (isSupportPerformanceObserver()) {
        const entryHandler = (list) => {
            if (observer) {
                observer.disconnect()
            }

            for (const entry of list.getEntries()) {
                const json = entry.toJSON()
                json.nodeName = entry.tagName
                json.event = json.name
                json.name = json.entryType
                json.type = 'performance'
                json.pageURL = getPageURL()
                delete json.cancelable

                lazyReportCache(json)
            }
        }

        const observer = new PerformanceObserver(entryHandler)
        observer.observe({ type: 'first-input', buffered: true })
        return
    }

    // 如果浏览器不支持 PerformanceObserver，使用 polyfill 实现 FID
    fidPolyfill()
}

function fidPolyfill() {
    eachEventType(window.addEventListener)
}

function onInput(event) {
    // 只统计可取消的事件，这些事件会触发用户认为重要的行为
    if (event.cancelable) {
        // 旧浏览器（以及 Safari 11.1）中，event.timeStamp 返回的是绝对时间戳（DOMTimeStamp），类似 Date.now() 的值。而新浏览器返回的是相对时间戳（DOMHighResTimeStamp），即相对于页面启动的时间。为了区分这两种格式，注释提出了一个巧妙的判断方法。
        //绝对时间：event.timeStamp = 1678901234567（大于 1e12），就使用 Date.now()。
        //相对时间：event.timeStamp = 245.8，就使用高精度的 performance.now(),返回从页面加载开始到当前时刻的毫秒数
        const isEpochTime = event.timeStamp > 1e12
        const now = isEpochTime ? Date.now() : performance.now()

        //处理时间-事件触发时间=输入延迟
        const duration = now - event.timeStamp

        lazyReportCache({
            duration,
            subType: 'first-input',
            event: event.type,
            name: 'first-input',
            target: event.target.tagName,
            startTime: event.timeStamp,
            type: 'performance',
            pageURL: getPageURL(),
        })

        eachEventType(window.removeEventListener)
    }
}

function eachEventType(callback) {
    const eventTypes = [
        'mousedown',
        'keydown',
        'touchstart',
    ]

    eventTypes.forEach((type) => callback(type, onInput, { passive: true, capture: true }))
}