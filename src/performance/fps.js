import { report } from '../utils/report'
import { deepCopy } from '../utils/utils'

// 正常人眼、浏览器标准 60 帧 / 秒，一帧间隔就是约 16.67ms
// setTimeout 延迟 16.67ms 执行，模拟下一帧。
const next = window.requestAnimationFrame
    ? requestAnimationFrame : (callback) => { setTimeout(callback, 1000 / 60) }

// 存储所有采集到的 FPS 数据
const frames = []

export default function fps() {
    let frame = 0
    let lastSecond = Date.now()

    function calculateFPS() {
        frame++
        const now = Date.now()
        // 距离上一次算 FPS 已经满 1 秒了，就计算一下
        if (lastSecond + 1000 <= now) {
            // 由于 now - lastSecond 的单位是毫秒，所以 frame 要 * 1000
            const fps = Math.round((frame * 1000) / (now - lastSecond))
            frames.push(fps)

            frame = 0
            lastSecond = now
        }

        // 避免上报太快，缓存一定数量再上报
        if (frames.length >= 60) {
            report(deepCopy({
                frames,
                type: 'performance',
                subType: 'fps',
            }))

            frames.length = 0
        }

        next(calculateFPS)
    }

    calculateFPS()
}

// 检测页面是否出现了【持续性卡顿】
// below：低于多少 FPS 就算卡顿
// last：连续多少帧都低于 below 就算持续性卡顿
export function isBlocking(fpsList, below = 20, last = 3) {
    let count = 0
    for (let i = 0; i < fpsList.length; i++) {
        if (fpsList[i] && fpsList[i] < below) {
            count++
        } else {
            count = 0
        }

        if (count >= last) {
            return true
        }
    }

    return false
}