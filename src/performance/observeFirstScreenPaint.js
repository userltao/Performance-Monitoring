import { executeAfterLoad, onBFCacheRestore, getPageURL } from '../utils/utils'
import { isLCPDone } from './observeLCP'
import { lazyReportCache } from '../utils/report'

let isOnLoaded = false
executeAfterLoad(() => {
    isOnLoaded = true
})

let timer
let observer
function checkDOMChange() {
    clearTimeout(timer)
    timer = setTimeout(() => {
        // 等 load、lcp 事件触发后并且 DOM 树不再变化时，计算首屏渲染时间
        //防抖 500ms
        // 页面渲染时 DOM 会连续频繁变化
        //500ms 无变化 → 判定首屏渲染完成
        if (isOnLoaded && isLCPDone()) {
            observer && observer.disconnect()
            lazyReportCache({
                type: 'performance',
                subType: 'first-screen-paint',
                startTime: getRenderTime(),
                pageURL: getPageURL(),
            })

            entries = null
        } else {
            checkDOMChange()
        }
    }, 500)
}
// 存储所有【有效DOM渲染】的时间和元素，终从这些记录里找出首屏最晚渲染时间
let entries = []
export default function observeFirstScreenPaint() {
    // 浏览器不支持 MutationObserver 则退出（兼容老浏览器）
    // MutationObserver用于监听 DOM（文档对象模型）树的变化。
    if (!MutationObserver) return

    // requestAnimationFrame会指示浏览器在下一次重绘之前执行指定的回调函数
    const next = window.requestAnimationFrame ? requestAnimationFrame : setTimeout
    // 这些和首屏内容无关
    const ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK', 'META']
    observer = new MutationObserver(mutationList => {
        checkDOMChange()
        const entry = {
            startTime: 0,
            children: [],
        }

        next(() => {
            entry.startTime = performance.now()
        })

        for (const mutation of mutationList) {
            if (mutation.addedNodes.length) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (
                        node.nodeType === 1//nodeType === 1 代表：元素节点（div /p/img /span ...）排除：文本节点、注释节点、属性节点...
                        && !ignoreDOMList.includes(node.tagName)//过滤【和页面内容无关的标签】
                        && !isInclude(node, entry.children)//如果这个元素 或 它的父元素 已经被记录过 → 就不再记录
                    ) {
                        entry.children.push(node)
                    }
                }
            }
        }

        if (entry.children.length) {
            entries.push(entry)
        }
    })

    //监听「整个页面」所有「元素的增加 / 删除」
    observer.observe(document, {
        childList: true,// 监听【子元素】的增加、删除
        subtree: true,// 监听【所有后代元素】，包括深层嵌套的元素
    })

    onBFCacheRestore(event => {
        requestAnimationFrame(() => {
            lazyReportCache({
                startTime: performance.now() - event.timeStamp,
                type: 'performance',
                subType: 'first-screen-paint',
                bfc: true,
                pageURL: getPageURL(),
            })
        })
    })
}

function getRenderTime() {
    let startTime = 0
    entries.forEach(entry => {
        for (const node of entry.children) {
            // 1. 元素在首屏里,2. 这个元素渲染得更晚,3. 元素有效（不隐藏、不是小图）
            if (isInScreen(node) && entry.startTime > startTime && needToCalculate(node)) {
                startTime = entry.startTime
                break //同一个 entry 里的所有 node，渲染时间都是一样的
            }
        }
    })


    //如果首屏里的元素（DOM 渲染时间）里面包裹着图片，而且图片加载比 DOM 晚，那就用图片加载完成的时间作为最终首屏时间
    // 需要和当前页面所有加载图片的时间做对比，取最大值
    //  图片开始下载时间 < DOM渲染时间 && 图片响应时间 > DOM渲染时间

    //浏览器给你的所有资源加载记录，包括图片、css、js、字体等
    performance.getEntriesByType('resource').forEach(item => {
        if (
            item.initiatorType === 'img'
            && item.fetchStart < startTime
            && item.responseEnd > startTime
        ) {
            startTime = item.responseEnd
        }
    })

    return startTime
}

function needToCalculate(node) {
    // 隐藏的元素不用计算
    if (window.getComputedStyle(node).display === 'none') return false

    // 用于统计的图片不用计算
    if (node.tagName === 'IMG' && node.width < 2 && node.height < 2) {
        return false
    }

    return true
}
//向上递归查爸爸 → 只要自己或祖先被记录过，就返回 true
function isInclude(node, arr) {
    // 递归终止条件1：没有节点了 / 查到根节点 html 了 → 没找到，返回 false
    if (!node || node === document.documentElement) {
        return false
    }

    // 递归终止条件2：当前节点就在数组里 → 找到了，返回 true
    if (arr.includes(node)) {
        return true
    }

    // 递归调用，继续向上查找
    return isInclude(node.parentElement, arr)
}

const viewportWidth = window.innerWidth
const viewportHeight = window.innerHeight

// dom 对象是否在屏幕内
function isInScreen(dom) {
    const rectInfo = dom.getBoundingClientRect()
    if (
        rectInfo.left >= 0
        && rectInfo.left < viewportWidth
        && rectInfo.top >= 0
        && rectInfo.top < viewportHeight
    ) {
        return true
    }
}