describe('behavior/utils', () => {
    let getUUID
    let generateUniqueID

    beforeEach(() => {
        // 重置模块以重置模块级状态 (uuid 变量)
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/generateUniqueID', () => jest.fn(() => 'mock-uuid-123'))

        // 使用 spyOn 来 mock localStorage 方法
        jest.spyOn(Storage.prototype, 'getItem')
        jest.spyOn(Storage.prototype, 'setItem')
        jest.spyOn(Storage.prototype, 'removeItem')
        jest.spyOn(Storage.prototype, 'clear')

        // 重新获取模块引用
        getUUID = require('../../behavior/utils').getUUID
        generateUniqueID = require('../../utils/generateUniqueID')
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('getUUID', () => {
        it('should generate and cache UUID in localStorage', () => {
            const uuid = getUUID()
            expect(uuid).toBe('mock-uuid-123')
            expect(Storage.prototype.setItem).toHaveBeenCalledWith('uuid', 'mock-uuid-123')
        })

        it('should return cached UUID from localStorage', () => {
            // 模拟 localStorage 中已有值
            Storage.prototype.getItem.mockReturnValue('existing-uuid')

            const uuid = getUUID()
            expect(uuid).toBe('existing-uuid')
            expect(generateUniqueID).not.toHaveBeenCalled()
        })

        it('should return same UUID on subsequent calls', () => {
            const uuid1 = getUUID()
            const uuid2 = getUUID()
            expect(uuid1).toBe(uuid2)
            // 第一次调用时会生成 UUID，之后使用模块级缓存
            expect(generateUniqueID).toHaveBeenCalledTimes(1)
        })
    })
})
