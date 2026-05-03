describe('behavior/pageAccessHeight', () => {
    let pageAccessHeight
    let lazyReportCache
    let report

    beforeEach(() => {
        jest.useFakeTimers()

        // 重置模块以重置模块级状态
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
            report: jest.fn(),
        }))
        jest.mock('../../behavior/utils', () => ({
            getUUID: jest.fn(() => 'test-uuid'),
        }))

        // 重新获取模块引用
        pageAccessHeight = require('../../behavior/pageAccessHeight').default
        lazyReportCache = require('../../utils/report').lazyReportCache
        report = require('../../utils/report').report
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should register scroll and beforeunload listeners', () => {
        const addSpy = jest.spyOn(window, 'addEventListener')
        pageAccessHeight()
        expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
        addSpy.mockRestore()
    })

    it('should report on first scroll with debounce', () => {
        pageAccessHeight()
        window.dispatchEvent(new Event('scroll'))
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'page-access-height',
                uuid: 'test-uuid',
            })
        )
    })

    it('should debounce scroll events', () => {
        pageAccessHeight()
        window.dispatchEvent(new Event('scroll'))
        lazyReportCache.mockClear()

        window.dispatchEvent(new Event('scroll'))
        expect(lazyReportCache).not.toHaveBeenCalled()

        jest.advanceTimersByTime(500)
        window.dispatchEvent(new Event('scroll'))
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
    })

    it('should report on beforeunload', () => {
        pageAccessHeight()
        window.dispatchEvent(new Event('beforeunload'))
        expect(report).toHaveBeenCalledTimes(1)
        expect(report).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'page-access-height',
                uuid: 'test-uuid',
            }),
            true
        )
    })

    it('should include value as percentage', () => {
        pageAccessHeight()
        window.dispatchEvent(new Event('scroll'))
        const callData = lazyReportCache.mock.calls[0][0]
        expect(callData.value).toMatch(/^\d+(\.\d+)?%$/)
    })
})
