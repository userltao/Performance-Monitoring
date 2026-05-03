import observeFID from '../../performance/observeFID'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/observeFID', () => {
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

    it('should observe first-input entries', () => {
        observeFID()
        expect(observerCallback).toBeDefined()
    })

    it('should report FID entry', () => {
        observeFID()
        const entry = {
            name: 'mousedown',
            entryType: 'first-input',
            startTime: 100,
            processingStart: 150,
            processingEnd: 160,
            duration: 50,
            cancelable: true,
            toJSON: () => ({
                name: 'mousedown',
                entryType: 'first-input',
                startTime: 100,
                processingStart: 150,
                processingEnd: 160,
                duration: 50,
                cancelable: true,
            }),
        }
        observerCallback({ getEntries: () => [entry] })
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                name: 'first-input',
                event: 'mousedown',
            })
        )
    })

    it('should disconnect observer after first FID', () => {
        const disconnectSpy = jest.fn()
        global.PerformanceObserver = class {
            constructor(cb) {
                observerCallback = cb
                this.disconnect = disconnectSpy
            }
            observe() {}
        }

        observeFID()
        const entry = {
            name: 'click',
            entryType: 'first-input',
            startTime: 200,
            duration: 30,
            cancelable: true,
            toJSON: () => ({
                name: 'click',
                entryType: 'first-input',
                startTime: 200,
                duration: 30,
                cancelable: true,
            }),
        }
        observerCallback({ getEntries: () => [entry] })
        expect(disconnectSpy).toHaveBeenCalled()
    })

    it('should not observe when PerformanceObserver is not supported', () => {
        delete window.PerformanceObserver
        observeFID()
        expect(lazyReportCache).not.toHaveBeenCalled()
        global.PerformanceObserver = class {
            observe() {}
            disconnect() {}
        }
    })
})
