// 敏感信息正则表达式
const PATTERNS = {
    // 中国大陆手机号: 1开头，11位数字
    PHONE: /1[3-9]\d{9}/g,
    // 中国大陆身份证号: 18位，最后一位可以是X
    ID_CARD: /\d{17}[\dXx]/g,
    // 邮箱
    EMAIL: /[\w.-]+@[\w.-]+\.\w+/g,
    // 银行卡号: 16-19位数字
    BANK_CARD: /\b\d{16,19}\b/g,
    // IPv4 地址
    IPV4: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    // IPv6 地址 (简化版)
    IPV6: /([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}/g,
    // 中文姓名: 2-4个中文字符 (需要更严格的上下文)
    CHINESE_NAME: /(?<=[\u4e00-\u9fa5]{0,2})[\u4e00-\u9fa5]{2,4}(?=[\u4e00-\u9fa5]{0,2})/g,
    // URL 中的敏感参数
    URL_TOKEN: /[?&](token|key|secret|password|pwd|auth)=[^&]*/gi,
}

// 脱敏替换函数
const REPLACERS = {
    // 手机号: 保留前3位和后4位
    PHONE: (match) => match.substring(0, 3) + '****' + match.substring(7),
    // 身份证号: 保留前4位和后4位
    ID_CARD: (match) => match.substring(0, 4) + '**********' + match.substring(14),
    // 邮箱: 保留首字符和域名
    EMAIL: (match) => {
        const [local, domain] = match.split('@')
        const maskedLocal = local.charAt(0) + '***'
        return maskedLocal + '@' + domain
    },
    // 银行卡号: 保留后4位
    BANK_CARD: (match) => '**** **** **** ' + match.substring(match.length - 4),
    // IPv4: 保留前两段
    IPV4: (match) => {
        const parts = match.split('.')
        return parts[0] + '.' + parts[1] + '.*.*'
    },
    // IPv6: 保留前四段
    IPV6: (match) => {
        const parts = match.split(':')
        return parts.slice(0, 4).join(':') + ':*:*:*:*'
    },
    // 中文姓名: 保留姓氏
    CHINESE_NAME: (match) => match.charAt(0) + '*'.repeat(match.length - 1),
    // URL 敏感参数: 保留参数名
    URL_TOKEN: (match) => {
        const [key] = match.split('=')
        return key + '=***'
    },
}

/**
 * 对字符串进行脱敏处理
 * @param {string} text - 待脱敏的字符串
 * @param {Object} options - 脱敏选项
 * @param {boolean} options.phone - 是否脱敏手机号 (默认 true)
 * @param {boolean} options.idCard - 是否脱敏身份证号 (默认 true)
 * @param {boolean} options.email - 是否脱敏邮箱 (默认 true)
 * @param {boolean} options.bankCard - 是否脱敏银行卡号 (默认 true)
 * @param {boolean} options.ip - 是否脱敏 IP 地址 (默认 true)
 * @param {boolean} options.name - 是否脱敏中文姓名 (默认 false，误伤率高)
 * @param {boolean} options.urlToken - 是否脱敏 URL 中的敏感参数 (默认 true)
 * @param {Array} options.customPatterns - 自定义正则表达式数组
 * @param {Function} options.customReplacer - 自定义替换函数
 * @returns {string} 脱敏后的字符串
 */
export function sanitizeString(text, options = {}) {
    if (typeof text !== 'string') return text

    const {
        phone = true,
        idCard = true,
        email = true,
        bankCard = true,
        ip = true,
        name = false,
        urlToken = true,
        customPatterns = [],
        customReplacer = null,
    } = options

    // 使用标记替换法，先替换长的模式，避免短模式先匹配到长模式的一部分
    const markers = []
    let result = text

    // 添加标记函数
    const addMarker = (match, replacer) => {
        const marker = `__SANITIZE_${markers.length}__`
        markers.push(replacer(match))
        return marker
    }

    // 按优先级处理：先处理长的、更具体的模式
    // 1. 身份证号 (18位，优先级最高)
    if (idCard) {
        result = result.replace(PATTERNS.ID_CARD, (match) => addMarker(match, REPLACERS.ID_CARD))
    }

    // 2. 银行卡号 (16-19位)
    if (bankCard) {
        result = result.replace(PATTERNS.BANK_CARD, (match) => addMarker(match, REPLACERS.BANK_CARD))
    }

    // 3. 手机号 (11位)
    if (phone) {
        result = result.replace(PATTERNS.PHONE, (match) => addMarker(match, REPLACERS.PHONE))
    }

    // 4. 邮箱
    if (email) {
        result = result.replace(PATTERNS.EMAIL, (match) => addMarker(match, REPLACERS.EMAIL))
    }

    // 5. IPv4
    if (ip) {
        result = result.replace(PATTERNS.IPV4, (match) => addMarker(match, REPLACERS.IPV4))
    }

    // 6. IPv6
    if (ip) {
        result = result.replace(PATTERNS.IPV6, (match) => addMarker(match, REPLACERS.IPV6))
    }

    // 7. 中文姓名
    if (name) {
        result = result.replace(PATTERNS.CHINESE_NAME, (match) => addMarker(match, REPLACERS.CHINESE_NAME))
    }

    // 8. URL 敏感参数
    if (urlToken) {
        result = result.replace(PATTERNS.URL_TOKEN, (match) => addMarker(match, REPLACERS.URL_TOKEN))
    }

    // 应用自定义正则
    if (customPatterns.length > 0 && customReplacer) {
        for (const pattern of customPatterns) {
            result = result.replace(pattern, (match) => addMarker(match, customReplacer))
        }
    }

    // 还原所有标记
    markers.forEach((replacement, index) => {
        result = result.replace(`__SANITIZE_${index}__`, replacement)
    })

    return result
}

/**
 * 递归遍历对象，对所有字符串值进行脱敏
 * @param {any} data - 待脱敏的数据
 * @param {Object} options - 脱敏选项 (同 sanitizeString)
 * @param {number} depth - 当前递归深度 (防止循环引用)
 * @returns {any} 脱敏后的数据
 */
export function sanitizeData(data, options = {}, depth = 0) {
    // 防止过深递归
    if (depth > 10) return data

    if (data === null || data === undefined) {
        return data
    }

    if (typeof data === 'string') {
        return sanitizeString(data, options)
    }

    if (typeof data === 'number' || typeof data === 'boolean') {
        return data
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, options, depth + 1))
    }

    if (typeof data === 'object') {
        const result = {}
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // 跳过某些不需要脱敏的字段
                if (shouldSkipField(key)) {
                    result[key] = data[key]
                } else {
                    result[key] = sanitizeData(data[key], options, depth + 1)
                }
            }
        }
        return result
    }

    return data
}

/**
 * 判断是否跳过某个字段的脱敏
 * @param {string} fieldName - 字段名
 * @returns {boolean} 是否跳过
 */
function shouldSkipField(fieldName) {
    const skipFields = [
        'type',
        'subType',
        'name',
        'startTime',
        'duration',
        'entryType',
        'timestamp',
        'id',
        'sessionID',
        'appID',
    ]
    return skipFields.includes(fieldName)
}

/**
 * 创建脱敏处理器
 * @param {Object} options - 脱敏选项
 * @returns {Function} 脱敏处理函数
 */
export function createSanitizer(options = {}) {
    return (data) => sanitizeData(data, options)
}

// 预设的脱敏级别
export const SANITIZE_LEVELS = {
    // 严格模式: 脱敏所有敏感信息
    STRICT: {
        phone: true,
        idCard: true,
        email: true,
        bankCard: true,
        ip: true,
        name: true,
        urlToken: true,
    },
    // 标准模式: 脱敏常见敏感信息，不脱敏姓名 (误伤率高)
    STANDARD: {
        phone: true,
        idCard: true,
        email: true,
        bankCard: true,
        ip: true,
        name: false,
        urlToken: true,
    },
    // 宽松模式: 只脱敏最关键的敏感信息
    LOOSE: {
        phone: true,
        idCard: true,
        email: false,
        bankCard: true,
        ip: false,
        name: false,
        urlToken: true,
    },
    // 关闭模式: 不进行脱敏
    OFF: {
        phone: false,
        idCard: false,
        email: false,
        bankCard: false,
        ip: false,
        name: false,
        urlToken: false,
    },
}

// 导出正则和替换函数供测试使用
export { PATTERNS, REPLACERS }
