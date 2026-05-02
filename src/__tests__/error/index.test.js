import error from '../../error'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('Error Monitor', () => {
    beforeEach(() => {
        lazyReportCache.mockClear()
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
})
