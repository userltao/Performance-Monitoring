import {
    generateFingerprint,
    isDuplicate,
    clearDedupCache,
    getDedupCacheSize,
    startCleanup,
    stopCleanup,
} from '../../utils/dedup'

describe('dedup', () => {
    beforeEach(() => {
        clearDedupCache()
        stopCleanup()
        jest.useFakeTimers()
    })

    afterEach(() => {
        stopCleanup()
        jest.useRealTimers()
    })

    describe('generateFingerprint', () => {
        it('should generate fingerprint for console-error', () => {
            const errorData = {
                subType: 'console-error',
                errData: ['test error message'],
            }
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('console-error')
            expect(fingerprint).toContain('test error message')
        })

        it('should generate fingerprint for js error', () => {
            const errorData = {
                subType: 'js',
                msg: 'Uncaught TypeError',
                url: 'http://example.com/script.js',
                line: 10,
                column: 20,
            }
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('js')
            expect(fingerprint).toContain('Uncaught TypeError')
            expect(fingerprint).toContain('http://example.com/script.js')
        })

        it('should generate fingerprint for promise error', () => {
            const errorData = {
                subType: 'promise',
                reason: 'Error: promise rejected',
            }
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('promise')
            expect(fingerprint).toContain('Error: promise rejected')
        })

        it('should generate fingerprint for resource error', () => {
            const errorData = {
                subType: 'resource',
                url: 'http://example.com/image.png',
                resourceType: 'IMG',
            }
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('resource')
            expect(fingerprint).toContain('http://example.com/image.png')
            expect(fingerprint).toContain('IMG')
        })

        it('should generate fingerprint for vue error', () => {
            const errorData = {
                subType: 'vue',
                error: 'Error in mounted hook',
            }
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('vue')
            expect(fingerprint).toContain('Error in mounted hook')
        })

        it('should generate fingerprint for unknown error type', () => {
            const errorData = {
                subType: 'custom',
                data: 'test',
            }
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('custom')
        })

        it('should truncate long error messages', () => {
            const longMessage = 'a'.repeat(500)
            const errorData = {
                subType: 'js',
                msg: longMessage,
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            const fingerprint = generateFingerprint(errorData)
            // 消息应该被截断到100个字符
            expect(fingerprint.length).toBeLessThan(300)
        })

        it('should handle non-string msg values', () => {
            const errorData = {
                subType: 'js',
                msg: new Error('test error'),
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            // 不应该抛出错误
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('js')
        })

        it('should handle null/undefined values', () => {
            const errorData = {
                subType: 'js',
                msg: null,
                url: undefined,
                line: 1,
                column: 1,
            }
            // 不应该抛出错误
            const fingerprint = generateFingerprint(errorData)
            expect(fingerprint).toContain('js')
        })
    })

    describe('isDuplicate', () => {
        it('should return false for first occurrence', () => {
            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            expect(isDuplicate(errorData)).toBe(false)
        })

        it('should return true for duplicate within interval', () => {
            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            // 第一次上报
            expect(isDuplicate(errorData)).toBe(false)
            // 立即再次上报，应该是重复
            expect(isDuplicate(errorData)).toBe(true)
        })

        it('should return false for duplicate after interval', () => {
            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            // 第一次上报
            expect(isDuplicate(errorData)).toBe(false)

            // 推进时间超过去重间隔（默认5秒）
            jest.advanceTimersByTime(6000)

            // 再次上报，应该不是重复
            expect(isDuplicate(errorData)).toBe(false)
        })

        it('should support custom interval', () => {
            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            // 第一次上报
            expect(isDuplicate(errorData, 10000)).toBe(false)

            // 推进5秒（小于自定义间隔10秒）
            jest.advanceTimersByTime(5000)
            expect(isDuplicate(errorData, 10000)).toBe(true)

            // 再推进5秒（总共10秒，等于间隔，应该还是重复）
            jest.advanceTimersByTime(5000)
            expect(isDuplicate(errorData, 10000)).toBe(true)

            // 再推进1秒（总共11秒，超过间隔）
            jest.advanceTimersByTime(1000)
            expect(isDuplicate(errorData, 10000)).toBe(false)
        })

        it('should treat different errors as non-duplicates', () => {
            const errorData1 = {
                subType: 'js',
                msg: 'error 1',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            const errorData2 = {
                subType: 'js',
                msg: 'error 2',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            expect(isDuplicate(errorData1)).toBe(false)
            expect(isDuplicate(errorData2)).toBe(false)
        })

        it('should treat same error at different locations as non-duplicates', () => {
            const errorData1 = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            const errorData2 = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 2,
                column: 1,
            }
            expect(isDuplicate(errorData1)).toBe(false)
            expect(isDuplicate(errorData2)).toBe(false)
        })

        it('should treat resource errors with same URL as duplicates', () => {
            const errorData1 = {
                subType: 'resource',
                url: 'http://example.com/image.png',
                resourceType: 'IMG',
            }
            const errorData2 = {
                subType: 'resource',
                url: 'http://example.com/image.png',
                resourceType: 'IMG',
            }
            expect(isDuplicate(errorData1)).toBe(false)
            expect(isDuplicate(errorData2)).toBe(true)
        })

        it('should treat resource errors with different URLs as non-duplicates', () => {
            const errorData1 = {
                subType: 'resource',
                url: 'http://example.com/image1.png',
                resourceType: 'IMG',
            }
            const errorData2 = {
                subType: 'resource',
                url: 'http://example.com/image2.png',
                resourceType: 'IMG',
            }
            expect(isDuplicate(errorData1)).toBe(false)
            expect(isDuplicate(errorData2)).toBe(false)
        })
    })

    describe('clearDedupCache', () => {
        it('should clear the cache', () => {
            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            // 添加一些缓存
            isDuplicate(errorData)
            expect(getDedupCacheSize()).toBe(1)

            // 清除缓存
            clearDedupCache()
            expect(getDedupCacheSize()).toBe(0)
        })
    })

    describe('getDedupCacheSize', () => {
        it('should return correct cache size', () => {
            expect(getDedupCacheSize()).toBe(0)

            const errorData1 = {
                subType: 'js',
                msg: 'error 1',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            const errorData2 = {
                subType: 'js',
                msg: 'error 2',
                url: 'http://example.com',
                line: 2,
                column: 1,
            }

            isDuplicate(errorData1)
            expect(getDedupCacheSize()).toBe(1)

            isDuplicate(errorData2)
            expect(getDedupCacheSize()).toBe(2)
        })
    })

    describe('cleanup', () => {
        it('should clean up expired entries', () => {
            // 先 mock Date.now，然后再调用 isDuplicate
            const now = 1000000
            jest.spyOn(Date, 'now').mockReturnValue(now)

            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }

            // 添加缓存（此时 Date.now() 返回 now）
            isDuplicate(errorData)
            expect(getDedupCacheSize()).toBe(1)

            // 启动清理：maxAge=10秒，清理间隔=10秒
            startCleanup(10000, 10000)

            // 推进时间超过清理间隔，并更新 Date.now 的返回值
            // 清理回调会检查 now + 11000 - now > 10000，所以会清理
            Date.now.mockReturnValue(now + 11000)
            jest.advanceTimersByTime(11000)

            // 缓存应该被清理
            expect(getDedupCacheSize()).toBe(0)

            Date.now.mockRestore()
        })

        it('should not clean up non-expired entries', () => {
            // 先 mock Date.now，然后再调用 isDuplicate
            const now = 1000000
            jest.spyOn(Date, 'now').mockReturnValue(now)

            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }

            // 添加缓存
            isDuplicate(errorData)
            expect(getDedupCacheSize()).toBe(1)

            // 启动清理：maxAge=60秒，清理间隔=60秒
            startCleanup(60000, 60000)

            // 推进时间但不超过清理间隔
            Date.now.mockReturnValue(now + 30000)
            jest.advanceTimersByTime(30000)

            // 缓存应该仍然存在（30秒 < 60秒 maxAge）
            expect(getDedupCacheSize()).toBe(1)

            Date.now.mockRestore()
        })

        it('should stop cleanup when stopCleanup is called', () => {
            startCleanup(10000, 10000)
            stopCleanup()

            const now = 1000000
            jest.spyOn(Date, 'now').mockReturnValue(now)

            const errorData = {
                subType: 'js',
                msg: 'test error',
                url: 'http://example.com',
                line: 1,
                column: 1,
            }
            isDuplicate(errorData)

            // 推进时间
            Date.now.mockReturnValue(now + 11000)
            jest.advanceTimersByTime(11000)

            // 由于清理已停止，缓存应该仍然存在
            expect(getDedupCacheSize()).toBe(1)

            Date.now.mockRestore()
        })
    })
})
