describe('behavior/pageAccessDuration', () => {
    let pageAccessDuration
    let report

    beforeEach(() => {
        // 重置模块以重置事件监听器
        jest.resetModules()

        // 注册 mock 工厂
        jest.mock('../../utils/report', () => ({
            report: jest.fn(),
        }))
        jest.mock('../../behavior/utils', () => ({
            getUUID: jest.fn(() => 'test-uuid'),
        }))

        // 重新获取模块引用
        pageAccessDuration = require('../../behavior/pageAccessDuration').default
        report = require('../../utils/report').report
    })

    it('should register beforeunload listener', () => {
        const addSpy = jest.spyOn(window, 'addEventListener')
        pageAccessDuration()
        // onBeforeunload 使用 capture: true 参数
        expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function), true)
        addSpy.mockRestore()
    })

    it('should report page access duration on beforeunload', () => {
        pageAccessDuration()
        window.dispatchEvent(new Event('beforeunload'))
        expect(report).toHaveBeenCalledTimes(1)
        expect(report).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'behavior',
                subType: 'page-access-duration',
                pageURL: expect.any(String),
                uuid: 'test-uuid',
            }),
            true
        )
    })

    it('should include startTime in report', () => {
        pageAccessDuration()
        window.dispatchEvent(new Event('beforeunload'))
        const callData = report.mock.calls[0][0]
        expect(callData.startTime).toBeDefined()
    })
})
