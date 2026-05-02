import generateUniqueID from '../../utils/generateUniqueID'

describe('generateUniqueID', () => {
    it('should generate unique ID with correct format', () => {
        const id = generateUniqueID()
        expect(id).toMatch(/^v2-\d+-\d+$/)
    })

    it('should generate different IDs', () => {
        const id1 = generateUniqueID()
        const id2 = generateUniqueID()
        expect(id1).not.toBe(id2)
    })
})
