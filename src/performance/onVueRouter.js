import { lazyReportCache } from '../utils/report'
import { getPageURL } from '../utils/utils'

// 监控 Vue 项目中，从「路由跳转」到「页面完全渲染出来」花了多长时间，然后上报性能数据。
export default function onVueRouter(Vue, router) {
    let isFirst = true
    let startTime
    router.beforeEach((to, from, next) => {
        // 首次进入页面不算路由切换，属于页面首次加载,已经有其他统计的渲染时间可用
        if (isFirst) {
            isFirst = false
            return next()//直接放行
        }

        // 给 router 新增一个字段，表示是否要计算渲染时间
        // 只有路由跳转才需要计算
        // 后面页面组件渲染完成时，才知道这次渲染是路由切换导致的，才会去上报耗时。
        router.needCalculateRenderTime = true
        startTime = performance.now()

        next()
    })

    let timer
    // 给所有 Vue 组件全局加一个生命周期，当组件挂载完成时，检查是否需要计算渲染时间
    Vue.mixin({
        mounted() {
            if (!router.needCalculateRenderTime) return

            this.$nextTick(() => {
                // 仅在整个视图都被渲染之后才会运行的代码
                const now = performance.now()
                clearTimeout(timer)

                timer = setTimeout(() => {
                    router.needCalculateRenderTime = false
                    lazyReportCache({
                        type: 'performance',
                        subType: 'vue-router-change-paint',
                        duration: now - startTime,
                        startTime: now,
                        pageURL: getPageURL(),
                    })
                }, 1000)
            })
        },
    })
}