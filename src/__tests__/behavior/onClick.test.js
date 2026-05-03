describe('behavior/onClick', () => {
    let onClick
    let lazyReportCache

    beforeEach(() => {
        jest.useFakeTimers()

        // 重置模块
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
        }))
        jest.mock('../../behavior/utils', () => ({
            getUUID: jest.fn(() => 'test-uuid'),
        }))

        // 重新获取模块引用
        onClick = require('../../behavior/onClick').default
        lazyReportCache = require('../../utils/report').lazyReportCache
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should register mousedown and touchstart listeners', () => {
        const addSpy = jest.spyOn(window, 'addEventListener')
        onClick()
        expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(addSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
        addSpy.mockRestore()
    })

    it('should report click after debounce', () => {
        onClick()

        const target = document.createElement('div')
        target.getBoundingClientRect = jest.fn(() => ({
            top: 100,
            left: 200,
            width: 50,
            height: 30,
        }))

        const event = new MouseEvent('mousedown', { bubbles: true })
        Object.defineProperty(event, 'target', { value: target, writable: false })
        Object.defineProperty(event, 'timeStamp', { value: 1000, writable: false })

        window.dispatchEvent(event)
        expect(lazyReportCache).not.toHaveBeenCalled()

        jest.advanceTimersByTime(500)
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'click',
                eventType: 'mousedown',
                target: 'DIV',
                uuid: 'test-uuid',
            })
        )
    })

    it('should debounce multiple clicks', () => {
        onClick()

        const target = document.createElement('button')
        target.getBoundingClientRect = jest.fn(() => ({ top: 0, left: 0 }))

        const event1 = new MouseEvent('mousedown', { bubbles: true })
        Object.defineProperty(event1, 'target', { value: target, writable: false })
        Object.defineProperty(event1, 'timeStamp', { value: 1000, writable: false })

        const event2 = new MouseEvent('mousedown', { bubbles: true })
        Object.defineProperty(event2, 'target', { value: target, writable: false })
        Object.defineProperty(event2, 'timeStamp', { value: 1200, writable: false })

        window.dispatchEvent(event1)
        jest.advanceTimersByTime(200)
        window.dispatchEvent(event2)
        jest.advanceTimersByTime(500)

        expect(lazyReportCache).toHaveBeenCalledTimes(1)
    })
})
