describe('behavior/pageChange', () => {
    let pageChange
    let lazyReportCache

    beforeEach(() => {
        // 重置模块以重置模块级状态
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
        }))
        jest.mock('../../behavior/utils', () => ({
            getUUID: jest.fn(() => 'test-uuid'),
        }))

        // 重新获取模块引用
        pageChange = require('../../behavior/pageChange').default
        lazyReportCache = require('../../utils/report').lazyReportCache
    })

    it('should register popstate and hashchange listeners', () => {
        const addSpy = jest.spyOn(window, 'addEventListener')
        pageChange()
        expect(addSpy).toHaveBeenCalledWith('popstate', expect.any(Function), true)
        expect(addSpy).toHaveBeenCalledWith('hashchange', expect.any(Function), true)
        addSpy.mockRestore()
    })

    it('should report on popstate event', () => {
        pageChange()
        window.dispatchEvent(new PopStateEvent('popstate'))
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'popstate',
                uuid: 'test-uuid',
            })
        )
    })

    it('should report on hashchange event', () => {
        pageChange()
        const event = new HashChangeEvent('hashchange', {
            oldURL: 'http://localhost/#old',
            newURL: 'http://localhost/#new',
        })
        window.dispatchEvent(event)
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
        // oldURL 初始值为空字符串，from 会是空字符串
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'hashchange',
                to: 'http://localhost/#new',
                uuid: 'test-uuid',
            })
        )
    })

    it('should track from URL on subsequent hashchange events', () => {
        pageChange()
        const event1 = new HashChangeEvent('hashchange', {
            oldURL: '',
            newURL: 'http://localhost/#first',
        })
        window.dispatchEvent(event1)
        lazyReportCache.mockClear()

        const event2 = new HashChangeEvent('hashchange', {
            oldURL: 'http://localhost/#first',
            newURL: 'http://localhost/#second',
        })
        window.dispatchEvent(event2)
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'http://localhost/#first',
                to: 'http://localhost/#second',
            })
        )
    })
})
