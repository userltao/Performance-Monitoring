import { deepCopy, getPageURL } from '../../utils/utils'

describe('deepCopy', () => {
    it('should copy primitive values', () => {
        expect(deepCopy(123)).toBe(123)
        expect(deepCopy('abc')).toBe('abc')
    })

    it('should deep copy object', () => {
        const obj = { a: 1, b: { c: 2 } }
        const copy = deepCopy(obj)
        copy.b.c = 3
        expect(obj.b.c).toBe(2)
    })

    it('should deep copy array', () => {
        const arr = [1, [2, 3]]
        const copy = deepCopy(arr)
        copy[1][0] = 99
        expect(arr[1][0]).toBe(2)
    })
})

describe('getPageURL', () => {
    it('should return current page URL', () => {
        expect(getPageURL()).toBe('http://localhost/')
    })
})
