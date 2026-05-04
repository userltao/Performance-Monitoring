import { originalOpen, originalSend } from './xhr'
import { addCache, getCache, clearCache } from './cache'
import generateUniqueID from '../utils/generateUniqueID'
import config from '../config'
import { sanitizeData, SANITIZE_LEVELS } from './sanitize'

export function isSupportSendBeacon() {
    return !!window.navigator?.sendBeacon
}

const sendBeacon = isSupportSendBeacon() ? window.navigator.sendBeacon.bind(window.navigator) : reportWithXHR

const sessionID = generateUniqueID()
export function report(data, isImmediate = false) {
    if (!config.url) {
        console.error('请设置上传 url 地址')
    }

    // 应用数据脱敏
    let sanitizedData = data
    if (config.sanitize?.enabled !== false) {
        const sanitizeOptions = config.sanitize?.options || SANITIZE_LEVELS[config.sanitize?.level || 'STANDARD']
        if (sanitizeOptions) {
            sanitizedData = sanitizeData(data, sanitizeOptions)
        }
    }

    const reportData = JSON.stringify({
        id: sessionID,
        appID: config.appID,
        userID: config.userID,
        data: sanitizedData,
    })

    // 要立即上报，直接发送
    if (isImmediate) {
        sendBeacon(config.url, reportData)
        return
    }

    // 浏览器空闲时上报
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            sendBeacon(config.url, reportData)
        }, { timeout: 3000 })
    } else {
        setTimeout(() => {
            sendBeacon(config.url, reportData)
        })
    }
}

let timer = null
export function lazyReportCache(data, timeout = 3000) {
    addCache(data)

    clearTimeout(timer)
    timer = setTimeout(() => {
        const data = getCache()
        if (data.length) {
            report(data)
            clearCache()
        }
    }, timeout)
}

export function reportWithXHR(data) {
    const xhr = new XMLHttpRequest()
    originalOpen.call(xhr, 'post', config.url)
    originalSend.call(xhr, JSON.stringify(data))
}