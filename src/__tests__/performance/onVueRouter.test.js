import onVueRouter from '../../performance/onVueRouter'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')

describe('performance/onVueRouter', () => {
    let beforeEachCallback
    let mountedCallback

    beforeEach(() => {
        lazyReportCache.mockClear()
        jest.useFakeTimers()
        beforeEachCallback = null
        mountedCallback = null
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    function createMockRouter() {
        return {
            beforeEach: jest.fn(cb => { beforeEachCallback = cb }),
            needCalculateRenderTime: false,
        }
    }

    function createMockVue() {
        return {
            mixin: jest.fn(config => {
                mountedCallback = config.mounted
            }),
        }
    }

    it('should register beforeEach hook and mixin', () => {
        const router = createMockRouter()
        const Vue = createMockVue()
        onVueRouter(Vue, router)
        expect(router.beforeEach).toHaveBeenCalled()
        expect(Vue.mixin).toHaveBeenCalled()
    })

    it('should skip first navigation', () => {
        const router = createMockRouter()
        const Vue = createMockVue()
        onVueRouter(Vue, router)

        const next = jest.fn()
        beforeEachCallback({}, {}, next)
        expect(next).toHaveBeenCalled()
        expect(router.needCalculateRenderTime).toBe(false)
    })

    it('should set needCalculateRenderTime on subsequent navigation', () => {
        const router = createMockRouter()
        const Vue = createMockVue()
        onVueRouter(Vue, router)

        const next = jest.fn()
        beforeEachCallback({}, {}, next)
        beforeEachCallback({}, {}, next)
        expect(router.needCalculateRenderTime).toBe(true)
    })

    it('should report render time when mounted callback fires', () => {
        const router = createMockRouter()
        const Vue = createMockVue()
        onVueRouter(Vue, router)

        const next = jest.fn()
        beforeEachCallback({}, {}, next)
        beforeEachCallback({}, {}, next)

        const mockInstance = {
            $nextTick: jest.fn(cb => cb()),
        }
        router.needCalculateRenderTime = true
        mountedCallback.call(mockInstance)
        jest.advanceTimersByTime(1000)

        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'performance',
                subType: 'vue-router-change-paint',
            })
        )
    })
})
