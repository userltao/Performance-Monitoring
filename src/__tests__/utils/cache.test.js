import { addCache, getCache, clearCache } from '../../utils/cache'

describe('Cache Module', () => {
    beforeEach(() => {
        clearCache()
    })

    it('should add data to cache', () => {
        addCache({ type: 'error', msg: 'test' })
        const cache = getCache()
        expect(cache).toHaveLength(1)
        expect(cache[0].type).toBe('error')
    })

    it('should return deep copy of cache', () => {
        addCache({ data: { nested: true } })
        const cache1 = getCache()
        const cache2 = getCache()
        expect(cache1).not.toBe(cache2)
        expect(cache1).toEqual(cache2)
    })

    it('should clear cache', () => {
        addCache({ a: 1 })
        addCache({ b: 2 })
        clearCache()
        expect(getCache()).toHaveLength(0)
    })
})
