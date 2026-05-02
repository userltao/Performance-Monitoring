import { isBlocking } from '../../performance/fps'

describe('isBlocking', () => {
    it('should detect continuous stuttering', () => {
        const fpsList = [60, 15, 10, 18, 60]
        expect(isBlocking(fpsList, 20, 3)).toBe(true)
    })

    it('should return false when no stuttering', () => {
        const fpsList = [60, 55, 58, 60]
        expect(isBlocking(fpsList, 20, 3)).toBe(false)
    })

    it('should return false when stuttering is not continuous', () => {
        const fpsList = [15, 60, 10, 60, 18]
        expect(isBlocking(fpsList, 20, 3)).toBe(false)
    })

    it('should use custom threshold', () => {
        const fpsList = [30, 30, 30]
        expect(isBlocking(fpsList, 35, 3)).toBe(true)
    })
})
