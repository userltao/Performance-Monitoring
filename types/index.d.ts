/**
 * monitor-demo - 前端监控 SDK
 * @version 0.2.3
 * @author tanguangzhi
 */

// ==================== 配置相关类型 ====================

/**
 * Vue 实例类型（简化版）
 */
export interface VueInstance {
    config?: {
        errorHandler?: (err: Error, vm: any, info: string) => void;
    };
    mixin?: (mixin: object) => void;
}

/**
 * Vue Router 类型（简化版）
 */
export interface VueRouter {
    beforeEach: (guard: (to: any, from: any, next: () => void) => void) => void;
    [key: string]: any;
}

/**
 * Vue 配置
 */
export interface VueConfig {
    /** Vue 实例 */
    Vue?: VueInstance | null;
    /** Vue Router 实例 */
    router?: VueRouter | null;
}

/**
 * 脱敏选项
 */
export interface SanitizeOptions {
    /** 是否脱敏手机号 (默认 true) */
    phone?: boolean;
    /** 是否脱敏身份证号 (默认 true) */
    idCard?: boolean;
    /** 是否脱敏邮箱 (默认 true) */
    email?: boolean;
    /** 是否脱敏银行卡号 (默认 true) */
    bankCard?: boolean;
    /** 是否脱敏 IP 地址 (默认 true) */
    ip?: boolean;
    /** 是否脱敏中文姓名 (默认 false，误伤率高) */
    name?: boolean;
    /** 是否脱敏 URL 中的敏感参数 (默认 true) */
    urlToken?: boolean;
    /** 自定义正则表达式数组 */
    customPatterns?: RegExp[];
    /** 自定义替换函数 */
    customReplacer?: (match: string) => string;
}

/**
 * 脱敏级别
 */
export type SanitizeLevel = 'STRICT' | 'STANDARD' | 'LOOSE' | 'OFF';

/**
 * 脱敏配置
 */
export interface SanitizeConfig {
    /** 是否启用脱敏 (默认 true) */
    enabled?: boolean;
    /** 脱敏级别 (默认 'STANDARD') */
    level?: SanitizeLevel;
    /** 自定义脱敏选项 (优先级高于 level) */
    options?: SanitizeOptions | null;
}

/**
 * 监控配置选项
 */
export interface MonitorOptions {
    /** 数据上报地址 */
    url: string;
    /** 应用标识 */
    appID?: string;
    /** 用户标识 */
    userID?: string;
    /** Vue 相关配置 */
    vue?: VueConfig;
    /** 数据脱敏配置 */
    sanitize?: SanitizeConfig;
}

// ==================== 数据上报类型 ====================

/**
 * 上报数据基础类型
 */
export interface BaseReportData {
    /** 数据类型 */
    type: 'error' | 'performance' | 'behavior';
    /** 子类型 */
    subType: string;
    /** 时间戳 */
    startTime?: number;
    /** 页面 URL */
    pageURL?: string;
}

/**
 * 会话信息
 */
export interface SessionInfo {
    /** 会话 ID */
    id: string;
    /** 应用 ID */
    appID?: string;
    /** 用户 ID */
    userID?: string;
}

/**
 * 完整上报数据格式
 */
export interface ReportPayload<T = any> extends SessionInfo {
    /** 上报数据 */
    data: T;
}

// ==================== 错误监控类型 ====================

/**
 * 控制台错误数据
 */
export interface ConsoleErrorData extends BaseReportData {
    type: 'error';
    subType: 'console-error';
    /** 错误参数 */
    errData: any[];
}

/**
 * JS 错误数据
 */
export interface JSErrorData extends BaseReportData {
    type: 'error';
    subType: 'js';
    /** 错误信息 */
    msg: string;
    /** 行号 */
    line?: number;
    /** 列号 */
    column?: number;
    /** 错误堆栈 */
    error?: string;
}

/**
 * Promise 错误数据
 */
export interface PromiseErrorData extends BaseReportData {
    type: 'error';
    subType: 'promise';
    /** 错误原因 */
    reason?: string;
}

/**
 * 资源加载错误数据
 */
export interface ResourceErrorData extends BaseReportData {
    type: 'error';
    subType: 'resource';
    /** 资源 URL */
    url: string;
    /** 资源类型 */
    resourceType?: string;
    /** HTML 内容 */
    html?: string;
    /** 路径 */
    paths?: string[];
}

/**
 * Vue 错误数据
 */
export interface VueErrorData extends BaseReportData {
    type: 'error';
    subType: 'vue';
    /** 错误堆栈 */
    error?: string;
    /** 错误信息 */
    info?: string;
}

/**
 * 错误数据联合类型
 */
export type ErrorData = ConsoleErrorData | JSErrorData | PromiseErrorData | ResourceErrorData | VueErrorData;

// ==================== 性能监控类型 ====================

/**
 * 首次绘制 (FP) 数据
 */
export interface PaintData extends BaseReportData {
    type: 'performance';
    subType: 'first-paint' | 'first-contentful-paint';
    /** 指标名称 */
    name: string;
    /** 是否从 BFCache 恢复 */
    bfc?: boolean;
}

/**
 * 最大内容绘制 (LCP) 数据
 */
export interface LCPData extends BaseReportData {
    type: 'performance';
    subType: 'largest-contentful-paint';
    /** 目标元素 */
    target?: string;
    /** 元素大小 */
    size?: number;
    /** 渲染时间 */
    renderTime?: number;
    /** 加载时间 */
    loadTime?: number;
    /** 是否从 BFCache 恢复 */
    bfc?: boolean;
}

/**
 * 累积布局偏移 (CLS) 数据
 */
export interface CLSData extends BaseReportData {
    type: 'performance';
    subType: 'layout-shift';
    /** 布局偏移值 */
    value: number;
    /** 偏移条目 */
    entries?: object[];
    /** 指标名称 */
    name?: string;
}

/**
 * 首次输入延迟 (FID) 数据
 */
export interface FIDData extends BaseReportData {
    type: 'performance';
    subType: 'first-input';
    /** 事件类型 */
    event?: string;
    /** 目标元素 */
    target?: string;
    /** 输入延迟时长 */
    duration?: number;
    /** 指标名称 */
    name?: string;
    /** 节点名称 */
    nodeName?: string;
}

/**
 * 页面加载数据
 */
export interface LoadData extends BaseReportData {
    type: 'performance';
    subType: 'load' | 'domcontentloaded';
    /** 是否从 BFCache 恢复 */
    bfc?: boolean;
}

/**
 * 首屏绘制数据
 */
export interface FirstScreenPaintData extends BaseReportData {
    type: 'performance';
    subType: 'first-screen-paint';
    /** 是否从 BFCache 恢复 */
    bfc?: boolean;
}

/**
 * 资源加载数据
 */
export interface ResourceData extends BaseReportData {
    type: 'performance';
    subType: 'resource' | 'navigation';
    /** 资源名称 */
    name?: string;
    /** 资源类型 */
    sourceType?: string;
    /** 加载时长 */
    duration?: number;
    /** DNS 查询时长 */
    dns?: number;
    /** TCP 连接时长 */
    tcp?: number;
    /** 重定向时长 */
    redirect?: number;
    /** 首字节时间 */
    ttfb?: number;
    /** 协议 */
    protocol?: string;
    /** 响应体大小 */
    responseBodySize?: number;
    /** 响应头大小 */
    responseHeaderSize?: number;
    /** 资源大小 */
    resourceSize?: number;
    /** 是否命中缓存 */
    isCache?: boolean;
}

/**
 * Fetch/XHR 请求数据
 */
export interface RequestData extends BaseReportData {
    type: 'performance';
    subType: 'fetch' | 'xhr';
    /** 请求 URL */
    url?: string;
    /** 请求方法 */
    method?: string;
    /** 请求状态码 */
    status?: number;
    /** 请求时长 */
    duration?: number;
    /** 开始时间 */
    startTime?: number;
    /** 结束时间 */
    endTime?: number;
    /** 是否成功 */
    success?: boolean;
}

/**
 * FPS 数据
 */
export interface FPSData extends BaseReportData {
    type: 'performance';
    subType: 'fps';
    /** FPS 值 */
    fps?: number;
    /** 是否卡顿 */
    isBlocking?: boolean;
}

/**
 * Vue Router 性能数据
 */
export interface VueRouterPerformanceData extends BaseReportData {
    type: 'performance';
    subType: 'vue-router-change-paint';
    /** 渲染时长 */
    duration?: number;
}

/**
 * 性能评分数据
 */
export interface PerformanceScoreData extends BaseReportData {
    type: 'performance';
    subType: 'performance-score';
    /** 综合分数 (0-100) */
    totalScore: number;
    /** 评级: 'good' | 'needs-improvement' | 'poor' */
    rating: 'good' | 'needs-improvement' | 'poor';
    /** 各指标分数 */
    scores: {
        LCP?: number;
        FID?: number;
        CLS?: number;
    };
    /** 各指标原始值 */
    metrics: {
        LCP?: number | null;
        FID?: number | null;
        CLS?: number | null;
    };
    /** 指标权重 */
    weights: {
        LCP: number;
        FID: number;
        CLS: number;
    };
}

/**
 * 性能数据联合类型
 */
export type PerformanceData =
    | PaintData
    | LCPData
    | CLSData
    | FIDData
    | LoadData
    | FirstScreenPaintData
    | ResourceData
    | RequestData
    | FPSData
    | VueRouterPerformanceData
    | PerformanceScoreData;

// ==================== 行为监控类型 ====================

/**
 * 页面访问 (PV) 数据
 */
export interface PVData extends BaseReportData {
    type: 'behavior';
    subType: 'pv';
    /** 用户 ID */
    uuid: string;
    /** 来源页面 */
    referrer?: string;
}

/**
 * 点击事件数据
 */
export interface ClickData extends BaseReportData {
    type: 'behavior';
    subType: 'click';
    /** 点击目标元素 */
    target?: string;
    /** 事件类型 */
    eventType?: string;
    /** 元素顶部位置 */
    top?: number;
    /** 元素左侧位置 */
    left?: number;
    /** 元素宽度 */
    width?: number;
    /** 元素高度 */
    height?: number;
    /** 页面高度 */
    pageHeight?: number;
    /** 滚动位置 */
    scrollTop?: number;
    /** 元素路径 */
    paths?: string[];
    /** 元素 outerHTML */
    outerHTML?: string;
    /** 元素 innerHTML */
    innerHTML?: string;
    /** 视口尺寸 */
    viewport?: {
        width: number;
        height: number;
    };
    /** 用户 ID */
    uuid?: string;
}

/**
 * 页面访问时长数据
 */
export interface PageAccessDurationData extends BaseReportData {
    type: 'behavior';
    subType: 'page-access-duration';
    /** 用户 ID */
    uuid?: string;
}

/**
 * 页面滚动高度数据
 */
export interface PageAccessHeightData extends BaseReportData {
    type: 'behavior';
    subType: 'page-access-height';
    /** 滚动百分比 */
    value?: string;
    /** 持续时长 */
    duration?: number;
    /** 用户 ID */
    uuid?: string;
}

/**
 * 页面切换数据
 */
export interface PageChangeData extends BaseReportData {
    type: 'behavior';
    subType: 'popstate' | 'hashchange';
    /** 来源 URL */
    from?: string;
    /** 目标 URL */
    to?: string;
    /** 用户 ID */
    uuid?: string;
}

/**
 * Vue Router 切换数据
 */
export interface VueRouterChangeData extends BaseReportData {
    type: 'behavior';
    subType: ['vue-router-change', 'pv'];
    /** 路由名称 */
    name?: string;
    /** 来源路径 */
    from?: string;
    /** 目标路径 */
    to?: string;
    /** 路由参数 */
    data?: {
        params?: Record<string, any>;
        query?: Record<string, any>;
    };
    /** 用户 ID */
    uuid?: string;
}

/**
 * 行为数据联合类型
 */
export type BehaviorData =
    | PVData
    | ClickData
    | PageAccessDurationData
    | PageAccessHeightData
    | PageChangeData
    | VueRouterChangeData;

// ==================== 监控实例类型 ====================

/**
 * 监控实例
 */
export interface Monitor {
    /**
     * 初始化监控
     * @param options - 配置选项
     * @example
     * ```js
     * import monitor from 'monitor-demo'
     *
     * monitor.init({
     *     url: 'https://your-server.com/report',
     *     appID: 'your-app-id',
     *     userID: 'user-123',
     * })
     * ```
     */
    init(options?: MonitorOptions): void;

    /**
     * 手动上报数据
     * @param data - 要上报的数据
     * @param isImmediate - 是否立即上报，默认 false
     * @example
     * ```js
     * // 立即上报
     * monitor.report({ type: 'custom', data: 'test' }, true)
     *
     * // 延迟上报（浏览器空闲时）
     * monitor.report({ type: 'custom', data: 'test' })
     * ```
     */
    report(data: any, isImmediate?: boolean): void;
}

// ==================== 导出 ====================

/**
 * 监控实例
 *
 * @example
 * ```js
 * import monitor from 'monitor-demo'
 *
 * // 初始化
 * monitor.init({
 *     url: 'https://your-server.com/report',
 *     appID: 'your-app-id',
 * })
 *
 * // 手动上报
 * monitor.report({ type: 'custom', message: 'hello' }, true)
 * ```
 */
declare const monitor: Monitor;

export default monitor;

/**
 * 判断是否支持 sendBeacon
 */
export function isSupportSendBeacon(): boolean;

/**
 * 上报数据
 * @param data - 要上报的数据
 * @param isImmediate - 是否立即上报
 */
export function report(data: any, isImmediate?: boolean): void;

/**
 * 延迟上报数据（带缓存）
 * @param data - 要上报的数据
 * @param timeout - 延迟时间，默认 3000ms
 */
export function lazyReportCache(data: any, timeout?: number): void;

/**
 * 生成唯一 ID
 */
export function generateUniqueID(): string;

// ==================== 去重功能类型 ====================

/**
 * 错误数据基础类型（用于去重）
 */
export interface ErrorDataForDedup {
    /** 错误子类型 */
    subType: string;
    /** 错误信息（用于JS错误） */
    msg?: string;
    /** 错误URL */
    url?: string;
    /** 行号 */
    line?: number;
    /** 列号 */
    column?: number;
    /** 错误堆栈 */
    error?: string;
    /** 资源类型 */
    resourceType?: string;
    /** 控制台错误参数 */
    errData?: any[];
    /** Promise错误原因 */
    reason?: string;
    [key: string]: any;
}

/**
 * 生成错误指纹
 * 根据错误类型和关键信息生成唯一标识
 * @param errorData - 错误数据
 * @returns 错误指纹字符串
 */
export function generateFingerprint(errorData: ErrorDataForDedup): string;

/**
 * 检查是否为重复错误
 * @param errorData - 错误数据
 * @param interval - 去重时间窗口（毫秒），默认 5000ms
 * @returns 是否为重复错误
 */
export function isDuplicate(errorData: ErrorDataForDedup, interval?: number): boolean;

/**
 * 清除错误去重缓存
 * 用于测试或手动重置
 */
export function clearDedupCache(): void;

/**
 * 获取去重缓存大小
 * @returns 缓存条目数
 */
export function getDedupCacheSize(): number;

/**
 * 启动定期清理过期缓存
 * @param interval - 清理间隔（毫秒），默认 60000ms
 */
export function startCleanup(interval?: number): void;

/**
 * 停止定期清理
 */
export function stopCleanup(): void;

// ==================== 性能评分类型 ====================

/**
 * 评分阈值配置
 */
export interface ScoreThresholds {
    good: number;
    poor: number;
}

/**
 * 计算单个指标的分数 (0-100)
 * @param value - 指标值
 * @param threshold - 阈值配置 { good, poor }
 * @returns 分数 (0-100)
 */
export function calculateMetricScore(value: number, threshold: ScoreThresholds): number;

/**
 * 计算综合性能分数
 * @returns 评分结果，如果没有数据返回 null
 */
export function calculatePerformanceScore(): PerformanceScoreData | null;

/**
 * 根据分数获取评级
 * @param score - 综合分数 (0-100)
 * @returns 评级: 'good' | 'needs-improvement' | 'poor'
 */
export function getRating(score: number): 'good' | 'needs-improvement' | 'poor';

/**
 * 更新指标值
 * @param metricName - 指标名称 (LCP/FID/CLS)
 * @param value - 指标值
 */
export function updateMetric(metricName: 'LCP' | 'FID' | 'CLS', value: number): void;

/**
 * 获取当前存储的指标值
 * @returns 指标值
 */
export function getMetrics(): { LCP: number | null; FID: number | null; CLS: number | null };

/**
 * 重置所有指标 (用于测试或页面重新加载)
 */
export function resetMetrics(): void;

// ==================== 数据脱敏类型 ====================

/**
 * 脱敏级别预设
 */
export const SANITIZE_LEVELS: {
    /** 严格模式: 脱敏所有敏感信息 */
    STRICT: Required<SanitizeOptions>;
    /** 标准模式: 脱敏常见敏感信息，不脱敏姓名 (误伤率高) */
    STANDARD: Required<SanitizeOptions>;
    /** 宽松模式: 只脱敏最关键的敏感信息 */
    LOOSE: Required<SanitizeOptions>;
    /** 关闭模式: 不进行脱敏 */
    OFF: Required<SanitizeOptions>;
};

/**
 * 对字符串进行脱敏处理
 * @param text - 待脱敏的字符串
 * @param options - 脱敏选项
 * @returns 脱敏后的字符串
 */
export function sanitizeString(text: string, options?: SanitizeOptions): string;

/**
 * 递归遍历对象，对所有字符串值进行脱敏
 * @param data - 待脱敏的数据
 * @param options - 脱敏选项
 * @returns 脱敏后的数据
 */
export function sanitizeData<T = any>(data: T, options?: SanitizeOptions): T;

/**
 * 创建脱敏处理器
 * @param options - 脱敏选项
 * @returns 脱敏处理函数
 */
export function createSanitizer(options?: SanitizeOptions): (data: any) => any;
