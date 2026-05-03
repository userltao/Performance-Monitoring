describe('performance/xhr', () => {
    let xhrMonitor
    let lazyReportCache

    beforeEach(() => {
        // 重置模块
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
        }))

        // 重新获取模块引用
        xhrMonitor = require('../../performance/xhr').default
        lazyReportCache = require('../../utils/report').lazyReportCache

        xhrMonitor()
    })

    it('should override XMLHttpRequest.prototype.open and send', () => {
        const xhr = new XMLHttpRequest()
        expect(typeof xhr.open).toBe('function')
        expect(typeof xhr.send).toBe('function')
    })

    it('should store url and method from open call', () => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', 'http://example.com/api')
        expect(xhr.url).toBe('http://example.com/api')
        expect(xhr.method).toBe('POST')
    })

    it('should add loadend listener on send', () => {
        const addSpy = jest.spyOn(XMLHttpRequest.prototype, 'addEventListener')
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'http://example.com/api')
        xhr.send()
        expect(addSpy).toHaveBeenCalledWith('loadend', expect.any(Function), true)
        addSpy.mockRestore()
    })

    it('should report xhr data on loadend', () => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'http://example.com/api')
        xhr.send()

        Object.defineProperty(xhr, 'status', { value: 200, writable: true })
        xhr.dispatchEvent(new Event('loadend'))

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'xhr',
                url: 'http://example.com/api',
                method: 'GET',
                status: 200,
                success: true,
            })
        )
    })

    it('should report failed xhr request', () => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'http://example.com/api')
        xhr.send()

        Object.defineProperty(xhr, 'status', { value: 500, writable: true })
        xhr.dispatchEvent(new Event('loadend'))

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 500,
                success: false,
            })
        )
    })
})
