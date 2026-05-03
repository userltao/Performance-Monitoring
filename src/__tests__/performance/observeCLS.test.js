import observeCLS from '../../performance/observeCLS'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/observeCLS', () => {
    let observerCallback

    beforeEach(() => {
        lazyReportCache.mockClear()
        observerCallback = null

        global.PerformanceObserver = class {
            constructor(cb) {
                observerCallback = cb
            }
            observe() {}
            disconnect() {}
            takeRecords() { return [] }
        }
    })

    it('should observe layout-shift entries', () => {
        observeCLS()
        expect(observerCallback).toBeDefined()
    })

    it('should report CLS when value increases', () => {
        observeCLS()
        const entries = [{
            value: 0.05,
            startTime: 1000,
            hadRecentInput: false,
            toJSON: () => ({ value: 0.05, startTime: 1000, hadRecentInput: false }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'layout-shift',
                value: 0.05,
            })
        )
    })

    it('should ignore entries with recent input', () => {
        observeCLS()
        const entries = [{
            value: 0.05,
            startTime: 1000,
            hadRecentInput: true,
            toJSON: () => ({ value: 0.05, startTime: 1000, hadRecentInput: true }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(lazyReportCache).not.toHaveBeenCalled()
    })

    it('should accumulate CLS within session window', () => {
        observeCLS()
        const entries1 = [{
            value: 0.05,
            startTime: 1000,
            hadRecentInput: false,
            toJSON: () => ({ value: 0.05, startTime: 1000, hadRecentInput: false }),
        }]
        const entries2 = [{
            value: 0.03,
            startTime: 1500,
            hadRecentInput: false,
            toJSON: () => ({ value: 0.03, startTime: 1500, hadRecentInput: false }),
        }]
        observerCallback({ getEntries: () => entries1 })
        observerCallback({ getEntries: () => entries2 })
        const lastCall = lazyReportCache.mock.calls[lazyReportCache.mock.calls.length - 1][0]
        expect(lastCall.value).toBeCloseTo(0.08, 2)
    })

    it('should not observe when PerformanceObserver is not supported', () => {
        delete window.PerformanceObserver
        observeCLS()
        expect(lazyReportCache).not.toHaveBeenCalled()
        global.PerformanceObserver = class {
            observe() {}
            disconnect() {}
            takeRecords() { return [] }
        }
    })
})
