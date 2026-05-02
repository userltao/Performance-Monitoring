// Mock PerformanceObserver
global.PerformanceObserver = class {
    observe() {}
    disconnect() {}
}

// Mock requestIdleCallback
global.requestIdleCallback = (cb) => setTimeout(cb, 0)

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 16)

// Mock sendBeacon
global.navigator.sendBeacon = jest.fn()

// Mock XMLHttpRequest
global.XMLHttpRequest = class {
    open() {}
    send() {}
    addEventListener() {}
}
