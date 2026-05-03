import { isSupportPerformanceObserver } from '../../performance/utils'

describe('performance/utils', () => {
    describe('isSupportPerformanceObserver', () => {
        it('should return true when PerformanceObserver is supported', () => {
            expect(isSupportPerformanceObserver()).toBe(true)
        })

        it('should return false when PerformanceObserver is not supported', () => {
            const original = window.PerformanceObserver
            delete window.PerformanceObserver
            expect(isSupportPerformanceObserver()).toBe(false)
            window.PerformanceObserver = original
        })
    })
})
