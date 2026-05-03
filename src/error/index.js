import { lazyReportCache } from '../utils/report'
import { onBFCacheRestore, getPageURL } from '../utils/utils'
import { isDuplicate } from '../utils/dedup'
import config from '../config'

export default function error() {
    const oldConsoleError = window.console.error
    window.console.error = (...args) => {
        oldConsoleError.apply(this, args)

        const errorData = {
            type: 'error',
            subType: 'console-error',
            startTime: performance.now(),
            errData: args,
            pageURL: getPageURL(),
        }

        // 去重检查：相同控制台错误短时间内只上报一次
        if (!isDuplicate(errorData)) {
            lazyReportCache(errorData)
        }
    }

    // 捕获资源加载失败错误 js css img...
    window.addEventListener('error', e => {
        const target = e.target
        if (!target) return

        if (target.src || target.href) {
            const url = target.src || target.href
            const errorData = {
                url,
                type: 'error',
                subType: 'resource',
                startTime: e.timeStamp,
                html: target.outerHTML,
                resourceType: target.tagName,
                paths: e.path ? e.path.map(item => item.tagName).filter(Boolean) : [],
                pageURL: getPageURL(),
            }

            // 去重检查：相同资源错误短时间内只上报一次
            if (!isDuplicate(errorData)) {
                lazyReportCache(errorData)
            }
        }
    }, true)

    // 监听 js 错误
    window.onerror = (msg, url, line, column, error) => {
        const errorData = {
            msg,
            line,
            column,
            error: error?.stack,
            subType: 'js',
            pageURL: url,
            type: 'error',
            startTime: performance.now(),
        }

        // 去重检查：相同JS错误短时间内只上报一次
        if (!isDuplicate(errorData)) {
            lazyReportCache(errorData)
        }
    }

    // 监听 promise 错误 缺点是获取不到列数据
    window.addEventListener('unhandledrejection', e => {
        const errorData = {
            reason: e.reason?.stack,
            subType: 'promise',
            type: 'error',
            startTime: e.timeStamp,
            pageURL: getPageURL(),
        }

        // 去重检查：相同Promise错误短时间内只上报一次
        if (!isDuplicate(errorData)) {
            lazyReportCache(errorData)
        }
    })

    if (config.vue?.Vue) {
        config.vue.Vue.config.errorHandler = (err, vm, info) => {
            console.error(err)

            const errorData = {
                info,
                error: err.stack,
                subType: 'vue',
                type: 'error',
                startTime: performance.now(),
                pageURL: getPageURL(),
            }

            // 去重检查：相同Vue错误短时间内只上报一次
            if (!isDuplicate(errorData)) {
                lazyReportCache(errorData)
            }
        }
    }

    onBFCacheRestore(() => {
        error()
    })
}
