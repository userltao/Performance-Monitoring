import monitor from '../index'
import error from '../error/index'
import performance from '../performance/index'
import behavior from '../behavior/index'
import { setConfig } from '../config'
import { report } from '../utils/report'
import { getCache, clearCache } from '../utils/cache'

jest.mock('../error/index')
jest.mock('../performance/index')
jest.mock('../behavior/index')
jest.mock('../config')
jest.mock('../utils/report')
jest.mock('../utils/cache')

describe('monitor', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        getCache.mockReturnValue([])
    })

    it('should export monitor object with init and report', () => {
        expect(monitor).toHaveProperty('init')
        expect(monitor).toHaveProperty('report')
        expect(typeof monitor.init).toBe('function')
        expect(typeof monitor.report).toBe('function')
    })

    it('should call setConfig with options on init', () => {
        const options = { url: 'http://example.com', appID: 'test' }
        monitor.init(options)
        expect(setConfig).toHaveBeenCalledWith(options)
    })

    it('should call error, performance, and behavior on init', () => {
        monitor.init()
        expect(error).toHaveBeenCalledTimes(1)
        expect(performance).toHaveBeenCalledTimes(1)
        expect(behavior).toHaveBeenCalledTimes(1)
    })

    it('should call init with empty options by default', () => {
        monitor.init()
        expect(setConfig).toHaveBeenCalledWith({})
    })

    it('should expose report function', () => {
        expect(monitor.report).toBe(report)
    })
})
