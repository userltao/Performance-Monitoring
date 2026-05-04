describe('utils/sanitize', () => {
    let sanitizeString
    let sanitizeData
    let createSanitizer
    let SANITIZE_LEVELS

    beforeEach(() => {
        jest.resetModules()
        const module = require('../../utils/sanitize')
        sanitizeString = module.sanitizeString
        sanitizeData = module.sanitizeData
        createSanitizer = module.createSanitizer
        SANITIZE_LEVELS = module.SANITIZE_LEVELS
    })

    describe('sanitizeString', () => {
        describe('phone number sanitization', () => {
            it('should mask Chinese phone numbers', () => {
                expect(sanitizeString('我的手机号是13812345678')).toBe('我的手机号是138****5678')
            })

            it('should mask multiple phone numbers', () => {
                expect(sanitizeString('13812345678和15987654321')).toBe('138****5678和159****4321')
            })

            it('should not mask non-Chinese phone numbers', () => {
                expect(sanitizeString('12345678901')).toBe('12345678901')
            })

            it('should skip phone sanitization when disabled', () => {
                expect(sanitizeString('13812345678', { phone: false })).toBe('13812345678')
            })
        })

        describe('ID card sanitization', () => {
            it('should mask Chinese ID card numbers', () => {
                const result = sanitizeString('身份证号:110101199001011234')
                expect(result).toContain('1101')
                expect(result).toContain('1234')
                expect(result).toContain('****')
            })

            it('should mask ID card with X suffix', () => {
                const result = sanitizeString('ID:11010119900101123X')
                expect(result).toContain('1101')
                expect(result).toContain('123X')
                expect(result).toContain('****')
            })

            it('should skip ID card sanitization when disabled', () => {
                // 禁用所有数字相关脱敏，验证身份证脱敏确实被跳过
                const result = sanitizeString('身份证号:110101199001011234', { 
                    idCard: false, 
                    bankCard: false, 
                    phone: false 
                })
                expect(result).toContain('110101199001011234')
            })
        })

        describe('email sanitization', () => {
            it('should mask email addresses', () => {
                expect(sanitizeString('联系我test@example.com')).toBe('联系我t***@example.com')
            })

            it('should mask email with complex local part', () => {
                expect(sanitizeString('user.name@domain.com')).toBe('u***@domain.com')
            })

            it('should skip email sanitization when disabled', () => {
                expect(sanitizeString('test@example.com', { email: false })).toBe('test@example.com')
            })
        })

        describe('bank card sanitization', () => {
            it('should mask bank card numbers', () => {
                const result = sanitizeString('卡号6222021234567890')
                expect(result).toContain('****')
                expect(result).toContain('7890')
            })

            it('should mask 16-digit bank card', () => {
                expect(sanitizeString('6222021234567890')).toContain('****')
            })

            it('should skip bank card sanitization when disabled', () => {
                expect(sanitizeString('6222021234567890', { bankCard: false })).toBe('6222021234567890')
            })
        })

        describe('IP address sanitization', () => {
            it('should mask IPv4 addresses', () => {
                expect(sanitizeString('服务器IP是192.168.1.100')).toBe('服务器IP是192.168.*.*')
            })

            it('should skip IP sanitization when disabled', () => {
                expect(sanitizeString('192.168.1.100', { ip: false })).toBe('192.168.1.100')
            })
        })

        describe('Chinese name sanitization', () => {
            it('should mask Chinese names when enabled', () => {
                const result = sanitizeString('用户张三丰登录', { name: true })
                expect(result).toContain('*')
            })

            it('should not mask Chinese names by default', () => {
                expect(sanitizeString('用户张三丰登录')).toBe('用户张三丰登录')
            })
        })

        describe('URL token sanitization', () => {
            it('should mask token parameters in URLs', () => {
                expect(sanitizeString('https://api.com?token=abc123&name=test')).toBe('https://api.com?token=***&name=test')
            })

            it('should mask password parameters', () => {
                expect(sanitizeString('https://api.com?password=secret123')).toBe('https://api.com?password=***')
            })

            it('should mask key parameters', () => {
                expect(sanitizeString('https://api.com?key=api_key_123')).toBe('https://api.com?key=***')
            })

            it('should skip URL token sanitization when disabled', () => {
                expect(sanitizeString('https://api.com?token=abc123', { urlToken: false })).toBe('https://api.com?token=abc123')
            })
        })

        describe('custom patterns', () => {
            it('should apply custom regex patterns', () => {
                const customPatterns = [/\d{4}-\d{4}-\d{4}/g]
                const customReplacer = (match) => '****-****-****'
                expect(sanitizeString('工号1234-5678-9012', { customPatterns, customReplacer })).toBe('工号****-****-****')
            })
        })

        describe('edge cases', () => {
            it('should return non-string values as-is', () => {
                expect(sanitizeString(123)).toBe(123)
                expect(sanitizeString(null)).toBeNull()
                expect(sanitizeString(undefined)).toBeUndefined()
            })

            it('should handle empty strings', () => {
                expect(sanitizeString('')).toBe('')
            })

            it('should handle strings without sensitive data', () => {
                expect(sanitizeString('Hello World')).toBe('Hello World')
            })
        })
    })

    describe('sanitizeData', () => {
        it('should sanitize string values in objects', () => {
            const data = {
                message: '用户手机号13812345678',
                name: '张三',
            }
            const result = sanitizeData(data)
            expect(result.message).toBe('用户手机号138****5678')
            expect(result.name).toBe('张三')
        })

        it('should sanitize nested objects', () => {
            const data = {
                user: {
                    phone: '13812345678',
                    email: 'test@example.com',
                },
            }
            const result = sanitizeData(data)
            expect(result.user.phone).toBe('138****5678')
            expect(result.user.email).toBe('t***@example.com')
        })

        it('should sanitize arrays', () => {
            const data = ['手机号13812345678', '邮箱test@example.com']
            const result = sanitizeData(data)
            expect(result[0]).toBe('手机号138****5678')
            expect(result[1]).toContain('t***@example.com')
        })

        it('should preserve non-string values', () => {
            const data = {
                count: 123,
                active: true,
                items: null,
            }
            const result = sanitizeData(data)
            expect(result.count).toBe(123)
            expect(result.active).toBe(true)
            expect(result.items).toBeNull()
        })

        it('should skip certain fields', () => {
            const data = {
                type: 'error',
                subType: 'js',
                msg: '手机号13812345678',
            }
            const result = sanitizeData(data)
            expect(result.type).toBe('error')
            expect(result.subType).toBe('js')
            expect(result.msg).toBe('手机号138****5678')
        })

        it('should handle deeply nested objects', () => {
            const data = {
                level1: {
                    level2: {
                        level3: {
                            phone: '13812345678',
                        },
                    },
                },
            }
            const result = sanitizeData(data)
            expect(result.level1.level2.level3.phone).toBe('138****5678')
        })

        it('should prevent infinite recursion', () => {
            const data = { a: 1 }
            data.self = data
            const result = sanitizeData(data)
            expect(result.a).toBe(1)
        })

        it('should apply custom options', () => {
            const data = { phone: '13812345678', email: 'test@example.com' }
            const result = sanitizeData(data, { phone: true, email: false })
            expect(result.phone).toBe('138****5678')
            expect(result.email).toBe('test@example.com')
        })
    })

    describe('createSanitizer', () => {
        it('should create a sanitizer function', () => {
            const sanitizer = createSanitizer()
            expect(typeof sanitizer).toBe('function')
        })

        it('should sanitize data using created sanitizer', () => {
            const sanitizer = createSanitizer()
            const data = { phone: '13812345678' }
            const result = sanitizer(data)
            expect(result.phone).toBe('138****5678')
        })

        it('should use custom options', () => {
            const sanitizer = createSanitizer({ phone: false })
            const data = { phone: '13812345678' }
            const result = sanitizer(data)
            expect(result.phone).toBe('13812345678')
        })
    })

    describe('SANITIZE_LEVELS', () => {
        it('should have all required levels', () => {
            expect(SANITIZE_LEVELS.STRICT).toBeDefined()
            expect(SANITIZE_LEVELS.STANDARD).toBeDefined()
            expect(SANITIZE_LEVELS.LOOSE).toBeDefined()
            expect(SANITIZE_LEVELS.OFF).toBeDefined()
        })

        it('STRICT should enable all options', () => {
            const { STRICT } = SANITIZE_LEVELS
            expect(STRICT.phone).toBe(true)
            expect(STRICT.idCard).toBe(true)
            expect(STRICT.email).toBe(true)
            expect(STRICT.bankCard).toBe(true)
            expect(STRICT.ip).toBe(true)
            expect(STRICT.name).toBe(true)
            expect(STRICT.urlToken).toBe(true)
        })

        it('STANDARD should not enable name by default', () => {
            const { STANDARD } = SANITIZE_LEVELS
            expect(STANDARD.phone).toBe(true)
            expect(STANDARD.idCard).toBe(true)
            expect(STANDARD.name).toBe(false)
        })

        it('OFF should disable all options', () => {
            const { OFF } = SANITIZE_LEVELS
            expect(OFF.phone).toBe(false)
            expect(OFF.idCard).toBe(false)
            expect(OFF.email).toBe(false)
            expect(OFF.bankCard).toBe(false)
            expect(OFF.ip).toBe(false)
            expect(OFF.name).toBe(false)
            expect(OFF.urlToken).toBe(false)
        })
    })

    describe('mixed sensitive data', () => {
        it('should handle multiple types of sensitive data in one string', () => {
            const text = '用户张三，手机号13812345678，邮箱test@example.com'
            const result = sanitizeString(text)
            expect(result).toContain('138****5678')
            expect(result).toContain('t***@example.com')
        })

        it('should handle real-world error message', () => {
            const errorMessage = '请求失败: 用户13812345678访问https://api.com?token=secret123失败'
            const result = sanitizeString(errorMessage)
            expect(result).toContain('138****5678')
            expect(result).toContain('token=***')
        })
    })
})
