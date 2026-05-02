import { report, lazyReportCache, isSupportSendBeacon, reportWithXHR } from '../../utils/report'
import config from '../../config'

describe('isSupportSendBeacon', () => {
    it('should return true when sendBeacon is supported', () => {
        expect(isSupportSendBeacon()).toBe(true)
    })
})

describe('report', () => {
    beforeEach(() => {
        config.url = 'http://localhost:8080/reportData'
        config.appID = 'test-app'
        config.userID = 'user-123'
        navigator.sendBeacon.mockClear()
    })

    it('should report data immediately when isImmediate is true', () => {
        report({ type: 'error' }, true)
        expect(navigator.sendBeacon).toHaveBeenCalledTimes(1)
        expect(navigator.sendBeacon).toHaveBeenCalledWith(
            config.url,
            expect.stringContaining('"type":"error"')
        )
    })

    it('should include sessionID, appID, userID in report data', () => {
        report({ test: 1 }, true)
        const callData = JSON.parse(navigator.sendBeacon.mock.calls[0][1])
        expect(callData).toHaveProperty('id')
        expect(callData).toHaveProperty('appID', 'test-app')
        expect(callData).toHaveProperty('userID', 'user-123')
        expect(callData).toHaveProperty('data')
    })

    it('should log error when url is not set', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation()
        config.url = ''
        report({})
        expect(spy).toHaveBeenCalledWith('请设置上传 url 地址')
        spy.mockRestore()
    })

    it('should use requestIdleCallback when available', () => {
        const spy = jest.spyOn(window, 'requestIdleCallback')
        report({ type: 'test' }, false)
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})

describe('lazyReportCache', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        config.url = 'http://localhost:8080/reportData'
        navigator.sendBeacon.mockClear()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should batch report after timeout', () => {
        lazyReportCache({ type: 'click' })
        lazyReportCache({ type: 'scroll' })

        expect(navigator.sendBeacon).not.toHaveBeenCalled()

        jest.advanceTimersByTime(3000)
        expect(navigator.sendBeacon).toHaveBeenCalledTimes(1)
    })

    it('should not report when cache is empty', () => {
        jest.advanceTimersByTime(3000)
        expect(navigator.sendBeacon).not.toHaveBeenCalled()
    })
})
