// Mock PerformanceObserver
global.PerformanceObserver = class {
    observe() {}
    disconnect() {}
    takeRecords() { return [] }
}

// Mock requestIdleCallback
global.requestIdleCallback = (cb) => setTimeout(cb, 0)

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 16)

// Mock sendBeacon
global.navigator.sendBeacon = jest.fn()

// Mock XMLHttpRequest with EventTarget methods
global.XMLHttpRequest = class {
    constructor() {
        this._listeners = {}
    }
    open() {}
    send() {}
    addEventListener(type, listener, options) {
        if (!this._listeners[type]) this._listeners[type] = []
        this._listeners[type].push(listener)
    }
    removeEventListener(type, listener) {
        if (this._listeners[type]) {
            this._listeners[type] = this._listeners[type].filter(l => l !== listener)
        }
    }
    dispatchEvent(event) {
        const listeners = this._listeners[event.type] || []
        listeners.forEach(listener => listener(event))
    }
}

// Mock MutationObserver
global.MutationObserver = class {
    constructor(callback) {
        this.callback = callback
    }
    observe() {}
    disconnect() {}
    takeRecords() { return [] }
}

// Mock getComputedStyle
global.getComputedStyle = jest.fn(() => ({
    display: 'block',
}))

// Mock localStorage
const localStorageMock = (() => {
    let store = {}
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = String(value) }),
        removeItem: jest.fn(key => { delete store[key] }),
        clear: jest.fn(() => { store = {} }),
        get length() { return Object.keys(store).length },
        key: jest.fn(index => Object.keys(store)[index] || null),
    }
})()
global.localStorage = localStorageMock

// Mock performance.now
if (!global.performance) {
    global.performance = {}
}
if (!global.performance.now) {
    global.performance.now = jest.fn(() => Date.now())
}
if (!global.performance.getEntriesByType) {
    global.performance.getEntriesByType = jest.fn(() => [])
}

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })

// Mock document.referrer
Object.defineProperty(document, 'referrer', { value: '', writable: true })
