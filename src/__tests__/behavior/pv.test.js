import pv from '../../behavior/pv'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')
jest.mock('../../behavior/utils', () => ({
    getUUID: jest.fn(() => 'test-uuid'),
}))

describe('behavior/pv', () => {
    beforeEach(() => {
        lazyReportCache.mockClear()
    })

    it('should report page view with correct data structure', () => {
        pv()
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'pv',
                pageURL: expect.any(String),
                uuid: 'test-uuid',
            })
        )
    })

    it('should include startTime', () => {
        pv()
        const callData = lazyReportCache.mock.calls[0][0]
        expect(callData.startTime).toBeDefined()
    })

    it('should include referrer', () => {
        pv()
        const callData = lazyReportCache.mock.calls[0][0]
        expect(callData).toHaveProperty('referrer')
    })
})
