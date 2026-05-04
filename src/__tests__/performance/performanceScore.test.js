describe('performance/performanceScore', () => {
    let calculateMetricScore
    let calculatePerformanceScore
    let getRating
    let updateMetric
    let getMetrics
    let resetMetrics

    beforeEach(() => {
        jest.resetModules()

        // Mock PerformanceObserver
        global.PerformanceObserver = class {
            constructor(cb) {
                this.cb = cb
            }
            observe() {}
            disconnect() {}
        }

        // Mock report
        jest.mock('../../utils/report', () => ({
            lazyReportCache: jest.fn(),
            report: jest.fn(),
        }))

        // Mock utils
        jest.mock('../../utils/utils', () => ({
            getPageURL: () => 'http://test.com',
        }))

        // 获取模块引用
        const module = require('../../performance/performanceScore')
        calculateMetricScore = module.calculateMetricScore
        calculatePerformanceScore = module.calculatePerformanceScore
        getRating = module.getRating
        updateMetric = module.updateMetric
        getMetrics = module.getMetrics
        resetMetrics = module.resetMetrics
    })

    afterEach(() => {
        resetMetrics()
    })

    describe('calculateMetricScore', () => {
        it('should return 100 for values at or below good threshold', () => {
            const threshold = { good: 2500, poor: 4000 }
            expect(calculateMetricScore(0, threshold)).toBe(100)
            expect(calculateMetricScore(1000, threshold)).toBe(100)
            expect(calculateMetricScore(2500, threshold)).toBe(100)
        })

        it('should return 0 for values at or above poor threshold', () => {
            const threshold = { good: 2500, poor: 4000 }
            expect(calculateMetricScore(4000, threshold)).toBe(0)
            expect(calculateMetricScore(5000, threshold)).toBe(0)
        })

        it('should interpolate linearly between good and poor thresholds', () => {
            const threshold = { good: 2500, poor: 4000 }
            // 中点: (2500 + 4000) / 2 = 3250, 应该是 50 分
            expect(calculateMetricScore(3250, threshold)).toBe(50)
        })

        it('should handle FID thresholds correctly', () => {
            const threshold = { good: 100, poor: 300 }
            expect(calculateMetricScore(50, threshold)).toBe(100)
            expect(calculateMetricScore(100, threshold)).toBe(100)
            expect(calculateMetricScore(200, threshold)).toBe(50)
            expect(calculateMetricScore(300, threshold)).toBe(0)
        })

        it('should handle CLS thresholds correctly', () => {
            const threshold = { good: 0.1, poor: 0.25 }
            expect(calculateMetricScore(0.05, threshold)).toBe(100)
            expect(calculateMetricScore(0.1, threshold)).toBe(100)
            expect(calculateMetricScore(0.175, threshold)).toBe(50)
            expect(calculateMetricScore(0.25, threshold)).toBe(0)
        })
    })

    describe('getRating', () => {
        it('should return "good" for scores >= 90', () => {
            expect(getRating(90)).toBe('good')
            expect(getRating(95)).toBe('good')
            expect(getRating(100)).toBe('good')
        })

        it('should return "needs-improvement" for scores >= 50 and < 90', () => {
            expect(getRating(50)).toBe('needs-improvement')
            expect(getRating(70)).toBe('needs-improvement')
            expect(getRating(89)).toBe('needs-improvement')
        })

        it('should return "poor" for scores < 50', () => {
            expect(getRating(0)).toBe('poor')
            expect(getRating(25)).toBe('poor')
            expect(getRating(49)).toBe('poor')
        })
    })

    describe('updateMetric and getMetrics', () => {
        it('should update and retrieve LCP metric', () => {
            updateMetric('LCP', 2000)
            const metrics = getMetrics()
            expect(metrics.LCP).toBe(2000)
            expect(metrics.FID).toBeNull()
            expect(metrics.CLS).toBeNull()
        })

        it('should update and retrieve FID metric', () => {
            updateMetric('FID', 50)
            const metrics = getMetrics()
            expect(metrics.LCP).toBeNull()
            expect(metrics.FID).toBe(50)
            expect(metrics.CLS).toBeNull()
        })

        it('should update and retrieve CLS metric', () => {
            updateMetric('CLS', 0.1)
            const metrics = getMetrics()
            expect(metrics.LCP).toBeNull()
            expect(metrics.FID).toBeNull()
            expect(metrics.CLS).toBe(0.1)
        })

        it('should update multiple metrics', () => {
            updateMetric('LCP', 2000)
            updateMetric('FID', 50)
            updateMetric('CLS', 0.1)
            const metrics = getMetrics()
            expect(metrics.LCP).toBe(2000)
            expect(metrics.FID).toBe(50)
            expect(metrics.CLS).toBe(0.1)
        })

        it('should ignore invalid metric names', () => {
            updateMetric('INVALID', 100)
            const metrics = getMetrics()
            expect(metrics.LCP).toBeNull()
            expect(metrics.FID).toBeNull()
            expect(metrics.CLS).toBeNull()
        })
    })

    describe('resetMetrics', () => {
        it('should reset all metrics to null', () => {
            updateMetric('LCP', 2000)
            updateMetric('FID', 50)
            updateMetric('CLS', 0.1)

            resetMetrics()

            const metrics = getMetrics()
            expect(metrics.LCP).toBeNull()
            expect(metrics.FID).toBeNull()
            expect(metrics.CLS).toBeNull()
        })
    })

    describe('calculatePerformanceScore', () => {
        it('should return null when no metrics are available', () => {
            expect(calculatePerformanceScore()).toBeNull()
        })

        it('should calculate score with only LCP', () => {
            updateMetric('LCP', 2000) // good
            const result = calculatePerformanceScore()
            expect(result).not.toBeNull()
            expect(result.totalScore).toBe(100)
            expect(result.rating).toBe('good')
            expect(result.scores.LCP).toBe(100)
            expect(result.scores.FID).toBeUndefined()
            expect(result.scores.CLS).toBeUndefined()
        })

        it('should calculate score with only FID', () => {
            updateMetric('FID', 50) // good
            const result = calculatePerformanceScore()
            expect(result).not.toBeNull()
            expect(result.totalScore).toBe(100)
            expect(result.rating).toBe('good')
        })

        it('should calculate score with only CLS', () => {
            updateMetric('CLS', 0.05) // good
            const result = calculatePerformanceScore()
            expect(result).not.toBeNull()
            expect(result.totalScore).toBe(100)
            expect(result.rating).toBe('good')
        })

        it('should calculate weighted score with all metrics', () => {
            // LCP: 100分 * 0.3 = 30
            // FID: 100分 * 0.3 = 30
            // CLS: 100分 * 0.4 = 40
            // 总分: 100
            updateMetric('LCP', 2000)
            updateMetric('FID', 50)
            updateMetric('CLS', 0.05)

            const result = calculatePerformanceScore()
            expect(result.totalScore).toBe(100)
            expect(result.rating).toBe('good')
        })

        it('should calculate weighted score with mixed performance', () => {
            // LCP: 100分 * 0.3 = 30
            // FID: 0分 * 0.3 = 0
            // CLS: 100分 * 0.4 = 40
            // 总分: 70 / 1 = 70
            updateMetric('LCP', 2000)
            updateMetric('FID', 300)
            updateMetric('CLS', 0.05)

            const result = calculatePerformanceScore()
            expect(result.totalScore).toBe(70)
            expect(result.rating).toBe('needs-improvement')
        })

        it('should calculate score with poor performance', () => {
            // LCP: 0分 * 0.3 = 0
            // FID: 0分 * 0.3 = 0
            // CLS: 0分 * 0.4 = 0
            // 总分: 0
            updateMetric('LCP', 5000)
            updateMetric('FID', 400)
            updateMetric('CLS', 0.3)

            const result = calculatePerformanceScore()
            expect(result.totalScore).toBe(0)
            expect(result.rating).toBe('poor')
        })

        it('should adjust weights when not all metrics are available', () => {
            // 只有 LCP 和 CLS，没有 FID
            // LCP: 100分 * 0.3 = 30
            // CLS: 100分 * 0.4 = 40
            // 总权重: 0.3 + 0.4 = 0.7
            // 总分: 70 / 0.7 = 100
            updateMetric('LCP', 2000)
            updateMetric('CLS', 0.05)

            const result = calculatePerformanceScore()
            expect(result.totalScore).toBe(100)
            expect(result.rating).toBe('good')
        })

        it('should include all required fields in result', () => {
            updateMetric('LCP', 2000)
            updateMetric('FID', 50)
            updateMetric('CLS', 0.05)

            const result = calculatePerformanceScore()
            expect(result).toHaveProperty('totalScore')
            expect(result).toHaveProperty('rating')
            expect(result).toHaveProperty('scores')
            expect(result).toHaveProperty('metrics')
            expect(result).toHaveProperty('weights')
            expect(result.weights).toEqual({ LCP: 0.3, FID: 0.3, CLS: 0.4 })
        })
    })
})
