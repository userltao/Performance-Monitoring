var originalProto = XMLHttpRequest.prototype;
var originalOpen = originalProto.open;
var originalSend = originalProto.send;

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: !0
          } : {
            done: !1,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = !0, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

// 深拷贝
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
    // 判断是不是从缓存中恢复的
    if (event.persisted) {
      callback(event);
    }
  }, true);
}
function onBeforeunload(callback) {
  window.addEventListener('beforeunload', callback, true);
}
function onHidden(callback, once) {
  var _onHiddenOrPageHide = function onHiddenOrPageHide(event) {
    if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
      callback(event);
      if (once) {
        window.removeEventListener('visibilitychange', _onHiddenOrPageHide, true);
        window.removeEventListener('pagehide', _onHiddenOrPageHide, true);
      }
    }
  };
  window.addEventListener('visibilitychange', _onHiddenOrPageHide, true);
  window.addEventListener('pagehide', _onHiddenOrPageHide, true);
}
function executeAfterLoad(callback) {
  if (document.readyState === 'complete') {
    callback();
  } else {
    var _onLoad = function onLoad() {
      callback();
      window.removeEventListener('load', _onLoad, true);
    };
    window.addEventListener('load', _onLoad, true);
  }
}
function getPageURL() {
  return window.location.href;
}

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

function generateUniqueID() {
  return "v2-".concat(Date.now(), "-").concat(Math.floor(Math.random() * (9e12 - 1)) + 1e12);
}

var config = {
  url: '',
  appID: '',
  userID: '',
  vue: {
    Vue: null,
    router: null
  },
  sanitize: {
    enabled: true,
    level: 'STANDARD',
    options: null
  }
};
function setConfig(options) {
  for (var key in config) {
    if (options[key]) {
      config[key] = options[key];
    }
  }
}

// 敏感信息正则表达式
var PATTERNS = {
  // 中国大陆手机号: 1开头，11位数字
  PHONE: /1[3-9]\d{9}/g,
  // 中国大陆身份证号: 18位，最后一位可以是X
  ID_CARD: /\d{17}[\dXx]/g,
  // 邮箱
  EMAIL: /[\w.-]+@[\w.-]+\.\w+/g,
  // 银行卡号: 16-19位数字
  BANK_CARD: /\b\d{16,19}\b/g,
  // IPv4 地址
  IPV4: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // IPv6 地址 (简化版)
  IPV6: /([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}/g,
  // 中文姓名: 2-4个中文字符 (需要更严格的上下文)
  CHINESE_NAME: /(?<=[\u4e00-\u9fa5]{0,2})[\u4e00-\u9fa5]{2,4}(?=[\u4e00-\u9fa5]{0,2})/g,
  // URL 中的敏感参数
  URL_TOKEN: /[?&](token|key|secret|password|pwd|auth)=[^&]*/gi
};

// 脱敏替换函数
var REPLACERS = {
  // 手机号: 保留前3位和后4位
  PHONE: function PHONE(match) {
    return match.substring(0, 3) + '****' + match.substring(7);
  },
  // 身份证号: 保留前4位和后4位
  ID_CARD: function ID_CARD(match) {
    return match.substring(0, 4) + '**********' + match.substring(14);
  },
  // 邮箱: 保留首字符和域名
  EMAIL: function EMAIL(match) {
    var _match$split = match.split('@'),
      _match$split2 = _slicedToArray(_match$split, 2),
      local = _match$split2[0],
      domain = _match$split2[1];
    var maskedLocal = local.charAt(0) + '***';
    return maskedLocal + '@' + domain;
  },
  // 银行卡号: 保留后4位
  BANK_CARD: function BANK_CARD(match) {
    return '**** **** **** ' + match.substring(match.length - 4);
  },
  // IPv4: 保留前两段
  IPV4: function IPV4(match) {
    var parts = match.split('.');
    return parts[0] + '.' + parts[1] + '.*.*';
  },
  // IPv6: 保留前四段
  IPV6: function IPV6(match) {
    var parts = match.split(':');
    return parts.slice(0, 4).join(':') + ':*:*:*:*';
  },
  // 中文姓名: 保留姓氏
  CHINESE_NAME: function CHINESE_NAME(match) {
    return match.charAt(0) + '*'.repeat(match.length - 1);
  },
  // URL 敏感参数: 保留参数名
  URL_TOKEN: function URL_TOKEN(match) {
    var _match$split3 = match.split('='),
      _match$split4 = _slicedToArray(_match$split3, 1),
      key = _match$split4[0];
    return key + '=***';
  }
};

/**
 * 对字符串进行脱敏处理
 * @param {string} text - 待脱敏的字符串
 * @param {Object} options - 脱敏选项
 * @param {boolean} options.phone - 是否脱敏手机号 (默认 true)
 * @param {boolean} options.idCard - 是否脱敏身份证号 (默认 true)
 * @param {boolean} options.email - 是否脱敏邮箱 (默认 true)
 * @param {boolean} options.bankCard - 是否脱敏银行卡号 (默认 true)
 * @param {boolean} options.ip - 是否脱敏 IP 地址 (默认 true)
 * @param {boolean} options.name - 是否脱敏中文姓名 (默认 false，误伤率高)
 * @param {boolean} options.urlToken - 是否脱敏 URL 中的敏感参数 (默认 true)
 * @param {Array} options.customPatterns - 自定义正则表达式数组
 * @param {Function} options.customReplacer - 自定义替换函数
 * @returns {string} 脱敏后的字符串
 */
function sanitizeString(text) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (typeof text !== 'string') return text;
  var _options$phone = options.phone,
    phone = _options$phone === void 0 ? true : _options$phone,
    _options$idCard = options.idCard,
    idCard = _options$idCard === void 0 ? true : _options$idCard,
    _options$email = options.email,
    email = _options$email === void 0 ? true : _options$email,
    _options$bankCard = options.bankCard,
    bankCard = _options$bankCard === void 0 ? true : _options$bankCard,
    _options$ip = options.ip,
    ip = _options$ip === void 0 ? true : _options$ip,
    _options$name = options.name,
    name = _options$name === void 0 ? false : _options$name,
    _options$urlToken = options.urlToken,
    urlToken = _options$urlToken === void 0 ? true : _options$urlToken,
    _options$customPatter = options.customPatterns,
    customPatterns = _options$customPatter === void 0 ? [] : _options$customPatter,
    _options$customReplac = options.customReplacer,
    customReplacer = _options$customReplac === void 0 ? null : _options$customReplac;

  // 使用标记替换法，先替换长的模式，避免短模式先匹配到长模式的一部分
  var markers = [];
  var result = text;

  // 添加标记函数
  var addMarker = function addMarker(match, replacer) {
    var marker = "__SANITIZE_".concat(markers.length, "__");
    markers.push(replacer(match));
    return marker;
  };

  // 按优先级处理：先处理长的、更具体的模式
  // 1. 身份证号 (18位，优先级最高)
  if (idCard) {
    result = result.replace(PATTERNS.ID_CARD, function (match) {
      return addMarker(match, REPLACERS.ID_CARD);
    });
  }

  // 2. 银行卡号 (16-19位)
  if (bankCard) {
    result = result.replace(PATTERNS.BANK_CARD, function (match) {
      return addMarker(match, REPLACERS.BANK_CARD);
    });
  }

  // 3. 手机号 (11位)
  if (phone) {
    result = result.replace(PATTERNS.PHONE, function (match) {
      return addMarker(match, REPLACERS.PHONE);
    });
  }

  // 4. 邮箱
  if (email) {
    result = result.replace(PATTERNS.EMAIL, function (match) {
      return addMarker(match, REPLACERS.EMAIL);
    });
  }

  // 5. IPv4
  if (ip) {
    result = result.replace(PATTERNS.IPV4, function (match) {
      return addMarker(match, REPLACERS.IPV4);
    });
  }

  // 6. IPv6
  if (ip) {
    result = result.replace(PATTERNS.IPV6, function (match) {
      return addMarker(match, REPLACERS.IPV6);
    });
  }

  // 7. 中文姓名
  if (name) {
    result = result.replace(PATTERNS.CHINESE_NAME, function (match) {
      return addMarker(match, REPLACERS.CHINESE_NAME);
    });
  }

  // 8. URL 敏感参数
  if (urlToken) {
    result = result.replace(PATTERNS.URL_TOKEN, function (match) {
      return addMarker(match, REPLACERS.URL_TOKEN);
    });
  }

  // 应用自定义正则
  if (customPatterns.length > 0 && customReplacer) {
    var _iterator = _createForOfIteratorHelper(customPatterns),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var pattern = _step.value;
        result = result.replace(pattern, function (match) {
          return addMarker(match, customReplacer);
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  // 还原所有标记
  markers.forEach(function (replacement, index) {
    result = result.replace("__SANITIZE_".concat(index, "__"), replacement);
  });
  return result;
}

/**
 * 递归遍历对象，对所有字符串值进行脱敏
 * @param {any} data - 待脱敏的数据
 * @param {Object} options - 脱敏选项 (同 sanitizeString)
 * @param {number} depth - 当前递归深度 (防止循环引用)
 * @returns {any} 脱敏后的数据
 */
function sanitizeData(data) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  // 防止过深递归
  if (depth > 10) return data;
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data === 'string') {
    return sanitizeString(data, options);
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(function (item) {
      return sanitizeData(item, options, depth + 1);
    });
  }
  if (_typeof(data) === 'object') {
    var result = {};
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // 跳过某些不需要脱敏的字段
        if (shouldSkipField(key)) {
          result[key] = data[key];
        } else {
          result[key] = sanitizeData(data[key], options, depth + 1);
        }
      }
    }
    return result;
  }
  return data;
}

/**
 * 判断是否跳过某个字段的脱敏
 * @param {string} fieldName - 字段名
 * @returns {boolean} 是否跳过
 */
function shouldSkipField(fieldName) {
  var skipFields = ['type', 'subType', 'name', 'startTime', 'duration', 'entryType', 'timestamp', 'id', 'sessionID', 'appID'];
  return skipFields.includes(fieldName);
}

// 预设的脱敏级别
var SANITIZE_LEVELS = {
  // 严格模式: 脱敏所有敏感信息
  STRICT: {
    phone: true,
    idCard: true,
    email: true,
    bankCard: true,
    ip: true,
    name: true,
    urlToken: true
  },
  // 标准模式: 脱敏常见敏感信息，不脱敏姓名 (误伤率高)
  STANDARD: {
    phone: true,
    idCard: true,
    email: true,
    bankCard: true,
    ip: true,
    name: false,
    urlToken: true
  },
  // 宽松模式: 只脱敏最关键的敏感信息
  LOOSE: {
    phone: true,
    idCard: true,
    email: false,
    bankCard: true,
    ip: false,
    name: false,
    urlToken: true
  },
  // 关闭模式: 不进行脱敏
  OFF: {
    phone: false,
    idCard: false,
    email: false,
    bankCard: false,
    ip: false,
    name: false,
    urlToken: false
  }
};

function isSupportSendBeacon() {
  var _window$navigator;
  return !!((_window$navigator = window.navigator) !== null && _window$navigator !== void 0 && _window$navigator.sendBeacon);
}
var sendBeacon = isSupportSendBeacon() ? window.navigator.sendBeacon.bind(window.navigator) : reportWithXHR;
var sessionID = generateUniqueID();
function report(data) {
  var _config$sanitize;
  var isImmediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!config.url) {
    console.error('请设置上传 url 地址');
  }

  // 应用数据脱敏
  var sanitizedData = data;
  if (((_config$sanitize = config.sanitize) === null || _config$sanitize === void 0 ? void 0 : _config$sanitize.enabled) !== false) {
    var _config$sanitize2, _config$sanitize3;
    var sanitizeOptions = ((_config$sanitize2 = config.sanitize) === null || _config$sanitize2 === void 0 ? void 0 : _config$sanitize2.options) || SANITIZE_LEVELS[((_config$sanitize3 = config.sanitize) === null || _config$sanitize3 === void 0 ? void 0 : _config$sanitize3.level) || 'STANDARD'];
    if (sanitizeOptions) {
      sanitizedData = sanitizeData(data, sanitizeOptions);
    }
  }
  var reportData = JSON.stringify({
    id: sessionID,
    appID: config.appID,
    userID: config.userID,
    data: sanitizedData
  });

  // 要立即上报，直接发送
  if (isImmediate) {
    sendBeacon(config.url, reportData);
    return;
  }

  // 浏览器空闲时上报
  if (window.requestIdleCallback) {
    window.requestIdleCallback(function () {
      sendBeacon(config.url, reportData);
    }, {
      timeout: 3000
    });
  } else {
    setTimeout(function () {
      sendBeacon(config.url, reportData);
    });
  }
}
var timer$2 = null;
function lazyReportCache(data) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;
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
function reportWithXHR(data) {
  var xhr = new XMLHttpRequest();
  originalOpen.call(xhr, 'post', config.url);
  originalSend.call(xhr, JSON.stringify(data));
}

/**
 * 错误去重工具模块
 * 相同错误短时间内只上报一次，避免重复数据
 */

// 存储错误指纹和最后上报时间
var errorCache = new Map();

// 默认去重时间窗口（5秒）
var DEFAULT_INTERVAL = 5000;

/**
 * 安全地将值转换为字符串并截取
 * @param {any} value - 要转换的值
 * @param {number} maxLength - 最大长度
 * @returns {string} 截取后的字符串
 */
function safeSlice(value, maxLength) {
  if (value == null) return '';
  var str = typeof value === 'string' ? value : String(value);
  return str.slice(0, maxLength);
}

/**
 * 生成错误指纹
 * 根据错误类型和关键信息生成唯一标识
 * @param {Object} errorData - 错误数据
 * @returns {string} 错误指纹
 */
function generateFingerprint(errorData) {
  var subType = errorData.subType,
    msg = errorData.msg,
    url = errorData.url,
    resourceType = errorData.resourceType,
    errData = errorData.errData,
    reason = errorData.reason,
    error = errorData.error;

  // 基础指纹 = 子类型
  var fingerprint = subType || 'unknown';
  switch (subType) {
    case 'console-error':
      // 控制台错误：使用错误信息的前100个字符
      fingerprint += ":".concat(errData === null || errData === void 0 ? void 0 : errData.map(function (item) {
        return safeSlice(item, 100);
      }).join(','));
      break;
    case 'js':
      // JS错误：使用消息 + 文件URL + 行号
      fingerprint += ":".concat(safeSlice(msg, 100), ":").concat(url, ":").concat(errorData.line, ":").concat(errorData.column);
      break;
    case 'promise':
      // Promise错误：使用错误堆栈的前200个字符
      fingerprint += ":".concat(safeSlice(reason, 200));
      break;
    case 'resource':
      // 资源错误：使用资源URL + 资源类型
      fingerprint += ":".concat(url, ":").concat(resourceType);
      break;
    case 'vue':
      // Vue错误：使用错误堆栈的前200个字符
      fingerprint += ":".concat(safeSlice(error, 200));
      break;
    default:
      // 其他：使用JSON序列化的前200个字符
      fingerprint += ":".concat(safeSlice(JSON.stringify(errorData), 200));
  }
  return fingerprint;
}

/**
 * 检查是否为重复错误
 * @param {Object} errorData - 错误数据
 * @param {number} interval - 去重时间窗口（毫秒），默认 5000ms
 * @returns {boolean} 是否为重复错误
 */
function isDuplicate(errorData) {
  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_INTERVAL;
  var fingerprint = generateFingerprint(errorData);
  var now = Date.now();
  var lastReportTime = errorCache.get(fingerprint);

  // 如果是首次上报，或者已超过去重时间窗口
  if (!lastReportTime || now - lastReportTime > interval) {
    errorCache.set(fingerprint, now);
    return false;
  }
  return true;
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

    // 去重检查：相同控制台错误短时间内只上报一次
    if (!isDuplicate(errorData)) {
      lazyReportCache(errorData);
    }
  };

  // 捕获资源加载失败错误 js css img...
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

      // 去重检查：相同资源错误短时间内只上报一次
      if (!isDuplicate(errorData)) {
        lazyReportCache(errorData);
      }
    }
  }, true);

  // 监听 js 错误
  window.onerror = function (msg, url, line, column, error) {
    var errorData = {
      msg: msg,
      line: line,
      column: column,
      error: error === null || error === void 0 ? void 0 : error.stack,
      subType: 'js',
      pageURL: url,
      type: 'error',
      startTime: performance.now()
    };

    // 去重检查：相同JS错误短时间内只上报一次
    if (!isDuplicate(errorData)) {
      lazyReportCache(errorData);
    }
  };

  // 监听 promise 错误 缺点是获取不到列数据
  window.addEventListener('unhandledrejection', function (e) {
    var _e$reason;
    var errorData = {
      reason: (_e$reason = e.reason) === null || _e$reason === void 0 ? void 0 : _e$reason.stack,
      subType: 'promise',
      type: 'error',
      startTime: e.timeStamp,
      pageURL: getPageURL()
    };

    // 去重检查：相同Promise错误短时间内只上报一次
    if (!isDuplicate(errorData)) {
      lazyReportCache(errorData);
    }
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

      // 去重检查：相同Vue错误短时间内只上报一次
      if (!isDuplicate(errorData)) {
        lazyReportCache(errorData);
      }
    };
  }
  onBFCacheRestore(function () {
    error();
  });
}

function isSupportPerformanceObserver() {
  return !!window.PerformanceObserver;
}

function observeEntries() {
  executeAfterLoad(function () {
    observeEvent('resource'); //所有静态资源（图片、JS、CSS、字体…）
    observeEvent('navigation'); //页面导航事件
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
        // 整个页面加载的性能数据
        if (entryType === 'navigation') {
          // 递归终止条件：已经收集过一次了，就不重复收集了
          if (hasAlreadyCollected) return;
          if (observer) {
            observer.disconnect();
          }
          hasAlreadyCollected = true;
        }
        // nextHopProtocol 属性为空，说明资源解析错误或者跨域
        // beacon 用于上报数据，所以不统计。xhr fetch 单独统计
        if (!entry.nextHopProtocol && entryType !== 'navigation' || filter(entry.initiatorType)) {
          return;
        }
        lazyReportCache({
          name: entry.name,
          // 资源名称
          subType: entryType,
          type: 'performance',
          sourceType: entry.initiatorType,
          // 资源类型
          duration: entry.duration,
          // 资源加载耗时
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          // DNS 耗时
          tcp: entry.connectEnd - entry.connectStart,
          // 建立 tcp 连接耗时
          redirect: entry.redirectEnd - entry.redirectStart,
          // 重定向耗时
          ttfb: entry.responseStart,
          // 首字节时间
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
          startTime: performance.now()
        });
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
}

// 不统计以下类型的资源
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
}

function observePaint() {
  if (!isSupportPerformanceObserver()) return;
  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        //  只有监听到 FCP 才取消监听。
        // 如果只触发 FP，不会取消，继续监听，直到 FCP 出现。
        if (entry.name === 'first-contentful-paint') {
          observer.disconnect();
        }
        var json = entry.toJSON();
        delete json.duration;
        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          subType: entry.name,
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
    type: 'paint',
    buffered: true
  });

  //页面从 “后退 / 前进缓存” 回来时，FP/FCP 不会自动触发，所以我们要手动伪造上报
  onBFCacheRestore(function (event) {
    // 等浏览器下一帧真正渲染出来再执行（保证时间算得准）
    requestAnimationFrame(function () {
      ['first-paint', 'first-contentful-paint'].forEach(function (type) {
        lazyReportCache({
          // 当前时间 - 页面被缓存的时间= 页面恢复耗时
          startTime: performance.now() - event.timeStamp,
          name: type,
          subType: type,
          type: 'performance',
          pageURL: getPageURL(),
          // 上报一条伪造的 FP/ FCP 数据，并打上标记：我是从缓存恢复的！
          bfc: true
        });
      });
    });
  });
}

var lcpDone = false;
function isLCPDone() {
  return lcpDone;
}
function observeLCP() {
  if (!isSupportPerformanceObserver()) {
    lcpDone = true;
    return;
  }
  var observer = null;

  //list是PerformanceObserverList对象，包含了所有触发的PerformanceEntry对象，即一条条的LCP数据，是浏览器执行回调的时候传过来的
  var entryHandler = function entryHandler(list) {
    lcpDone = true;

    //只处理第一次的LCP，后续不处理
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

        /* entry 是一个 LargestContentfulPaint 实例
        {
            // 基础属性
            name: "largest-contentful-paint",
            entryType: "largest-contentful-paint",
            startTime: 245.8,  // 元素渲染完成的时间（毫秒）
            duration: 0,       // LCP 没有时长概念，始终为 0
            
            // LCP 特有属性
            size: 250000,      // 元素面积（宽×高，单位像素）
            renderTime: 245.8, // 渲染时间
            loadTime: 245.8,   // 加载时间
            
            // 触发元素
            element: <img src="hero.jpg" width="500" height="500">,
            
            // 元素尺寸
            width: 500,
            height: 500,
            
            // 其他
            id: "",
            url: ""
        }  */
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
  observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'largest-contentful-paint',
    buffered: true
  });

  // 如果是从BFCache恢复，需要手动触发LCP事件，因为BFCache中没有LCP事件（不会重新加载），需要手动触发一个
  onBFCacheRestore(function (event) {
    // requestAnimationFrame 是浏览器提供的 API，用于在下一次浏览器重绘之前执行指定的回调函数。
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

  // 当前会话窗口内累计的 CLS 分数
  var sessionValue = 0;
  // 存储当前会话内所有偏移的详细信息
  //{ startTime: 1200, value: 0.05, hadRecentInput: false, ... },
  var sessionEntries = [];
  // 全局最大 CLS 记录
  var cls = {
    subType: 'layout-shift',
    //子类型标识
    name: 'layout-shift',
    //指标名称
    type: 'performance',
    //数据类型
    pageURL: getPageURL(),
    //页面URL
    value: 0 //历史最大会话分数（初始0）
  };
  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;
        // 只有在 “用户最近没有操作” 时，才计算这次布局偏移。用户主动操作引发的页面变动，不算 CLS！
        if (!entry.hadRecentInput) {
          var firstSessionEntry = sessionEntries[0];
          var lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // 如果：
          // 1. 本次偏移 距离 上一次偏移 < 1秒
          // 并且
          // 2. 本次偏移 距离 会话第一次偏移 < 5秒
          // → 计入【当前会话】，累加分数
          // 否则 → 【新开一个会话】，重新计算
          if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(formatCLSEntry(entry));
          } else {
            sessionValue = entry.value;
            sessionEntries = [formatCLSEntry(entry)];
          }

          // 如果 当前会话累计的布局偏移分数 > 历史记录的最大CLS分数
          // 就更新最终CLS为这个更大的值，并保存这次会话的详细数据
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

  //当页面要隐藏 / 切换 tab / 最小化 / 关闭页面时，把 PerformanceObserver 还没来得及触发回调的性能数据一次性全部取出来，强行执行一遍处理逻辑，保证数据不丢失！
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
  // 如果是从BFCache恢复，需要手动触发FID事件，因为BFCache中没有FID事件（不会重新加载），需要手动触发一个
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

  // 如果浏览器不支持 PerformanceObserver，使用 polyfill 实现 FID
  fidPolyfill();
}
function fidPolyfill() {
  eachEventType(window.addEventListener);
}
function onInput(event) {
  // 只统计可取消的事件，这些事件会触发用户认为重要的行为
  if (event.cancelable) {
    // 旧浏览器（以及 Safari 11.1）中，event.timeStamp 返回的是绝对时间戳（DOMTimeStamp），类似 Date.now() 的值。而新浏览器返回的是相对时间戳（DOMHighResTimeStamp），即相对于页面启动的时间。为了区分这两种格式，注释提出了一个巧妙的判断方法。
    //绝对时间：event.timeStamp = 1678901234567（大于 1e12），就使用 Date.now()。
    //相对时间：event.timeStamp = 245.8，就使用高精度的 performance.now(),返回从页面加载开始到当前时刻的毫秒数
    var isEpochTime = event.timeStamp > 1e12;
    var now = isEpochTime ? Date.now() : performance.now();

    //处理时间-事件触发时间=输入延迟
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
    // 等 load、lcp 事件触发后并且 DOM 树不再变化时，计算首屏渲染时间
    //防抖 500ms
    // 页面渲染时 DOM 会连续频繁变化
    //500ms 无变化 → 判定首屏渲染完成
    if (isOnLoaded && isLCPDone()) {
      observer && observer.disconnect();
      lazyReportCache({
        type: 'performance',
        subType: 'first-screen-paint',
        startTime: getRenderTime(),
        pageURL: getPageURL()
      });
      entries = null;
    } else {
      checkDOMChange();
    }
  }, 500);
}
// 存储所有【有效DOM渲染】的时间和元素，终从这些记录里找出首屏最晚渲染时间
var entries = [];
function observeFirstScreenPaint() {
  // 浏览器不支持 MutationObserver 则退出（兼容老浏览器）
  // MutationObserver用于监听 DOM（文档对象模型）树的变化。
  if (!MutationObserver) return;

  // requestAnimationFrame会指示浏览器在下一次重绘之前执行指定的回调函数
  var next = window.requestAnimationFrame ? requestAnimationFrame : setTimeout;
  // 这些和首屏内容无关
  var ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK', 'META'];
  observer = new MutationObserver(function (mutationList) {
    checkDOMChange();
    var entry = {
      startTime: 0,
      children: []
    };
    next(function () {
      entry.startTime = performance.now();
    });
    var _iterator = _createForOfIteratorHelper(mutationList),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var mutation = _step.value;
        if (mutation.addedNodes.length) {
          for (var _i = 0, _Array$from = Array.from(mutation.addedNodes); _i < _Array$from.length; _i++) {
            var node = _Array$from[_i];
            if (node.nodeType === 1 //nodeType === 1 代表：元素节点（div /p/img /span ...）排除：文本节点、注释节点、属性节点...
            && !ignoreDOMList.includes(node.tagName) //过滤【和页面内容无关的标签】
            && !isInclude(node, entry.children) //如果这个元素 或 它的父元素 已经被记录过 → 就不再记录
            ) {
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

  //监听「整个页面」所有「元素的增加 / 删除」
  observer.observe(document, {
    childList: true,
    // 监听【子元素】的增加、删除
    subtree: true // 监听【所有后代元素】，包括深层嵌套的元素
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
  var startTime = 0;
  entries.forEach(function (entry) {
    var _iterator2 = _createForOfIteratorHelper(entry.children),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var node = _step2.value;
        // 1. 元素在首屏里,2. 这个元素渲染得更晚,3. 元素有效（不隐藏、不是小图）
        if (isInScreen(node) && entry.startTime > startTime && needToCalculate(node)) {
          startTime = entry.startTime;
          break; //同一个 entry 里的所有 node，渲染时间都是一样的
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  });

  //如果首屏里的元素（DOM 渲染时间）里面包裹着图片，而且图片加载比 DOM 晚，那就用图片加载完成的时间作为最终首屏时间
  // 需要和当前页面所有加载图片的时间做对比，取最大值
  //  图片开始下载时间 < DOM渲染时间 && 图片响应时间 > DOM渲染时间

  //浏览器给你的所有资源加载记录，包括图片、css、js、字体等
  performance.getEntriesByType('resource').forEach(function (item) {
    if (item.initiatorType === 'img' && item.fetchStart < startTime && item.responseEnd > startTime) {
      startTime = item.responseEnd;
    }
  });
  return startTime;
}
function needToCalculate(node) {
  // 隐藏的元素不用计算
  if (window.getComputedStyle(node).display === 'none') return false;

  // 用于统计的图片不用计算
  if (node.tagName === 'IMG' && node.width < 2 && node.height < 2) {
    return false;
  }
  return true;
}
//向上递归查爸爸 → 只要自己或祖先被记录过，就返回 true
function isInclude(node, arr) {
  // 递归终止条件1：没有节点了 / 查到根节点 html 了 → 没找到，返回 false
  if (!node || node === document.documentElement) {
    return false;
  }

  // 递归终止条件2：当前节点就在数组里 → 找到了，返回 true
  if (arr.includes(node)) {
    return true;
  }

  // 递归调用，继续向上查找
  return isInclude(node.parentElement, arr);
}
var viewportWidth = window.innerWidth;
var viewportHeight$1 = window.innerHeight;

// dom 对象是否在屏幕内
function isInScreen(dom) {
  var rectInfo = dom.getBoundingClientRect();
  if (rectInfo.left >= 0 && rectInfo.left < viewportWidth && rectInfo.top >= 0 && rectInfo.top < viewportHeight$1) {
    return true;
  }
}

// Web Vitals 评分阈值 (基于 Google 标准)
var THRESHOLDS = {
  LCP: {
    good: 2500,
    poor: 4000
  },
  FID: {
    good: 100,
    poor: 300
  },
  CLS: {
    good: 0.1,
    poor: 0.25
  }
};

// 指标权重 (Google 推荐)
var WEIGHTS = {
  LCP: 0.3,
  FID: 0.3,
  CLS: 0.4
};

// 存储各指标的最新值
var metrics = {
  LCP: null,
  FID: null,
  CLS: null
};

/**
 * 计算单个指标的分数 (0-100)
 * 使用分段线性插值
 * @param {number} value - 指标值
 * @param {Object} threshold - 阈值配置 { good, poor }
 * @returns {number} 分数 (0-100)
 */
function calculateMetricScore(value, threshold) {
  if (value <= threshold.good) {
    return 100;
  }
  if (value >= threshold.poor) {
    return 0;
  }
  // 线性插值: good=100分, poor=0分
  var score = 100 - (value - threshold.good) / (threshold.poor - threshold.good) * 100;
  return Math.round(score * 100) / 100;
}

/**
 * 计算综合性能分数
 * @returns {Object} 评分结果
 */
function calculatePerformanceScore() {
  var LCP = metrics.LCP,
    FID = metrics.FID,
    CLS = metrics.CLS;

  // 如果没有任何指标数据，返回 null
  if (LCP === null && FID === null && CLS === null) {
    return null;
  }
  var scores = {};
  var totalWeight = 0;
  var weightedSum = 0;

  // 计算各指标分数
  if (LCP !== null) {
    scores.LCP = calculateMetricScore(LCP, THRESHOLDS.LCP);
    weightedSum += scores.LCP * WEIGHTS.LCP;
    totalWeight += WEIGHTS.LCP;
  }
  if (FID !== null) {
    scores.FID = calculateMetricScore(FID, THRESHOLDS.FID);
    weightedSum += scores.FID * WEIGHTS.FID;
    totalWeight += WEIGHTS.FID;
  }
  if (CLS !== null) {
    scores.CLS = calculateMetricScore(CLS, THRESHOLDS.CLS);
    weightedSum += scores.CLS * WEIGHTS.CLS;
    totalWeight += WEIGHTS.CLS;
  }

  // 按实际有权重的比例计算综合分数
  var totalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight * 100) / 100 : 0;

  // 获取评级
  var rating = getRating(totalScore);
  return {
    totalScore: totalScore,
    rating: rating,
    scores: scores,
    metrics: {
      LCP: LCP,
      FID: FID,
      CLS: CLS
    },
    weights: WEIGHTS
  };
}

/**
 * 根据分数获取评级
 * @param {number} score - 综合分数 (0-100)
 * @returns {string} 评级: 'good' | 'needs-improvement' | 'poor'
 */
function getRating(score) {
  if (score >= 90) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}

/**
 * 更新指标值
 * @param {string} metricName - 指标名称 (LCP/FID/CLS)
 * @param {number} value - 指标值
 */
function updateMetric(metricName, value) {
  if (metricName in metrics) {
    metrics[metricName] = value;
  }
}

/**
 * 初始化性能评分监听
 * 监听 LCP/FID/CLS 事件并计算综合分数
 */
function observePerformanceScore() {

  // 使用 PerformanceObserver 监听 LCP
  if (window.PerformanceObserver) {
    try {
      // 监听 LCP
      var lcpObserver = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        var lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          updateMetric('LCP', lastEntry.startTime);
          reportScore();
        }
      });
      lcpObserver.observe({
        type: 'largest-contentful-paint',
        buffered: true
      });

      // 监听 FID
      var fidObserver = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        if (entries.length > 0) {
          updateMetric('FID', entries[0].duration);
          reportScore();
        }
      });
      fidObserver.observe({
        type: 'first-input',
        buffered: true
      });

      // 监听 CLS
      var clsValue = 0;
      var clsObserver = new PerformanceObserver(function (list) {
        var _iterator = _createForOfIteratorHelper(list.getEntries()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              updateMetric('CLS', clsValue);
              reportScore();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      });
      clsObserver.observe({
        type: 'layout-shift',
        buffered: true
      });
    } catch (e) {
      // 静默处理不支持的浏览器
    }
  }

  // 监听页面隐藏时上报最终分数
  var onHidden = function onHidden() {
    if (document.visibilityState === 'hidden') {
      reportScore(true);
    }
  };
  document.addEventListener('visibilitychange', onHidden, {
    once: true
  });

  // 监听页面卸载时上报
  window.addEventListener('beforeunload', function () {
    reportScore(true);
  }, {
    once: true
  });
}

/**
 * 上报性能分数
 * @param {boolean} isImmediate - 是否立即上报
 */
function reportScore() {
  var isImmediate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var scoreData = calculatePerformanceScore();
  if (scoreData) {
    var reportData = _objectSpread2(_objectSpread2({}, scoreData), {}, {
      subType: 'performance-score',
      name: 'performance-score',
      type: 'performance',
      pageURL: getPageURL()
    });
    if (isImmediate) {
      // 使用 report 直接上报
      var _require = require('../utils/report'),
        report = _require.report;
      report(reportData, true);
    } else {
      lazyReportCache(reportData);
    }
  }
}

function overwriteOpenAndSend() {
  originalProto.open = function newOpen() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    // 拦截 xhr.open()，把接口地址和请求方法记下来
    this.url = args[1];
    this.method = args[0];
    originalOpen.apply(this, args);
  };
  originalProto.send = function newSend() {
    var _this = this;
    // 发送请求时，立刻记下当前时间 → 后面算耗时用
    this.startTime = Date.now();
    var _onLoadend = function onLoadend() {
      // 请求完成后，自动计算接口耗时
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
      _this.removeEventListener('loadend', _onLoadend, true);
    };
    this.addEventListener('loadend', _onLoadend, true);
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

// 正常人眼、浏览器标准 60 帧 / 秒，一帧间隔就是约 16.67ms
// setTimeout 延迟 16.67ms 执行，模拟下一帧。
var next = window.requestAnimationFrame ? requestAnimationFrame : function (callback) {
  setTimeout(callback, 1000 / 60);
};

// 存储所有采集到的 FPS 数据
var frames = [];
function fps() {
  var frame = 0;
  var lastSecond = Date.now();
  function calculateFPS() {
    frame++;
    var now = Date.now();
    // 距离上一次算 FPS 已经满 1 秒了，就计算一下
    if (lastSecond + 1000 <= now) {
      // 由于 now - lastSecond 的单位是毫秒，所以 frame 要 * 1000
      var _fps = Math.round(frame * 1000 / (now - lastSecond));
      frames.push(_fps);
      frame = 0;
      lastSecond = now;
    }

    // 避免上报太快，缓存一定数量再上报
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

// 监控 Vue 项目中，从「路由跳转」到「页面完全渲染出来」花了多长时间，然后上报性能数据。
function onVueRouter$1(Vue, router) {
  var isFirst = true;
  var startTime;
  router.beforeEach(function (to, from, next) {
    // 首次进入页面不算路由切换，属于页面首次加载,已经有其他统计的渲染时间可用
    if (isFirst) {
      isFirst = false;
      return next(); //直接放行
    }

    // 给 router 新增一个字段，表示是否要计算渲染时间
    // 只有路由跳转才需要计算
    // 后面页面组件渲染完成时，才知道这次渲染是路由切换导致的，才会去上报耗时。
    router.needCalculateRenderTime = true;
    startTime = performance.now();
    next();
  });
  var timer;
  // 给所有 Vue 组件全局加一个生命周期，当组件挂载完成时，检查是否需要计算渲染时间
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
  observePerformanceScore();
  if ((_config$vue = config.vue) !== null && _config$vue !== void 0 && _config$vue.Vue && (_config$vue2 = config.vue) !== null && _config$vue2 !== void 0 && _config$vue2.router) {
    onVueRouter$1(config.vue.Vue, config.vue.router);
  }
}

var uuid = '';
function getUUID() {
  if (uuid) return uuid;

  // 如果是手机 APP，可以调用原生方法或者设备唯一标识当成 uuid
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

var startTime$1 = 0; // 页面激活时的起始时间戳
var activeDuration = 0; // 累计活跃时长（ms）
var isActive = true; // 当前页面是否处于前台激活状态

function pageAccessDuration() {
  // 页面加载完成后开始计时
  startTime$1 = performance.now();
  activeDuration = 0;
  isActive = true;

  // 监听 visibilitychange：页面切到后台时暂停计时，回到前台时恢复
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      // 页面进入后台：累加当前这段活跃时长
      if (isActive) {
        activeDuration += performance.now() - startTime$1;
        isActive = false;
      }
    } else {
      // 页面回到前台：重新开始计时
      startTime$1 = performance.now();
      isActive = true;
    }
  }, true);

  // 页面离开时上报最终的活跃停留时长
  onBeforeunload(function () {
    if (isActive) {
      activeDuration += performance.now() - startTime$1;
      isActive = false;
    }
    report({
      type: 'behavior',
      subType: 'page-access-duration',
      duration: Math.round(activeDuration),
      pageURL: getPageURL(),
      uuid: getUUID()
    }, true);
  });

  // 页面隐藏时（切换标签页 / 最小化）也上报一次当前累计活跃时长
  onHidden(function () {
    if (isActive) {
      activeDuration += performance.now() - startTime$1;
      isActive = false;
    }

    // 仅当有有效停留时长时才上报
    if (activeDuration > 0) {
      lazyReportCache({
        type: 'behavior',
        subType: 'page-access-duration',
        duration: Math.round(activeDuration),
        pageURL: getPageURL(),
        uuid: getUUID()
      });
    }
  });
}

var timer; // 滚动防抖定时器
var startTime = 0; // 开始记录时间
var hasReport = false; // 是否已经上报过一次
var pageHeight = 0; // 页面总高度
var scrollTop = 0; // 滚动了多少
var viewportHeight = 0; // 屏幕可视高度

// 记录页面级别的最大滚动深度
var maxScrollDepth = 0;
function pageAccessHeight() {
  // 使用捕获阶段监听 scroll 事件，这样既能捕获 window 的滚动，
  // 也能捕获子元素（如 div 滚动容器）的滚动事件
  window.addEventListener('scroll', onScroll, true);

  // 页面离开时：上报最终阅读高度
  onBeforeunload(function () {
    var now = performance.now();
    updateScrollMetrics();
    report({
      startTime: now,
      duration: now - startTime,
      type: 'behavior',
      subType: 'page-access-height',
      pageURL: getPageURL(),
      scrollDepth: Math.round(Math.min(maxScrollDepth, 1) * 100),
      maxScrollDepth: Math.round(Math.min(maxScrollDepth, 1) * 100),
      value: toPercent(maxScrollDepth),
      uuid: getUUID()
    }, true);
  });

  // 页面加载完成后初始化记录当前访问高度、时间
  executeAfterLoad(function () {
    startTime = performance.now();
    updateScrollMetrics();
    maxScrollDepth = (scrollTop + viewportHeight) / pageHeight;
  });
}
function onScroll(e) {
  clearTimeout(timer);
  var now = performance.now();

  // 更新滚动指标
  updateScrollMetrics();

  // 计算当前滚动深度比例
  var currentDepth = pageHeight > 0 ? (scrollTop + viewportHeight) / pageHeight : 0;

  // 更新最大滚动深度
  if (currentDepth > maxScrollDepth) {
    maxScrollDepth = currentDepth;
  }
  if (!hasReport) {
    hasReport = true;
    lazyReportCache({
      startTime: now,
      duration: now - startTime,
      type: 'behavior',
      subType: 'page-access-height',
      pageURL: getPageURL(),
      scrollDepth: Math.round(Math.min(currentDepth, 1) * 100),
      maxScrollDepth: Math.round(Math.min(maxScrollDepth, 1) * 100),
      value: toPercent(currentDepth),
      uuid: getUUID()
    });
  }
  timer = setTimeout(function () {
    hasReport = false;
    startTime = now;
    updateScrollMetrics();
  }, 500);
}
function updateScrollMetrics() {
  pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  viewportHeight = window.innerHeight;
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

var monitor = {
  init: function init() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    setConfig(options);
    error();
    performance$1();
    behavior();

    // 当页面进入后台或关闭前时，将所有的 cache 数据进行上报
    [onBeforeunload, onHidden].forEach(function (fn) {
      fn(function () {
        var data = getCache();
        if (data.length) {
          report(data, true);
          clearCache();
        }
      });
    });
  },
  report: report
};

export { monitor as default };
//# sourceMappingURL=monitor.esm.js.map
