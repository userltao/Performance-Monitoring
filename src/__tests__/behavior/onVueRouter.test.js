import onVueRouter from '../../behavior/onVueRouter'
import { lazyReportCache } from '../../utils/report'

jest.mock('../../utils/report')
jest.mock('../../behavior/utils', () => ({
    getUUID: jest.fn(() => 'test-uuid'),
}))

describe('behavior/onVueRouter', () => {
    beforeEach(() => {
        lazyReportCache.mockClear()
    })

    it('should register beforeEach hook on router', () => {
        const router = { beforeEach: jest.fn() }
        onVueRouter(router)
        expect(router.beforeEach).toHaveBeenCalledTimes(1)
    })

    it('should skip first navigation (initial load)', () => {
        const router = { beforeEach: jest.fn() }
        onVueRouter(router)

        const guard = router.beforeEach.mock.calls[0][0]
        const next = jest.fn()
        guard({ name: null }, { name: null }, next)
        expect(next).toHaveBeenCalledWith()
        expect(lazyReportCache).not.toHaveBeenCalled()
    })

    it('should report on subsequent navigation', () => {
        const router = { beforeEach: jest.fn() }
        onVueRouter(router)

        const guard = router.beforeEach.mock.calls[0][0]
        const next = jest.fn()
        const to = { name: 'home', fullPath: '/home', params: {}, query: {} }
        const from = { name: 'about', fullPath: '/about' }

        guard(to, from, next)
        expect(next).toHaveBeenCalledWith()
        expect(lazyReportCache).toHaveBeenCalledTimes(1)
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: ['vue-router-change', 'pv'],
                name: 'home',
                from: '/about',
                to: '/home',
                uuid: 'test-uuid',
            })
        )
    })

    it('should use path when name is not available', () => {
        const router = { beforeEach: jest.fn() }
        onVueRouter(router)

        const guard = router.beforeEach.mock.calls[0][0]
        const next = jest.fn()
        const to = { name: null, fullPath: '/page', params: {}, query: {} }
        const from = { name: 'home', fullPath: '/home' }

        guard(to, from, next)
        // 源代码使用 to.name || to.path，当 name 为 null 时使用 path
        expect(lazyReportCache).toHaveBeenCalledWith(
            expect.objectContaining({
                to: '/page',
            })
        )
    })
})
