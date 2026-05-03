/**
 * 错误去重工具模块
 * 相同错误短时间内只上报一次，避免重复数据
 */

// 存储错误指纹和最后上报时间
const errorCache = new Map()

// 默认去重时间窗口（5秒）
const DEFAULT_INTERVAL = 5000

// 默认清理间隔（60秒）
const DEFAULT_CLEANUP_INTERVAL = 60000

/**
 * 安全地将值转换为字符串并截取
 * @param {any} value - 要转换的值
 * @param {number} maxLength - 最大长度
 * @returns {string} 截取后的字符串
 */
function safeSlice(value, maxLength) {
    if (value == null) return ''
    const str = typeof value === 'string' ? value : String(value)
    return str.slice(0, maxLength)
}

/**
 * 生成错误指纹
 * 根据错误类型和关键信息生成唯一标识
 * @param {Object} errorData - 错误数据
 * @returns {string} 错误指纹
 */
export function generateFingerprint(errorData) {
    const { subType, msg, url, resourceType, errData, reason, error } = errorData

    // 基础指纹 = 子类型
    let fingerprint = subType || 'unknown'

    switch (subType) {
        case 'console-error':
            // 控制台错误：使用错误信息的前100个字符
            fingerprint += `:${errData?.map(item =>
                safeSlice(item, 100)
            ).join(',')}`
            break

        case 'js':
            // JS错误：使用消息 + 文件URL + 行号
            fingerprint += `:${safeSlice(msg, 100)}:${url}:${errorData.line}:${errorData.column}`
            break

        case 'promise':
            // Promise错误：使用错误堆栈的前200个字符
            fingerprint += `:${safeSlice(reason, 200)}`
            break

        case 'resource':
            // 资源错误：使用资源URL + 资源类型
            fingerprint += `:${url}:${resourceType}`
            break

        case 'vue':
            // Vue错误：使用错误堆栈的前200个字符
            fingerprint += `:${safeSlice(error, 200)}`
            break

        default:
            // 其他：使用JSON序列化的前200个字符
            fingerprint += `:${safeSlice(JSON.stringify(errorData), 200)}`
    }

    return fingerprint
}

/**
 * 检查是否为重复错误
 * @param {Object} errorData - 错误数据
 * @param {number} interval - 去重时间窗口（毫秒），默认 5000ms
 * @returns {boolean} 是否为重复错误
 */
export function isDuplicate(errorData, interval = DEFAULT_INTERVAL) {
    const fingerprint = generateFingerprint(errorData)
    const now = Date.now()
    const lastReportTime = errorCache.get(fingerprint)

    // 如果是首次上报，或者已超过去重时间窗口
    if (!lastReportTime || now - lastReportTime > interval) {
        errorCache.set(fingerprint, now)
        return false
    }

    return true
}

/**
 * 清除错误缓存
 * 用于测试或手动重置
 */
export function clearDedupCache() {
    errorCache.clear()
}

/**
 * 获取缓存大小
 * @returns {number} 缓存条目数
 */
export function getDedupCacheSize() {
    return errorCache.size
}

/**
 * 定期清理过期的缓存条目
 * 防止内存泄漏
 * @param {number} maxAge - 条目最大存活时间（毫秒），默认 60000ms
 * @param {number} cleanupInterval - 清理检查间隔（毫秒），默认等于 maxAge
 */
let cleanupTimer = null
export function startCleanup(maxAge = DEFAULT_CLEANUP_INTERVAL, cleanupInterval) {
    if (cleanupTimer) return

    // 如果没有指定清理间隔，使用 maxAge 作为清理间隔
    const interval = cleanupInterval || maxAge

    cleanupTimer = setInterval(() => {
        const now = Date.now()
        for (const [fingerprint, time] of errorCache.entries()) {
            if (now - time > maxAge) {
                errorCache.delete(fingerprint)
            }
        }
    }, interval)

    // 防止定时器阻止进程退出
    if (cleanupTimer.unref) {
        cleanupTimer.unref()
    }
}

export function stopCleanup() {
    if (cleanupTimer) {
        clearInterval(cleanupTimer)
        cleanupTimer = null
    }
}
