describe('performance/fetch', () => {
    let lazyReportCache

    beforeEach(() => {
        // 重置模块
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
        }))

        // 必须在 require 之前设置 window.fetch，因为源代码在模块加载时保存 originalFetch
        window.fetch = jest.fn().mockResolvedValue({
            status: 200,
            ok: true,
            clone: () => ({ status: 200, ok: true }),
        })

        // 重新获取模块引用
        lazyReportCache = require('../../utils/report').lazyReportCache
    })

    it('should override window.fetch', () => {
        const fetchMonitor = require('../../performance/fetch').default
        const currentFetch = window.fetch
        fetchMonitor()
        expect(window.fetch).not.toBe(currentFetch)
    })

    it('should report successful fetch request', async () => {
        const fetchMonitor = require('../../performance/fetch').default
        fetchMonitor()
        await window.fetch('http://example.com/api')

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'fetch',
                url: 'http://example.com/api',
                method: 'GET',
                status: 200,
                success: true,
            })
        )
    })

    it('should report failed fetch request', async () => {
        // 重新设置 fetch mock 为失败
        window.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

        const fetchMonitor = require('../../performance/fetch').default
        fetchMonitor()
        try {
            await window.fetch('http://example.com/api')
        } catch (e) {
            // expected
        }

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'fetch',
                url: 'http://example.com/api',
                status: 0,
                success: false,
            })
        )
    })

    it('should report POST method correctly', async () => {
        const fetchMonitor = require('../../performance/fetch').default
        fetchMonitor()
        await window.fetch('http://example.com/api', { method: 'post' })

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
            })
        )
    })

    it('should include duration in report', async () => {
        const fetchMonitor = require('../../performance/fetch').default
        fetchMonitor()
        await window.fetch('http://example.com/api')

        const callData = lazyReportCache.mock.calls[0][0]
        expect(callData.duration).toBeDefined()
        expect(callData.startTime).toBeDefined()
        expect(callData.endTime).toBeDefined()
    })
})
