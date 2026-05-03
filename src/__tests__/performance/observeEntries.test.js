import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/observeEntries', () => {
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

    it('should report resource entry', () => {
        // 直接测试 observeEvent 函数
        const { observeEvent } = require('../../performance/observeEntries')
        observeEvent('resource')

        const entry = {
            name: 'http://example.com/script.js',
            initiatorType: 'script',
            duration: 100,
            domainLookupEnd: 10,
            domainLookupStart: 5,
            connectEnd: 20,
            connectStart: 15,
            redirectEnd: 0,
            redirectStart: 0,
            responseStart: 30,
            encodedBodySize: 1000,
            transferSize: 1200,
            decodedBodySize: 1500,
            nextHopProtocol: 'h2',
            toJSON: () => ({}),
        }
        observerCallback({ getEntries: () => [entry] })
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'resource',
                sourceType: 'script',
            })
        )
    })

    it('should not report beacon entries', () => {
        const { observeEvent } = require('../../performance/observeEntries')
        observeEvent('resource')

        const entry = {
            name: 'http://example.com/report',
            initiatorType: 'beacon',
            nextHopProtocol: 'h2',
            toJSON: () => ({}),
        }
        observerCallback({ getEntries: () => [entry] })
        expect(lazyReportCache).not.toHaveBeenCalled()
    })

    it('should not report entries without nextHopProtocol for resource type', () => {
        const { observeEvent } = require('../../performance/observeEntries')
        observeEvent('resource')

        const entry = {
            name: 'http://example.com/script.js',
            initiatorType: 'script',
            nextHopProtocol: '',
            toJSON: () => ({}),
        }
        observerCallback({ getEntries: () => [entry] })
        expect(lazyReportCache).not.toHaveBeenCalled()
    })
})
