import observerLoad from '../../performance/observerLoad'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/observerLoad', () => {
    beforeEach(() => {
        lazyReportCache.mockClear()
    })

    it('should register load and DOMContentLoaded listeners', () => {
        const addSpy = jest.spyOn(window, 'addEventListener')
        observerLoad()
        expect(addSpy).toHaveBeenCalledWith('load', expect.any(Function), true)
        expect(addSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function), true)
        addSpy.mockRestore()
    })

    it('should report load event', () => {
        observerLoad()
        window.dispatchEvent(new Event('load'))
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'load',
            })
        )
    })

    it('should report DOMContentLoaded event', () => {
        observerLoad()
        window.dispatchEvent(new Event('DOMContentLoaded'))
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'domcontentloaded',
            })
        )
    })

    it('should include startTime in report', () => {
        observerLoad()
        window.dispatchEvent(new Event('load'))
        const callData = lazyReportCache.mock.calls[0][0]
        expect(callData.startTime).toBeDefined()
    })
})
