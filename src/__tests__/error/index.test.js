import error from '../../error'
import { lazyReportCache } from '../../utils/report'
import { clearDedupCache } from '../../utils/dedup'

jest.mock('../../utils/report')

describe('Error Monitor', () => {
    beforeEach(() => {
        lazyReportCache.mockClear()
        clearDedupCache()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should capture console.error', () => {
        error()
        console.error('test error message')
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'error',
                subType: 'console-error',
                errData: expect.arrayContaining(['test error message']),
            })
        )
    })

    it('should capture unhandledrejection', () => {
        error()
        const event = new Event('unhandledrejection')
        event.reason = new Error('promise error')
        window.dispatchEvent(event)

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'error',
                subType: 'promise',
            })
        )
    })

    it('should capture resource load error', () => {
        error()
        const img = document.createElement('img')
        img.src = 'http://example.com/not-found.png'
        document.body.appendChild(img)

        const errorEvent = new Event('error', { bubbles: true })
        Object.defineProperty(errorEvent, 'target', { value: img })
        img.dispatchEvent(errorEvent)

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'error',
                subType: 'resource',
                url: 'http://example.com/not-found.png',
                resourceType: 'IMG',
            })
        )
        document.body.removeChild(img)
    })

    it('should set window.onerror', () => {
        error()
        expect(window.onerror).toBeDefined()
    })

    describe('deduplication', () => {
        it('should deduplicate identical console errors within interval', () => {
            error()
            console.error('same error')
            console.error('same error')
            console.error('same error')

            // 相同错误应该只上报一次
            expect(lazyReportCache).toHaveBeenCalledTimes(1)
        })

        it('should report same console error after interval', () => {
            error()
            console.error('same error')
            expect(lazyReportCache).toHaveBeenCalledTimes(1)

            // 推进时间超过去重间隔（5秒）
            jest.advanceTimersByTime(6000)

            console.error('same error')
            expect(lazyReportCache).toHaveBeenCalledTimes(2)
        })

        it('should not deduplicate different console errors', () => {
            error()
            console.error('error 1')
            console.error('error 2')
            console.error('error 3')

            // 不同错误应该分别上报
            expect(lazyReportCache).toHaveBeenCalledTimes(3)
        })

        it('should deduplicate identical console errors with same arguments', () => {
            error()
            console.error('TypeError: cannot read property', 'detail')
            console.error('TypeError: cannot read property', 'detail')

            // 相同参数的错误应该只上报一次
            expect(lazyReportCache).toHaveBeenCalledTimes(1)
        })

        it('should not deduplicate console errors with different arguments', () => {
            error()
            console.error('TypeError: cannot read property', 'detail1')
            console.error('TypeError: cannot read property', 'detail2')

            // 不同参数的错误应该分别上报
            expect(lazyReportCache).toHaveBeenCalledTimes(2)
        })
    })
})
