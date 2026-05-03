import observePaint from '../../performance/observePaint'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/observePaint', () => {
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
        }
    })

    it('should observe paint entries', () => {
        observePaint()
        expect(observerCallback).toBeDefined()
    })

    it('should report FP entry', () => {
        observePaint()
        const entries = [{
            name: 'first-paint',
            startTime: 100,
            toJSON: () => ({ name: 'first-paint', startTime: 100, duration: 0 }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'first-paint',
                name: 'first-paint',
            })
        )
    })

    it('should report FCP entry', () => {
        observePaint()
        const entries = [{
            name: 'first-contentful-paint',
            startTime: 150,
            toJSON: () => ({ name: 'first-contentful-paint', startTime: 150, duration: 0 }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'first-contentful-paint',
                name: 'first-contentful-paint',
            })
        )
    })

    it('should disconnect observer on FCP', () => {
        const disconnectSpy = jest.fn()
        global.PerformanceObserver = class {
            constructor(cb) {
                observerCallback = cb
                this.disconnect = disconnectSpy
            }
            observe() {}
        }

        observePaint()
        const entries = [{
            name: 'first-contentful-paint',
            startTime: 150,
            toJSON: () => ({ name: 'first-contentful-paint', startTime: 150, duration: 0 }),
        }]
        observerCallback({ getEntries: () => entries })
        expect(disconnectSpy).toHaveBeenCalled()
    })

    it('should not observe when PerformanceObserver is not supported', () => {
        delete window.PerformanceObserver
        observePaint()
        expect(lazyReportCache).not.toHaveBeenCalled()
        global.PerformanceObserver = class {
            observe() {}
            disconnect() {}
        }
    })
})
