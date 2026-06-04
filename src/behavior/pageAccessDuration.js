import { lazyReportCache, report } from '../utils/report'
import { onBeforeunload, onHidden, getPageURL } from '../utils/utils'
import { getUUID } from './utils'

let startTime = 0        // 页面激活时的起始时间戳
let activeDuration = 0   // 累计活跃时长（ms）
let isActive = true      // 当前页面是否处于前台激活状态

export default function pageAccessDuration() {
    // 页面加载完成后开始计时
    startTime = performance.now()
    activeDuration = 0
    isActive = true

    // 监听 visibilitychange：页面切到后台时暂停计时，回到前台时恢复
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // 页面进入后台：累加当前这段活跃时长
            if (isActive) {
                activeDuration += performance.now() - startTime
                isActive = false
            }
        } else {
            // 页面回到前台：重新开始计时
            startTime = performance.now()
            isActive = true
        }
    }, true)

    // 页面离开时上报最终的活跃停留时长
    onBeforeunload(() => {
        if (isActive) {
            activeDuration += performance.now() - startTime
            isActive = false
        }

        report({
            type: 'behavior',
            subType: 'page-access-duration',
            duration: Math.round(activeDuration),
            pageURL: getPageURL(),
            uuid: getUUID(),
        }, true)
    })

    // 页面隐藏时（切换标签页 / 最小化）也上报一次当前累计活跃时长
    onHidden(() => {
        if (isActive) {
            activeDuration += performance.now() - startTime
            isActive = false
        }

        // 仅当有有效停留时长时才上报
        if (activeDuration > 0) {
            lazyReportCache({
                type: 'behavior',
                subType: 'page-access-duration',
                duration: Math.round(activeDuration),
                pageURL: getPageURL(),
                uuid: getUUID(),
            })
        }
    })
}
