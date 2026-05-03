import behavior from '../../behavior/index'
import pv from '../../behavior/pv'
import pageAccessDuration from '../../behavior/pageAccessDuration'
import pageAccessHeight from '../../behavior/pageAccessHeight'
import onClick from '../../behavior/onClick'
import pageChange from '../../behavior/pageChange'
import onVueRouter from '../../behavior/onVueRouter'
import config from '../../config'

jest.mock('../../behavior/pv')
jest.mock('../../behavior/pageAccessDuration')
jest.mock('../../behavior/pageAccessHeight')
jest.mock('../../behavior/onClick')
jest.mock('../../behavior/pageChange')
jest.mock('../../behavior/onVueRouter')

describe('behavior/index', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        config.vue = null
    })

    it('should call all behavior modules', () => {
        behavior()
        expect(pv).toHaveBeenCalledTimes(1)
        expect(pageAccessDuration).toHaveBeenCalledTimes(1)
        expect(pageAccessHeight).toHaveBeenCalledTimes(1)
        expect(onClick).toHaveBeenCalledTimes(1)
        expect(pageChange).toHaveBeenCalledTimes(1)
    })

    it('should call onVueRouter when Vue router is configured', () => {
        const mockRouter = { beforeEach: jest.fn() }
        config.vue = { router: mockRouter }
        behavior()
        expect(onVueRouter).toHaveBeenCalledWith(mockRouter)
    })

    it('should not call onVueRouter when Vue router is not configured', () => {
        behavior()
        expect(onVueRouter).not.toHaveBeenCalled()
    })

    it('should not call onVueRouter when config.vue is null', () => {
        config.vue = null
        behavior()
        expect(onVueRouter).not.toHaveBeenCalled()
    })
})
