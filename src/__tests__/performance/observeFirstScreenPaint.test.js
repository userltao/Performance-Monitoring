import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/observeFirstScreenPaint', () => {
    beforeEach(() => {
        lazyReportCache.mockClear()
    })

    it('should create MutationObserver', () => {
        const observeSpy = jest.fn()
        global.MutationObserver = class {
            constructor() {}
            observe = observeSpy
            disconnect() {}
        }

        const observeFirstScreenPaint = require('../../performance/observeFirstScreenPaint').default
        observeFirstScreenPaint()
        expect(observeSpy).toHaveBeenCalledWith(document, {
            childList: true,
            subtree: true,
        })
    })

    it('should not create MutationObserver when not supported', () => {
        const original = global.MutationObserver
        // 使用 var 来避免 ReferenceError
        global.MutationObserver = undefined

        const observeFirstScreenPaint = require('../../performance/observeFirstScreenPaint').default
        observeFirstScreenPaint()
        expect(lazyReportCache).not.toHaveBeenCalled()

        global.MutationObserver = original
    })
})
