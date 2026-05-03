/**
 * 类型定义测试文件
 * 这个文件用于验证类型定义是否正确，不需要实际运行
 */

import monitor, {
    MonitorOptions,
    Monitor,
    ErrorData,
    PerformanceData,
    BehaviorData,
    ErrorDataForDedup,
    isSupportSendBeacon,
    report,
    lazyReportCache,
    generateUniqueID,
    generateFingerprint,
    isDuplicate,
    clearDedupCache,
    getDedupCacheSize,
    startCleanup,
    stopCleanup,
} from './index'

// 测试 MonitorOptions 类型
const options: MonitorOptions = {
    url: 'https://example.com/report',
    appID: 'test-app',
    userID: 'user-123',
    vue: {
        Vue: null,
        router: null,
    },
}

// 测试 monitor.init()
monitor.init(options)

// 测试 monitor.init() 无参数
monitor.init()

// 测试 monitor.report()
monitor.report({ type: 'test', data: 'hello' })
monitor.report({ type: 'test', data: 'hello' }, true)

// 测试 isSupportSendBeacon()
const supported: boolean = isSupportSendBeacon()

// 测试 report()
report({ type: 'test' })
report({ type: 'test' }, true)

// 测试 lazyReportCache()
lazyReportCache({ type: 'test' })
lazyReportCache({ type: 'test' }, 5000)

// 测试 generateUniqueID()
const id: string = generateUniqueID()

// 测试 ErrorData 类型
const errorData: ErrorData = {
    type: 'error',
    subType: 'console-error',
    errData: ['test error'],
}

// 测试 PerformanceData 类型
const perfData: PerformanceData = {
    type: 'performance',
    subType: 'first-paint',
    name: 'first-paint',
    startTime: 100,
}

// 测试 BehaviorData 类型
const behaviorData: BehaviorData = {
    type: 'behavior',
    subType: 'pv',
    uuid: 'test-uuid',
    referrer: 'https://example.com',
}

// 测试 ClickData 类型
const clickData: BehaviorData = {
    type: 'behavior',
    subType: 'click',
    target: 'DIV',
    top: 100,
    left: 200,
    width: 50,
    height: 30,
    eventType: 'mousedown',
    pageHeight: 1000,
    scrollTop: 500,
    viewport: {
        width: 1024,
        height: 768,
    },
    uuid: 'test-uuid',
}

// ==================== 去重功能类型测试 ====================

// 测试 ErrorDataForDedup 类型
const jsError: ErrorDataForDedup = {
    subType: 'js',
    msg: 'TypeError: Cannot read property',
    url: 'http://example.com/script.js',
    line: 10,
    column: 20,
    error: 'TypeError: Cannot read property\n    at Object.<anonymous> (script.js:10:20)',
}

const resourceError: ErrorDataForDedup = {
    subType: 'resource',
    url: 'http://example.com/image.png',
    resourceType: 'IMG',
}

const consoleError: ErrorDataForDedup = {
    subType: 'console-error',
    errData: ['test error message'],
}

const promiseError: ErrorDataForDedup = {
    subType: 'promise',
    reason: 'Error: Unhandled promise rejection',
}

// 测试 generateFingerprint()
const fingerprint1: string = generateFingerprint(jsError)
const fingerprint2: string = generateFingerprint(resourceError)
const fingerprint3: string = generateFingerprint(consoleError)
const fingerprint4: string = generateFingerprint(promiseError)

// 测试 isDuplicate()
const isDup1: boolean = isDuplicate(jsError)
const isDup2: boolean = isDuplicate(resourceError, 10000) // 自定义间隔

// 测试 clearDedupCache()
clearDedupCache()

// 测试 getDedupCacheSize()
const cacheSize: number = getDedupCacheSize()

// 测试 startCleanup()
startCleanup() // 默认间隔
startCleanup(30000) // 自定义间隔

// 测试 stopCleanup()
stopCleanup()

console.log('All type definitions are valid!')
