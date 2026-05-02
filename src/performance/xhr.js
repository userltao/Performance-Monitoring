import { originalOpen, originalSend, originalProto } from '../utils/xhr'
import { lazyReportCache } from '../utils/report'

function overwriteOpenAndSend() {
    originalProto.open = function newOpen(...args) {
        // 拦截 xhr.open()，把接口地址和请求方法记下来
        this.url = args[1]
        this.method = args[0]
        originalOpen.apply(this, args)
    }

    originalProto.send = function newSend(...args) {
        // 发送请求时，立刻记下当前时间 → 后面算耗时用
        this.startTime = Date.now()

        const onLoadend = () => {
            // 请求完成后，自动计算接口耗时
            this.endTime = Date.now()
            this.duration = this.endTime - this.startTime

            const { status, duration, startTime, endTime, url, method } = this
            const reportData = {
                status,
                duration,
                startTime,
                endTime,
                url,
                method: (method || 'GET').toUpperCase(),
                success: status >= 200 && status < 300,
                subType: 'xhr',
                type: 'performance',
            }

            lazyReportCache(reportData)

            this.removeEventListener('loadend', onLoadend, true)
        }

        this.addEventListener('loadend', onLoadend, true)
        originalSend.apply(this, args)
    }
}

export default function xhr() {
    overwriteOpenAndSend()
}