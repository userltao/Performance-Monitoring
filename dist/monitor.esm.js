function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var originalProto = XMLHttpRequest.prototype;
var originalOpen = originalProto.open;
var originalSend = originalProto.send;

function deepCopy(target) {
  if (_typeof(target) === 'object') {
    var result = Array.isArray(target) ? [] : {};

    for (var key in target) {
      if (_typeof(target[key]) == 'object') {
        result[key] = deepCopy(target[key]);
      } else {
        result[key] = target[key];
      }
    }

    return result;
  }

  return target;
}
function onBFCacheRestore(callback) {
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      callback(event);
    }
  }, true);
}
function onBeforeunload(callback) {
  window.addEventListener('beforeunload', callback, true);
}
function onHidden(callback, once) {
  var onHiddenOrPageHide = function onHiddenOrPageHide(event) {
    if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
      callback(event);

      if (once) {
        window.removeEventListener('visibilitychange', onHiddenOrPageHide, true);
        window.removeEventListener('pagehide', onHiddenOrPageHide, true);
      }
    }
  };

  window.addEventListener('visibilitychange', onHiddenOrPageHide, true);
  window.addEventListener('pagehide', onHiddenOrPageHide, true);
}
function executeAfterLoad(callback) {
  if (document.readyState === 'complete') {
    callback();
  } else {
    var onLoad = function onLoad() {
      callback();
      window.removeEventListener('load', onLoad, true);
    };

    window.addEventListener('load', onLoad, true);
  }
}
function getPageURL() {
  return window.location.href;
} // 生成用户唯一标识（Fingerprint）

function getFingerprint$1() {
  var STORAGE_KEY = 'monitor_fingerprint'; // 尝试从 localStorage 获取

  var fingerprint = localStorage.getItem(STORAGE_KEY);

  if (fingerprint) {
    return fingerprint;
  } // 生成新的指纹


  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.font = '14px Arial';
  ctx.fillText('browser fingerprint', 10, 20);
  var canvasHash = canvas.toDataURL('image/jpeg').hashCode();
  var userAgentHash = navigator.userAgent.hashCode();
  var screenHash = (screen.width * screen.height * screen.colorDepth).toString().hashCode();
  fingerprint = "".concat(canvasHash, "-").concat(userAgentHash, "-").concat(screenHash, "-").concat(Date.now()); // 存储到 localStorage

  try {
    localStorage.setItem(STORAGE_KEY, fingerprint);
  } catch (e) {// 忽略存储错误
  }

  return fingerprint;
} // 字符串哈希函数

String.prototype.hashCode = function () {
  var hash = 0;

  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为 32 位整数
  }

  return Math.abs(hash);
}; // 生成会话 ID


function getSessionId$1() {
  var STORAGE_KEY = 'monitor_session_id';
  var SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟会话超时
  // 尝试从 localStorage 获取

  var sessionData = localStorage.getItem(STORAGE_KEY);

  if (sessionData) {
    try {
      var _JSON$parse = JSON.parse(sessionData),
          _sessionId = _JSON$parse.sessionId,
          timestamp = _JSON$parse.timestamp; // 检查会话是否超时


      if (Date.now() - timestamp < SESSION_TIMEOUT) {
        // 更新会话时间戳
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          sessionId: _sessionId,
          timestamp: Date.now()
        }));
        return _sessionId;
      }
    } catch (e) {// 解析错误，创建新会话
    }
  } // 生成新的会话 ID


  var sessionId = "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)); // 存储到 localStorage

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sessionId: sessionId,
      timestamp: Date.now()
    }));
  } catch (e) {// 忽略存储错误
  }

  return sessionId;
} // 监听页面可见性变化

function onVisibilityChange(callback) {
  if (typeof document.hidden !== 'undefined') {
    document.addEventListener('visibilitychange', callback, true);
  } else if (typeof document.msHidden !== 'undefined') {
    document.addEventListener('msvisibilitychange', callback, true);
  } else if (typeof document.webkitHidden !== 'undefined') {
    document.addEventListener('webkitvisibilitychange', callback, true);
  }
} // 监听页面显示

var cache = [];
function getCache() {
  return deepCopy(cache);
}
function addCache(data) {
  cache.push(data);
}
function clearCache() {
  cache.length = 0;
}

var config = {
  url: '',
  appID: '',
  userID: '',
  sampleRate: 1,
  // 采样率，默认 100%
  enablePerformance: true,
  // 是否启用性能监控
  enableError: true,
  // 是否启用错误监控
  enableBehavior: true,
  // 是否启用行为监控
  vue: {
    Vue: null,
    router: null
  }
};
function setConfig(options) {
  for (var key in options) {
    if (options[key] !== undefined) {
      if (_typeof(options[key]) === 'object' && options[key] !== null) {
        // 处理嵌套对象
        if (config[key]) {
          config[key] = _objectSpread2(_objectSpread2({}, config[key]), options[key]);
        } else {
          config[key] = options[key];
        }
      } else {
        config[key] = options[key];
      }
    }
  }
} // 动态配置设置

function updateConfig(options) {
  setConfig(options);
}

function isSupportSendBeacon() {
  var _window$navigator;

  return !!((_window$navigator = window.navigator) !== null && _window$navigator !== void 0 && _window$navigator.sendBeacon);
} // 上报队列

var reportQueue = []; // 队列处理状态

var isProcessing = false; // 最大重试次数

var MAX_RETRY = 3; // 批量上报间隔

var BATCH_INTERVAL = 2000; // 批量上报大小

var BATCH_SIZE = 10; // 检查网络状态

function isOnline() {
  return navigator.onLine;
} // 采样率控制


function shouldSample() {
  return Math.random() < config.sampleRate;
} // 生成会话 ID


var sessionID = getSessionId$1(); // 获取用户唯一标识

var fingerprint = getFingerprint$1(); // 上报数据

function doReport(data) {
  var retryCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!config.url) {
    console.error('请设置上传 url 地址');
    return Promise.reject(new Error('请设置上传 url 地址'));
  }

  var reportData = {
    id: sessionID,
    appID: config.appID,
    userID: config.userID || fingerprint,
    fingerprint: fingerprint,
    sessionID: sessionID,
    data: data,
    timestamp: Date.now()
  };
  var jsonData = JSON.stringify(reportData);
  return new Promise(function (resolve, reject) {
    // 尝试使用 sendBeacon
    if (isSupportSendBeacon() && !isImmediate) {
      var success = navigator.sendBeacon(config.url, jsonData);

      if (success) {
        resolve();
        return;
      }
    } // 降级到 XHR


    var xhr = new XMLHttpRequest();
    xhr.open('POST', config.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        handleRetry(data, retryCount, reject);
      }
    };

    xhr.onerror = function () {
      handleRetry(data, retryCount, reject);
    };

    xhr.send(jsonData);
  });
} // 处理重试


function handleRetry(data, retryCount, reject) {
  if (retryCount < MAX_RETRY) {
    // 指数退避重试
    var delay = Math.pow(2, retryCount) * 1000;
    setTimeout(function () {
      doReport(data, retryCount + 1);
    }, delay);
  } else {
    // 达到最大重试次数，存储到离线缓存
    storeOfflineData(data);
    reject(new Error('上报失败，已存储到离线缓存'));
  }
} // 存储离线数据


function storeOfflineData(data) {
  try {
    var offlineKey = 'monitor_offline_data';
    var offlineData = JSON.parse(localStorage.getItem(offlineKey) || '[]');
    offlineData.push.apply(offlineData, _toConsumableArray(Array.isArray(data) ? data : [data])); // 限制离线数据大小

    if (offlineData.length > 100) {
      offlineData.splice(0, offlineData.length - 100);
    }

    localStorage.setItem(offlineKey, JSON.stringify(offlineData));
  } catch (e) {// 忽略存储错误
  }
} // 处理离线数据


function processOfflineData() {
  if (!isOnline()) return;

  try {
    var offlineKey = 'monitor_offline_data';
    var offlineData = JSON.parse(localStorage.getItem(offlineKey) || '[]');

    if (offlineData.length > 0) {
      // 批量处理离线数据
      var batchData = offlineData.splice(0, BATCH_SIZE);
      doReport(batchData).then(function () {
        // 处理成功，更新离线数据
        localStorage.setItem(offlineKey, JSON.stringify(offlineData)); // 继续处理剩余数据

        if (offlineData.length > 0) {
          setTimeout(processOfflineData, 1000);
        }
      });
    }
  } catch (e) {// 忽略处理错误
  }
} // 处理上报队列


function processQueue() {
  if (isProcessing || reportQueue.length === 0) return;
  isProcessing = true; // 批量处理队列数据

  var batchData = reportQueue.splice(0, BATCH_SIZE);
  doReport(batchData).then(function () {
    isProcessing = false; // 继续处理队列

    if (reportQueue.length > 0) {
      processQueue();
    }
  }).catch(function () {
    isProcessing = false;
  });
} // 定时处理队列


setInterval(function () {
  if (reportQueue.length > 0) {
    processQueue();
  }
}, BATCH_INTERVAL); // 监听网络状态变化

window.addEventListener('online', processOfflineData); // 初始处理离线数据

setTimeout(processOfflineData, 1000);
function report(data) {
  var isImmediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  // 采样率控制
  if (!shouldSample()) {
    return;
  }

  if (isImmediate) {
    // 立即上报
    doReport(data);
  } else {
    // 加入队列
    if (Array.isArray(data)) {
      reportQueue.push.apply(reportQueue, _toConsumableArray(data));
    } else {
      reportQueue.push(data);
    } // 触发队列处理


    processQueue();
  }
}
var timer$2 = null;
function lazyReportCache(data) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;

  // 采样率控制
  if (!shouldSample()) {
    return;
  }

  addCache(data);
  clearTimeout(timer$2);
  timer$2 = setTimeout(function () {
    var data = getCache();

    if (data.length) {
      report(data);
      clearCache();
    }
  }, timeout);
}

var errorCache = new Map(); // 错误上报间隔（毫秒）

var REPORT_INTERVAL = 5000; // 上次上报时间

var lastReportTime = 0; // 生成错误唯一标识

function generateErrorKey(errorData, subType) {
  switch (subType) {
    case 'js':
      return "".concat(errorData.msg, "-").concat(errorData.pageURL, "-").concat(errorData.line, "-").concat(errorData.column);

    case 'resource':
      return "".concat(errorData.url, "-").concat(errorData.resourceType);

    case 'promise':
      return errorData.reason || 'unknown-promise-error';

    case 'vue':
      return "".concat(errorData.error, "-").concat(errorData.info);

    case 'console-error':
      return errorData.errData.map(function (arg) {
        return String(arg);
      }).join('-');

    default:
      return JSON.stringify(errorData);
  }
} // 聚合错误并定期上报


function aggregateError(errorData) {
  var errorKey = generateErrorKey(errorData, errorData.subType);

  if (errorCache.has(errorKey)) {
    // 错误已存在，增加计数
    var existingError = errorCache.get(errorKey);
    existingError.count++;
    existingError.lastOccurrenceTime = performance.now();
  } else {
    // 新错误，添加到缓存
    errorCache.set(errorKey, _objectSpread2(_objectSpread2({}, errorData), {}, {
      count: 1,
      firstOccurrenceTime: performance.now(),
      lastOccurrenceTime: performance.now()
    }));
  } // 定期上报错误


  var now = performance.now();

  if (now - lastReportTime > REPORT_INTERVAL) {
    reportAggregatedErrors();
    lastReportTime = now;
  }
} // 上报聚合后的错误


function reportAggregatedErrors() {
  errorCache.forEach(function (errorData) {
    lazyReportCache(_objectSpread2(_objectSpread2({}, errorData), {}, {
      type: 'error',
      isAggregated: true
    }));
  }); // 清空缓存

  errorCache.clear();
}

function error() {
  var _this = this,
      _config$vue;

  var oldConsoleError = window.console.error;

  window.console.error = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    oldConsoleError.apply(_this, args);
    var errorData = {
      type: 'error',
      subType: 'console-error',
      startTime: performance.now(),
      errData: args,
      pageURL: getPageURL()
    };
    aggregateError(errorData);
  }; // 捕获资源加载失败错误 js css img...


  window.addEventListener('error', function (e) {
    var target = e.target;
    if (!target) return;

    if (target.src || target.href) {
      var url = target.src || target.href;
      var errorData = {
        url: url,
        type: 'error',
        subType: 'resource',
        startTime: e.timeStamp,
        html: target.outerHTML,
        resourceType: target.tagName,
        paths: e.path ? e.path.map(function (item) {
          return item.tagName;
        }).filter(Boolean) : [],
        pageURL: getPageURL()
      };
      aggregateError(errorData);
    }
  }, true); // 监听 js 错误

  window.onerror = function (msg, url, line, column, error) {
    var errorData = {
      msg: msg,
      line: line,
      column: column,
      error: error.stack,
      subType: 'js',
      pageURL: url,
      type: 'error',
      startTime: performance.now()
    };
    aggregateError(errorData);
  }; // 监听 promise 错误 缺点是获取不到列数据


  window.addEventListener('unhandledrejection', function (e) {
    var _e$reason;

    var errorData = {
      reason: (_e$reason = e.reason) === null || _e$reason === void 0 ? void 0 : _e$reason.stack,
      subType: 'promise',
      type: 'error',
      startTime: e.timeStamp,
      pageURL: getPageURL()
    };
    aggregateError(errorData);
  });

  if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue) {
    config.vue.Vue.config.errorHandler = function (err, vm, info) {
      console.error(err);
      var errorData = {
        info: info,
        error: err.stack,
        subType: 'vue',
        type: 'error',
        startTime: performance.now(),
        pageURL: getPageURL()
      };
      aggregateError(errorData);
    };
  }

  onBFCacheRestore(function () {
    // 页面从 BFCache 恢复时，上报缓存的错误
    reportAggregatedErrors();
    error();
  }); // 页面卸载时上报缓存的错误

  window.addEventListener('beforeunload', reportAggregatedErrors);
}

function isSupportPerformanceObserver() {
  return !!window.PerformanceObserver;
}

function observeEntries() {
  executeAfterLoad(function () {
    observeEvent('resource');
    observeEvent('navigation');
    observeEvent('longtask');
  });
}
var hasAlreadyCollected = false;
function observeEvent(entryType) {
  function entryHandler(list) {
    var data = list.getEntries ? list.getEntries() : list;

    var _iterator = _createForOfIteratorHelper(data),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        if (entryType === 'navigation') {
          if (hasAlreadyCollected) return;

          if (observer) {
            observer.disconnect();
          }

          hasAlreadyCollected = true;
        } // 处理长任务


        if (entryType === 'longtask') {
          lazyReportCache({
            name: entry.name,
            subType: entryType,
            type: 'performance',
            duration: entry.duration,
            // 长任务持续时间
            startTime: entry.startTime,
            // 长任务开始时间
            attribution: entry.attribution ? JSON.stringify(entry.attribution) : null // 任务归因

          });
          continue;
        } // nextHopProtocol 属性为空，说明资源解析错误或者跨域
        // beacon 用于上报数据，所以不统计。xhr fetch 单独统计


        if (!entry.nextHopProtocol && entryType !== 'navigation' || filter(entry.initiatorType)) {
          return;
        } // 详细的资源加载各阶段耗时分析


        var resourceDetails = {
          name: entry.name,
          // 资源名称
          subType: entryType,
          type: 'performance',
          sourceType: entry.initiatorType,
          // 资源类型
          resourceType: getResourceType(entry.name),
          // 资源具体类型（图片、JS、CSS等）
          duration: entry.duration,
          // 资源加载总耗时
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          // DNS 解析耗时
          tcp: entry.connectEnd - entry.connectStart,
          // TCP 连接耗时
          ssl: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
          // SSL 握手耗时
          redirect: entry.redirectEnd - entry.redirectStart,
          // 重定向耗时
          ttfb: entry.responseStart,
          // 首字节时间
          download: entry.responseEnd - entry.responseStart,
          // 内容下载耗时
          processing: entry.duration - (entry.responseEnd - entry.startTime),
          // 资源处理耗时
          protocol: entry.nextHopProtocol,
          // 请求协议
          responseBodySize: entry.encodedBodySize,
          // 响应内容大小
          responseHeaderSize: entry.transferSize - entry.encodedBodySize,
          // 响应头部大小
          resourceSize: entry.decodedBodySize,
          // 资源解压后的大小
          isCache: isCache(entry),
          // 是否命中缓存
          startTime: entry.startTime,
          // 资源开始加载时间
          endTime: entry.responseEnd,
          // 资源加载完成时间
          timestamp: performance.now() // 上报时间戳

        };
        lazyReportCache(resourceDetails);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  var observer;

  if (isSupportPerformanceObserver()) {
    observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: entryType,
      buffered: true
    });
  } else {
    var data = window.performance.getEntriesByType(entryType);
    entryHandler(data);
  }
} // 不统计以下类型的资源

var preventType = ['fetch', 'xmlhttprequest', 'beacon'];
var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

if (isSafari) {
  // safari 会把接口请求当成 other
  preventType.push('other');
}

function filter(type) {
  return preventType.includes(type);
}

function isCache(entry) {
  // 直接从缓存读取或 304
  return entry.transferSize === 0 || entry.transferSize !== 0 && entry.encodedBodySize === 0;
} // 根据资源 URL 判断资源类型


function getResourceType(url) {
  var lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith('.js') || lowerUrl.includes('.js?')) {
    return 'script';
  } else if (lowerUrl.endsWith('.css') || lowerUrl.includes('.css?')) {
    return 'stylesheet';
  } else if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
    return 'image';
  } else if (lowerUrl.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
    return 'font';
  } else if (lowerUrl.endsWith('.html') || lowerUrl.endsWith('.htm')) {
    return 'document';
  } else if (lowerUrl.endsWith('.json') || lowerUrl.includes('.json?')) {
    return 'json';
  } else {
    return 'other';
  }
}

function observePaint() {
  if (!isSupportPerformanceObserver()) return;

  var entryHandler = function entryHandler(list) {
    var entries = list.getEntries();

    var _iterator = _createForOfIteratorHelper(entries),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        var json = entry.toJSON();
        delete json.duration;

        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          subType: entry.name,
          type: 'performance',
          pageURL: getPageURL()
        });

        lazyReportCache(reportData);
      } // 检查是否已经获取到了所有的 paint 条目

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    var paintEntryNames = entries.map(function (entry) {
      return entry.name;
    });

    if (paintEntryNames.includes('first-paint') && paintEntryNames.includes('first-contentful-paint')) {
      observer.disconnect();
    }
  };

  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'paint',
    buffered: true
  });
  onBFCacheRestore(function (event) {
    requestAnimationFrame(function () {
      ['first-paint', 'first-contentful-paint'].forEach(function (type) {
        lazyReportCache({
          startTime: performance.now() - event.timeStamp,
          name: type,
          subType: type,
          type: 'performance',
          pageURL: getPageURL(),
          bfc: true
        });
      });
    });
  });
}

function observeLCP() {
  if (!isSupportPerformanceObserver()) {
    return;
  }

  var entryHandler = function entryHandler(list) {

    if (observer) {
      observer.disconnect();
    }

    var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _entry$element;

        var entry = _step.value;
        var json = entry.toJSON();
        delete json.duration;

        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          target: (_entry$element = entry.element) === null || _entry$element === void 0 ? void 0 : _entry$element.tagName,
          name: entry.entryType,
          subType: entry.entryType,
          type: 'performance',
          pageURL: getPageURL()
        });

        lazyReportCache(reportData);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'largest-contentful-paint',
    buffered: true
  });
  onBFCacheRestore(function (event) {
    requestAnimationFrame(function () {
      lazyReportCache({
        startTime: performance.now() - event.timeStamp,
        name: 'largest-contentful-paint',
        subType: 'largest-contentful-paint',
        type: 'performance',
        pageURL: getPageURL(),
        bfc: true
      });
    });
  });
}

function observeCLS() {
  if (!isSupportPerformanceObserver()) return;
  onBFCacheRestore(function () {
    observeCLS();
  });
  var sessionValue = 0;
  var sessionEntries = [];
  var cls = {
    subType: 'layout-shift',
    name: 'layout-shift',
    type: 'performance',
    pageURL: getPageURL(),
    value: 0
  };

  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        // Only count layout shifts without recent user input.
        if (!entry.hadRecentInput) {
          var firstSessionEntry = sessionEntries[0];
          var lastSessionEntry = sessionEntries[sessionEntries.length - 1]; // If the entry occurred less than 1 second after the previous entry and
          // less than 5 seconds after the first entry in the session, include the
          // entry in the current session. Otherwise, start a new session.

          if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(formatCLSEntry(entry));
          } else {
            sessionValue = entry.value;
            sessionEntries = [formatCLSEntry(entry)];
          } // If the current session value is larger than the current CLS value,
          // update CLS and the entries contributing to it.


          if (sessionValue > cls.value) {
            cls.value = sessionValue;
            cls.entries = sessionEntries;
            cls.startTime = performance.now();
            lazyReportCache(deepCopy(cls));
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'layout-shift',
    buffered: true
  });

  if (observer) {
    onHidden(function () {
      observer.takeRecords().map(entryHandler);
    });
  }
}

function formatCLSEntry(entry) {
  var result = entry.toJSON();
  delete result.duration;
  delete result.sources;
  return result;
}

function observeFID() {
  onBFCacheRestore(function () {
    observeFID();
  });

  if (isSupportPerformanceObserver()) {
    var entryHandler = function entryHandler(list) {
      if (observer) {
        observer.disconnect();
      }

      var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var entry = _step.value;
          var json = entry.toJSON();
          json.nodeName = entry.tagName;
          json.event = json.name;
          json.name = json.entryType;
          json.type = 'performance';
          json.pageURL = getPageURL();
          delete json.cancelable;
          lazyReportCache(json);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };

    var observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: 'first-input',
      buffered: true
    });
    return;
  }

  fidPolyfill();
}

function fidPolyfill() {
  eachEventType(window.addEventListener);
}

function onInput(event) {
  // Only count cancelable events, which should trigger behavior
  // important to the user.
  if (event.cancelable) {
    // In some browsers `event.timeStamp` returns a `DOMTimeStamp` value
    // (epoch time) instead of the newer `DOMHighResTimeStamp`
    // (document-origin time). To check for that we assume any timestamp
    // greater than 1 trillion is a `DOMTimeStamp`, and compare it using
    // the `Date` object rather than `performance.now()`.
    // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
    var isEpochTime = event.timeStamp > 1e12;
    var now = isEpochTime ? Date.now() : performance.now(); // Input delay is the delta between when the system received the event
    // (e.g. event.timeStamp) and when it could run the callback (e.g. `now`).

    var duration = now - event.timeStamp;
    lazyReportCache({
      duration: duration,
      subType: 'first-input',
      event: event.type,
      name: 'first-input',
      target: event.target.tagName,
      startTime: event.timeStamp,
      type: 'performance',
      pageURL: getPageURL()
    });
    eachEventType(window.removeEventListener);
  }
}

function eachEventType(callback) {
  var eventTypes = ['mousedown', 'keydown', 'touchstart'];
  eventTypes.forEach(function (type) {
    return callback(type, onInput, {
      passive: true,
      capture: true
    });
  });
}

function observerLoad() {
  ['load', 'DOMContentLoaded'].forEach(function (type) {
    return onEvent(type);
  });
  onBFCacheRestore(function (event) {
    requestAnimationFrame(function () {
      ['load', 'DOMContentLoaded'].forEach(function (type) {
        lazyReportCache({
          startTime: performance.now() - event.timeStamp,
          subType: type.toLocaleLowerCase(),
          type: 'performance',
          pageURL: getPageURL(),
          bfc: true
        });
      });
    });
  });
}

function onEvent(type) {
  function callback() {
    lazyReportCache({
      type: 'performance',
      subType: type.toLocaleLowerCase(),
      startTime: performance.now()
    });
    window.removeEventListener(type, callback, true);
  }

  window.addEventListener(type, callback, true);
}

var isOnLoaded = false;
executeAfterLoad(function () {
  isOnLoaded = true;
});
var timer$1;
var observer;

function checkDOMChange() {
  clearTimeout(timer$1);
  timer$1 = setTimeout(function () {
    // 等 load 事件触发后，或者 DOM 树长时间不再变化时，计算首屏渲染时间
    // 这样即使 LCP 事件没有触发，首屏渲染时间也能被计算
    if (isOnLoaded || entries.length > 0 && !hasRecentDOMChanges()) {
      observer && observer.disconnect();
      var renderTimeData = getRenderTime(); // 只有当首屏渲染时间大于 0 时才上报

      if (renderTimeData.firstScreenPaintTime > 0) {
        lazyReportCache({
          type: 'performance',
          subType: 'first-screen-paint',
          startTime: renderTimeData.firstScreenPaintTime,
          pageURL: getPageURL(),
          details: renderTimeData
        });
      }

      entries = null;
    } else {
      checkDOMChange();
    }
  }, 300); // 缩短检测间隔，提高精度
} // 检查是否有最近的 DOM 变化


function hasRecentDOMChanges() {
  if (entries.length === 0) return false; // 获取最近的一个 DOM 变化条目

  var recentEntry = entries[entries.length - 1]; // 检查最近的 DOM 变化是否在 2 秒内

  return performance.now() - recentEntry.startTime < 2000;
}

var entries = [];
function observeFirstScreenPaint() {
  if (!MutationObserver) return;
  var ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK', 'META'];
  observer = new MutationObserver(function (mutationList) {
    checkDOMChange(); // 立即记录当前时间，而不是在 requestAnimationFrame 中

    var currentTime = performance.now();
    var entry = {
      startTime: currentTime,
      children: []
    };

    var _iterator = _createForOfIteratorHelper(mutationList),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var mutation = _step.value;

        if (mutation.addedNodes.length) {
          for (var _i = 0, _Array$from = Array.from(mutation.addedNodes); _i < _Array$from.length; _i++) {
            var node = _Array$from[_i];

            if (node.nodeType === 1 && !ignoreDOMList.includes(node.tagName) && !isInclude(node, entry.children)) {
              entry.children.push(node);
            }
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (entry.children.length) {
      entries.push(entry);
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  onBFCacheRestore(function (event) {
    requestAnimationFrame(function () {
      lazyReportCache({
        startTime: performance.now() - event.timeStamp,
        type: 'performance',
        subType: 'first-screen-paint',
        bfc: true,
        pageURL: getPageURL()
      });
    });
  });
}

function getRenderTime() {
  var maxDomRenderTime = 0;
  var maxImageLoadTime = 0;
  var maxFontLoadTime = 0;
  var maxCssLoadTime = 0;
  var firstPaintTime = 0;
  var firstContentfulPaintTime = 0; // 1. 计算 DOM 渲染时间

  entries.forEach(function (entry) {
    var _iterator2 = _createForOfIteratorHelper(entry.children),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var node = _step2.value;

        if (isInScreen(node) && entry.startTime > maxDomRenderTime && needToCalculate(node)) {
          maxDomRenderTime = entry.startTime;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }); // 2. 计算首屏内资源加载时间

  var resources = performance.getEntriesByType('resource');
  resources.forEach(function (item) {
    // 检查资源是否在首屏内被使用
    if (isResourceInFirstScreen(item)) {
      // 图片资源
      if (item.initiatorType === 'img' || item.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        if (item.responseEnd > maxImageLoadTime) {
          maxImageLoadTime = item.responseEnd;
        }
      } // 字体资源
      else if (item.name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
        if (item.responseEnd > maxFontLoadTime) {
          maxFontLoadTime = item.responseEnd;
        }
      } // CSS 资源
      else if (item.initiatorType === 'link' && item.name.match(/\.css$/i)) {
        if (item.responseEnd > maxCssLoadTime) {
          maxCssLoadTime = item.responseEnd;
        }
      }
    }
  }); // 3. 获取首次绘制和首次内容绘制时间

  var paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach(function (entry) {
    if (entry.name === 'first-paint' && entry.startTime > firstPaintTime) {
      firstPaintTime = entry.startTime;
    } else if (entry.name === 'first-contentful-paint' && entry.startTime > firstContentfulPaintTime) {
      firstContentfulPaintTime = entry.startTime;
    }
  }); // 4. 取所有时间的最大值作为首屏渲染时间

  var firstScreenPaintTime = Math.max(maxDomRenderTime, maxImageLoadTime, maxFontLoadTime, maxCssLoadTime, firstContentfulPaintTime // 确保首屏渲染时间至少不小于首次内容绘制时间
  ); // 5. 如果所有时间都为 0，使用当前时间作为默认值

  var finalFirstScreenPaintTime = firstScreenPaintTime > 0 ? firstScreenPaintTime : performance.now(); // 6. 返回详细的首屏渲染时间数据

  return {
    firstScreenPaintTime: finalFirstScreenPaintTime,
    domRenderTime: maxDomRenderTime,
    imageLoadTime: maxImageLoadTime,
    fontLoadTime: maxFontLoadTime,
    cssLoadTime: maxCssLoadTime,
    firstPaintTime: firstPaintTime,
    firstContentfulPaintTime: firstContentfulPaintTime,
    breakdown: {
      dom: maxDomRenderTime,
      images: maxImageLoadTime,
      fonts: maxFontLoadTime,
      css: maxCssLoadTime,
      firstPaint: firstPaintTime,
      firstContentfulPaint: firstContentfulPaintTime
    }
  };
}

function needToCalculate(node) {
  // 隐藏的元素不用计算
  if (window.getComputedStyle(node).display === 'none') return false; // 用于统计的图片不用计算

  if (node.tagName === 'IMG' && node.width < 2 && node.height < 2) {
    return false;
  } // 空内容的元素不用计算


  if (node.tagName !== 'IMG' && !node.textContent.trim() && node.children.length === 0) {
    return false;
  }

  return true;
}

function isInclude(node, arr) {
  if (!node || node === document.documentElement) {
    return false;
  }

  if (arr.includes(node)) {
    return true;
  }

  return isInclude(node.parentElement, arr);
}

var viewportWidth = window.innerWidth;
var viewportHeight$1 = window.innerHeight; // dom 对象是否在屏幕内

function isInScreen(dom) {
  var rectInfo = dom.getBoundingClientRect(); // 只要元素的一部分在屏幕内就算首屏内元素

  if (rectInfo.right > 0 && rectInfo.left < viewportWidth && rectInfo.bottom > 0 && rectInfo.top < viewportHeight$1) {
    return true;
  }

  return false;
} // 检查资源是否在首屏内被使用


function isResourceInFirstScreen(resource) {
  // 对于 CSS 和字体资源，认为它们会影响首屏渲染
  if (resource.name.match(/\.css$/i) || resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
    return true;
  } // 对于图片资源，检查是否在首屏内


  if (resource.initiatorType === 'img' || resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    var images = document.querySelectorAll('img');

    var _iterator3 = _createForOfIteratorHelper(images),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var img = _step3.value;

        if (img.src === resource.name && isInScreen(img)) {
          return true;
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  return false;
}

function overwriteOpenAndSend() {
  originalProto.open = function newOpen() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.url = args[1];
    this.method = args[0];
    originalOpen.apply(this, args);
  };

  originalProto.send = function newSend() {
    var _this = this;

    this.startTime = Date.now();

    var onLoadend = function onLoadend() {
      _this.endTime = Date.now();
      _this.duration = _this.endTime - _this.startTime;
      var status = _this.status,
          duration = _this.duration,
          startTime = _this.startTime,
          endTime = _this.endTime,
          url = _this.url,
          method = _this.method;
      var reportData = {
        status: status,
        duration: duration,
        startTime: startTime,
        endTime: endTime,
        url: url,
        method: (method || 'GET').toUpperCase(),
        success: status >= 200 && status < 300,
        subType: 'xhr',
        type: 'performance'
      };
      lazyReportCache(reportData);

      _this.removeEventListener('loadend', onLoadend, true);
    };

    this.addEventListener('loadend', onLoadend, true);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    originalSend.apply(this, args);
  };
}

function xhr() {
  overwriteOpenAndSend();
}

var originalFetch = window.fetch;

function overwriteFetch() {
  window.fetch = function newFetch(url, config) {
    var startTime = Date.now();
    var reportData = {
      startTime: startTime,
      url: url,
      method: ((config === null || config === void 0 ? void 0 : config.method) || 'GET').toUpperCase(),
      subType: 'fetch',
      type: 'performance'
    };
    return originalFetch(url, config).then(function (res) {
      reportData.endTime = Date.now();
      reportData.duration = reportData.endTime - reportData.startTime;
      var data = res.clone();
      reportData.status = data.status;
      reportData.success = data.ok;
      lazyReportCache(reportData);
      return res;
    }).catch(function (err) {
      reportData.endTime = Date.now();
      reportData.duration = reportData.endTime - reportData.startTime;
      reportData.status = 0;
      reportData.success = false;
      lazyReportCache(reportData);
      throw err;
    });
  };
}

function fetch() {
  overwriteFetch();
}

var next = window.requestAnimationFrame ? requestAnimationFrame : function (callback) {
  setTimeout(callback, 1000 / 60);
};
var frames = [];
function fps() {
  var frame = 0;
  var lastSecond = Date.now();

  function calculateFPS() {
    frame++;
    var now = Date.now();

    if (lastSecond + 1000 <= now) {
      // 由于 now - lastSecond 的单位是毫秒，所以 frame 要 * 1000
      var _fps = Math.round(frame * 1000 / (now - lastSecond));

      frames.push(_fps);
      frame = 0;
      lastSecond = now;
    } // 避免上报太快，缓存一定数量再上报


    if (frames.length >= 60) {
      report(deepCopy({
        frames: frames,
        type: 'performance',
        subType: 'fps'
      }));
      frames.length = 0;
    }

    next(calculateFPS);
  }

  calculateFPS();
}

function onVueRouter$1(Vue, router) {
  var isFirst = true;
  var startTime;
  router.beforeEach(function (to, from, next) {
    // 首次进入页面已经有其他统计的渲染时间可用
    if (isFirst) {
      isFirst = false;
      return next();
    } // 给 router 新增一个字段，表示是否要计算渲染时间
    // 只有路由跳转才需要计算


    router.needCalculateRenderTime = true;
    startTime = performance.now();
    next();
  });
  var timer;
  Vue.mixin({
    mounted: function mounted() {
      if (!router.needCalculateRenderTime) return;
      this.$nextTick(function () {
        // 仅在整个视图都被渲染之后才会运行的代码
        var now = performance.now();
        clearTimeout(timer);
        timer = setTimeout(function () {
          router.needCalculateRenderTime = false;
          lazyReportCache({
            type: 'performance',
            subType: 'vue-router-change-paint',
            duration: now - startTime,
            startTime: now,
            pageURL: getPageURL()
          });
        }, 1000);
      });
    }
  });
}

function performance$1() {
  var _config$vue, _config$vue2;

  observeEntries();
  observePaint();
  observeLCP();
  observeCLS();
  observeFID();
  xhr();
  fetch();
  fps();
  observerLoad();
  observeFirstScreenPaint();

  if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue && (_config$vue2 = config.vue) !== null && _config$vue2 !== void 0 && _config$vue2.router) {
    onVueRouter$1(config.vue.Vue, config.vue.router);
  }
}

function generateUniqueID() {
  return "v2-".concat(Date.now(), "-").concat(Math.floor(Math.random() * (9e12 - 1)) + 1e12);
}

var uuid = '';
function getUUID() {
  if (uuid) return uuid; // 如果是手机 APP，可以调用原生方法或者设备唯一标识当成 uuid

  uuid = localStorage.getItem('uuid');
  if (uuid) return uuid;
  uuid = generateUniqueID();
  localStorage.setItem('uuid', uuid);
  return uuid;
}

function pv() {
  lazyReportCache({
    type: 'behavior',
    subType: 'pv',
    startTime: performance.now(),
    pageURL: getPageURL(),
    referrer: document.referrer,
    uuid: getUUID()
  });
}

function pageAccessDuration() {
  onBeforeunload(function () {
    report({
      type: 'behavior',
      subType: 'page-access-duration',
      startTime: performance.now(),
      pageURL: getPageURL(),
      uuid: getUUID()
    }, true);
  });
}

var timer;
var startTime = 0;
var hasReport = false;
var pageHeight = 0;
var scrollTop = 0;
var viewportHeight = 0;
function pageAccessHeight() {
  window.addEventListener('scroll', onScroll);
  onBeforeunload(function () {
    var now = performance.now();
    report({
      startTime: now,
      duration: now - startTime,
      type: 'behavior',
      subType: 'page-access-height',
      pageURL: getPageURL(),
      value: toPercent((scrollTop + viewportHeight) / pageHeight),
      uuid: getUUID()
    }, true);
  }); // 页面加载完成后初始化记录当前访问高度、时间

  executeAfterLoad(function () {
    startTime = performance.now();
    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    viewportHeight = window.innerHeight;
  });
}

function onScroll() {
  clearTimeout(timer);
  var now = performance.now();

  if (!hasReport) {
    hasReport = true;
    lazyReportCache({
      startTime: now,
      duration: now - startTime,
      type: 'behavior',
      subType: 'page-access-height',
      pageURL: getPageURL(),
      value: toPercent((scrollTop + viewportHeight) / pageHeight),
      uuid: getUUID()
    });
  }

  timer = setTimeout(function () {
    hasReport = false;
    startTime = now;
    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    viewportHeight = window.innerHeight;
  }, 500);
}

function toPercent(val) {
  if (val >= 1) return '100%';
  return (val * 100).toFixed(2) + '%';
}

function onClick() {
  ['mousedown', 'touchstart'].forEach(function (eventType) {
    var timer;
    window.addEventListener(eventType, function (event) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var _event$path;

        var target = event.target;

        var _target$getBoundingCl = target.getBoundingClientRect(),
            top = _target$getBoundingCl.top,
            left = _target$getBoundingCl.left;

        lazyReportCache({
          top: top,
          left: left,
          eventType: eventType,
          pageHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
          scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
          type: 'behavior',
          subType: 'click',
          target: target.tagName,
          paths: (_event$path = event.path) === null || _event$path === void 0 ? void 0 : _event$path.map(function (item) {
            return item.tagName;
          }).filter(Boolean),
          startTime: event.timeStamp,
          pageURL: getPageURL(),
          outerHTML: target.outerHTML,
          innerHTML: target.innerHTML,
          width: target.offsetWidth,
          height: target.offsetHeight,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          uuid: getUUID()
        });
      }, 500);
    });
  });
}

function onVueRouter(router) {
  router.beforeEach(function (to, from, next) {
    // 首次加载页面不用统计
    if (!from.name) {
      return next();
    }

    var data = {
      params: to.params,
      query: to.query
    };
    lazyReportCache({
      data: data,
      name: to.name || to.path,
      type: 'behavior',
      subType: ['vue-router-change', 'pv'],
      startTime: performance.now(),
      from: from.fullPath,
      to: to.fullPath,
      uuid: getUUID()
    });
    next();
  });
}

function pageChange() {
  var from = '';
  window.addEventListener('popstate', function () {
    var to = getPageURL();
    lazyReportCache({
      from: from,
      to: to,
      type: 'behavior',
      subType: 'popstate',
      startTime: performance.now(),
      uuid: getUUID()
    });
    from = to;
  }, true);
  var oldURL = '';
  window.addEventListener('hashchange', function (event) {
    var newURL = event.newURL;
    lazyReportCache({
      from: oldURL,
      to: newURL,
      type: 'behavior',
      subType: 'hashchange',
      startTime: performance.now(),
      uuid: getUUID()
    });
    oldURL = newURL;
  }, true);
}

function behavior() {
  var _config$vue;

  pv();
  pageAccessDuration();
  pageAccessHeight();
  onClick();
  pageChange();

  if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.router) {
    onVueRouter(config.vue.router);
  }
}

function safeExecute(fn) {
  try {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return fn.apply(void 0, args);
  } catch (error) {
    console.warn('SDK 内部错误:', error); // 可以在这里添加错误上报逻辑

    return null;
  }
} // 包装 report 方法，确保上报过程中的错误不会影响业务页面


var safeReport = function safeReport() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return safeExecute.apply(void 0, [report].concat(args));
}; // 页面可见性变化处理


function handleVisibilityChange() {
  var pageState = {
    isHidden: document.hidden,
    timestamp: Date.now(),
    duration: 0
  };
  var lastVisibleTime = Date.now();
  onVisibilityChange(function () {
    if (document.hidden) {
      // 页面进入后台
      pageState.isHidden = true;
      pageState.timestamp = Date.now();
      lastVisibleTime = Date.now(); // 上报页面进入后台事件

      safeExecute(function () {
        safeReport({
          type: 'behavior',
          subType: 'page-visibility',
          action: 'hide',
          timestamp: pageState.timestamp
        });
      });
    } else {
      // 页面回到前台
      var currentTime = Date.now();
      pageState.isHidden = false;
      pageState.duration = currentTime - lastVisibleTime;
      pageState.timestamp = currentTime; // 上报页面回到前台事件

      safeExecute(function () {
        safeReport({
          type: 'behavior',
          subType: 'page-visibility',
          action: 'show',
          timestamp: pageState.timestamp,
          duration: pageState.duration
        });
      });
    }
  });
}

var monitor = {
  init: function init() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    safeExecute(function () {
      setConfig(options); // 根据配置开关决定是否启用相应功能

      if (config.enableError) {
        safeExecute(error);
      }

      if (config.enablePerformance) {
        safeExecute(performance$1);
      }

      if (config.enableBehavior) {
        safeExecute(behavior); // 初始化页面可见性变化监控

        safeExecute(handleVisibilityChange);
      } // 当页面进入后台或关闭前时，将所有的 cache 数据进行上报


      [onBeforeunload, onHidden].forEach(function (fn) {
        fn(function () {
          safeExecute(function () {
            var data = getCache();

            if (data.length) {
              safeReport(data, true);
              clearCache();
            }
          });
        });
      });
    });
  },
  report: safeReport,
  // 动态配置开关
  setConfig: function setConfig(options) {
    safeExecute(function () {
      updateConfig(options);
    });
  },
  // 获取用户唯一标识
  getFingerprint: function (_getFingerprint) {
    function getFingerprint() {
      return _getFingerprint.apply(this, arguments);
    }

    getFingerprint.toString = function () {
      return _getFingerprint.toString();
    };

    return getFingerprint;
  }(function () {
    var fp = getFingerprint;
    return safeExecute(fp);
  }),
  // 获取会话 ID
  getSessionId: function (_getSessionId) {
    function getSessionId() {
      return _getSessionId.apply(this, arguments);
    }

    getSessionId.toString = function () {
      return _getSessionId.toString();
    };

    return getSessionId;
  }(function () {
    var sid = getSessionId;
    return safeExecute(sid);
  }),
  // 用于测试 SDK 异常隔离功能的方法
  testCrash: function testCrash() {
    throw new Error('SDK 测试崩溃');
  }
};

export { monitor as default };
//# sourceMappingURL=monitor.esm.js.map
