describe('performance/observeLCP', () => {
    let observerCallback
    let observeLCP
    let isLCPDone
    let lazyReportCache

    beforeEach(() => {
        observerCallback = null

        // 重置模块以重置 lcpDone 状态
        jest.resetModules()

        // 重新设置 PerformanceObserver mock
        global.PerformanceObserver = class {
            constructor(cb) {
                observerCallback = cb
            }
            observe() {}
            disconnect() {}
        }

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
        }))

        // 重新获取模块引用
        observeLCP = require('../../performance/observeLCP').default
        isLCPDone = require('../../performance/observeLCP').isLCPDone
        lazyReportCache = require('../../utils/report').lazyReportCache
    })

    it('should observe largest-contentful-paint entries', () => {
        observeLCP()
        expect(observerCallback).toBeDefined()
    })

    it('should report LCP entry', () => {
        observeLCP()
        const entries = [{
            entryType: 'largest-contentful-paint',
            startTime: 245.8,
            size: 250000,
            element: { tagName: 'IMG' },
            toJSON: () => ({
                entryType: 'largest-contentful-paint',
                startTime: 245.8,
                size: 250000,
            }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'largest-contentful-paint',
                target: 'IMG',
            })
        )
    })

    it('should disconnect observer after first LCP', () => {
        const disconnectSpy = jest.fn()
        global.PerformanceObserver = class {
            constructor(cb) {
                observerCallback = cb
                this.disconnect = disconnectSpy
            }
            observe() {}
        }

        observeLCP()
        const entries = [{
            entryType: 'largest-contentful-paint',
            startTime: 245.8,
            element: null,
            toJSON: () => ({ entryType: 'largest-contentful-paint', startTime: 245.8 }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(disconnectSpy).toHaveBeenCalled()
    })

    it('should set lcpDone to true when LCP is observed', () => {
        observeLCP()
        expect(isLCPDone()).toBe(false)
        const entries = [{
            entryType: 'largest-contentful-paint',
            startTime: 245.8,
            element: null,
            toJSON: () => ({ entryType: 'largest-contentful-paint', startTime: 245.8 }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(isLCPDone()).toBe(true)
    })

    it('should set lcpDone to true when PerformanceObserver is not supported', () => {
        delete window.PerformanceObserver
        observeLCP()
        expect(isLCPDone()).toBe(true)
    })
})
