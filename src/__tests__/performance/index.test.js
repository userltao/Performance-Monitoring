import performance from '../../performance/index'
import observeEntries from '../../performance/observeEntries'
import observePaint from '../../performance/observePaint'
import observeLCP from '../../performance/observeLCP'
import observeCLS from '../../performance/observeCLS'
import observeFID from '../../performance/observeFID'
import observerLoad from '../../performance/observerLoad'
import observeFirstScreenPaint from '../../performance/observeFirstScreenPaint'
import xhr from '../../performance/xhr'
import fetch from '../../performance/fetch'
import fps from '../../performance/fps'
import onVueRouter from '../../performance/onVueRouter'
import config from '../../config'

jest.mock('../../performance/observeEntries')
jest.mock('../../performance/observePaint')
jest.mock('../../performance/observeLCP')
jest.mock('../../performance/observeCLS')
jest.mock('../../performance/observeFID')
jest.mock('../../performance/observerLoad')
jest.mock('../../performance/observeFirstScreenPaint')
jest.mock('../../performance/xhr')
jest.mock('../../performance/fetch')
jest.mock('../../performance/fps')
jest.mock('../../performance/onVueRouter')

describe('performance/index', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        config.vue = null
    })

    it('should call all performance modules', () => {
        performance()
        expect(observeEntries).toHaveBeenCalledTimes(1)
        expect(observePaint).toHaveBeenCalledTimes(1)
        expect(observeLCP).toHaveBeenCalledTimes(1)
        expect(observeCLS).toHaveBeenCalledTimes(1)
        expect(observeFID).toHaveBeenCalledTimes(1)
        expect(xhr).toHaveBeenCalledTimes(1)
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fps).toHaveBeenCalledTimes(1)
        expect(observerLoad).toHaveBeenCalledTimes(1)
        expect(observeFirstScreenPaint).toHaveBeenCalledTimes(1)
    })

    it('should call onVueRouter when Vue router is configured', () => {
        const mockVue = { mixin: jest.fn() }
        const mockRouter = { beforeEach: jest.fn() }
        config.vue = { Vue: mockVue, router: mockRouter }
        performance()
        expect(onVueRouter).toHaveBeenCalledWith(mockVue, mockRouter)
    })

    it('should not call onVueRouter when Vue router is not configured', () => {
        performance()
        expect(onVueRouter).not.toHaveBeenCalled()
    })

    it('should not call onVueRouter when config.vue is null', () => {
        config.vue = null
        performance()
        expect(onVueRouter).not.toHaveBeenCalled()
    })
})
