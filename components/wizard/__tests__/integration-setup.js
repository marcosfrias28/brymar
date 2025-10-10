/**
 * Integration Test Setup
 * 
 * This file sets up the test environment specifically for integration tests
 * of the Universal Wizard System. It includes mocks, utilities, and
 * configuration needed for comprehensive testing.
 */

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        pathname: '/test',
        query: {},
        asPath: '/test',
        route: '/test',
        events: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        },
    }),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    usePathname: () => '/test',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, ...props }) {
        return <img src={src} alt={alt} {...props} />;
    };
});

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        form: ({ children, ...props }) => <form {...props}>{children}</form>,
        input: ({ children, ...props }) => <input {...props}>{children}</input>,
        textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>,
        select: ({ children, ...props }) => <select {...props}>{children}</select>,
        img: ({ children, ...props }) => <img {...props}>{children}</img>,
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
        start: jest.fn(),
        stop: jest.fn(),
        set: jest.fn(),
    }),
    useMotionValue: (initial) => ({
        get: () => initial,
        set: jest.fn(),
        on: jest.fn(),
    }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
    }

    observe() {
        // Immediately trigger callback for testing
        this.callback([
            {
                isIntersecting: true,
                target: document.createElement('div'),
                intersectionRatio: 1,
                boundingClientRect: { top: 0, left: 0, bottom: 100, right: 100 },
                intersectionRect: { top: 0, left: 0, bottom: 100, right: 100 },
                rootBounds: { top: 0, left: 0, bottom: 1000, right: 1000 },
                time: Date.now(),
            },
        ]);
    }

    unobserve() { }
    disconnect() { }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }

    observe() {
        // Immediately trigger callback for testing
        this.callback([
            {
                target: document.createElement('div'),
                contentRect: { width: 1024, height: 768 },
                borderBoxSize: [{ inlineSize: 1024, blockSize: 768 }],
                contentBoxSize: [{ inlineSize: 1024, blockSize: 768 }],
                devicePixelContentBoxSize: [{ inlineSize: 1024, blockSize: 768 }],
            },
        ]);
    }

    unobserve() { }
    disconnect() { }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 1024,
    height: 768,
    top: 0,
    left: 0,
    bottom: 768,
    right: 1024,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue(''),
    },
});

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
    value: {
        getCurrentPosition: jest.fn().mockImplementation((success) => {
            success({
                coords: {
                    latitude: 18.4861,
                    longitude: -69.9312,
                    accuracy: 10,
                    altitude: null,
                    altitudeAccuracy: null,
                    heading: null,
                    speed: null,
                },
                timestamp: Date.now(),
            });
        }),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
    },
});

// Mock File and FileReader
global.File = class File {
    constructor(chunks, filename, options = {}) {
        this.chunks = chunks;
        this.name = filename;
        this.size = options.size || chunks.join('').length;
        this.type = options.type || 'text/plain';
        this.lastModified = options.lastModified || Date.now();
    }

    text() {
        return Promise.resolve(this.chunks.join(''));
    }

    arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(this.size));
    }

    stream() {
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(this.chunks.join('')));
                controller.close();
            },
        });
    }
};

global.FileReader = class FileReader {
    constructor() {
        this.readyState = 0;
        this.result = null;
        this.error = null;
        this.onload = null;
        this.onerror = null;
        this.onabort = null;
        this.onloadstart = null;
        this.onloadend = null;
        this.onprogress = null;
    }

    readAsDataURL(file) {
        setTimeout(() => {
            this.readyState = 2;
            this.result = `data:${file.type};base64,${btoa(file.chunks.join(''))}`;
            if (this.onload) this.onload({ target: this });
            if (this.onloadend) this.onloadend({ target: this });
        }, 10);
    }

    readAsText(file) {
        setTimeout(() => {
            this.readyState = 2;
            this.result = file.chunks.join('');
            if (this.onload) this.onload({ target: this });
            if (this.onloadend) this.onloadend({ target: this });
        }, 10);
    }

    abort() {
        this.readyState = 2;
        if (this.onabort) this.onabort({ target: this });
    }
};

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch with network simulation capabilities
const originalFetch = global.fetch;

global.fetch = jest.fn().mockImplementation(async (url, options = {}) => {
    // Simulate network conditions if specified
    const networkCondition = global.TEST_NETWORK_CONDITION;

    if (networkCondition === 'offline') {
        throw new Error('Network request failed');
    }

    if (networkCondition === 'slow') {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (networkCondition === 'timeout') {
        await new Promise(resolve => setTimeout(resolve, 10000));
        throw new Error('Request timeout');
    }

    // Default mock response
    return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ success: true }),
        text: () => Promise.resolve('OK'),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    });
});

// Mock localStorage with quota simulation
const localStorageMock = (() => {
    let store = {};
    const quota = 5 * 1024 * 1024; // 5MB quota
    let used = 0;

    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            const size = new Blob([value]).size;
            if (used + size > quota) {
                throw new Error('QuotaExceededError');
            }
            const oldSize = store[key] ? new Blob([store[key]]).size : 0;
            used = used - oldSize + size;
            store[key] = value;
        }),
        removeItem: jest.fn((key) => {
            if (store[key]) {
                used -= new Blob([store[key]]).size;
                delete store[key];
            }
        }),
        clear: jest.fn(() => {
            store = {};
            used = 0;
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn((index) => Object.keys(store)[index] || null),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: {
        ...localStorageMock,
        // Session storage has same interface as localStorage
    },
});

// Mock IndexedDB
const indexedDBMock = {
    open: jest.fn().mockResolvedValue({
        transaction: jest.fn().mockReturnValue({
            objectStore: jest.fn().mockReturnValue({
                add: jest.fn().mockResolvedValue(undefined),
                get: jest.fn().mockResolvedValue({ data: {} }),
                put: jest.fn().mockResolvedValue(undefined),
                delete: jest.fn().mockResolvedValue(undefined),
                getAll: jest.fn().mockResolvedValue([]),
                clear: jest.fn().mockResolvedValue(undefined),
                createIndex: jest.fn(),
                index: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(undefined),
                    getAll: jest.fn().mockResolvedValue([]),
                }),
            }),
        }),
        createObjectStore: jest.fn(),
        deleteObjectStore: jest.fn(),
        close: jest.fn(),
    }),
    deleteDatabase: jest.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'indexedDB', {
    value: indexedDBMock,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
    value: {
        ...window.performance,
        memory: {
            usedJSHeapSize: 10 * 1024 * 1024, // 10MB
            totalJSHeapSize: 20 * 1024 * 1024, // 20MB
            jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
        },
        mark: jest.fn(),
        measure: jest.fn(),
        getEntriesByName: jest.fn().mockReturnValue([]),
        getEntriesByType: jest.fn().mockReturnValue([]),
        clearMarks: jest.fn(),
        clearMeasures: jest.fn(),
    },
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

console.error = jest.fn((message, ...args) => {
    // Filter out known React warnings that are not relevant to our tests
    if (
        typeof message === 'string' &&
        (message.includes('Warning:') ||
            message.includes('React does not recognize') ||
            message.includes('validateDOMNesting') ||
            message.includes('componentWillReceiveProps'))
    ) {
        return;
    }
    originalConsole.error(message, ...args);
});

console.warn = jest.fn((message, ...args) => {
    // Filter out known warnings
    if (
        typeof message === 'string' &&
        (message.includes('componentWillReceiveProps') ||
            message.includes('deprecated'))
    ) {
        return;
    }
    originalConsole.warn(message, ...args);
});

// Global test utilities
global.testUtils = {
    // Network simulation
    simulateNetworkCondition: (condition) => {
        global.TEST_NETWORK_CONDITION = condition;
    },

    resetNetworkCondition: () => {
        delete global.TEST_NETWORK_CONDITION;
    },

    // Performance measurement
    measurePerformance: async (fn) => {
        const start = performance.now();
        await fn();
        const end = performance.now();
        return end - start;
    },

    // Memory measurement
    measureMemory: () => {
        if (window.performance.memory) {
            return window.performance.memory.usedJSHeapSize;
        }
        return 0;
    },

    // Viewport simulation
    setViewport: (width, height) => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: height,
        });

        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
    },

    // Touch event simulation
    createTouchEvent: (type, touches) => {
        const touchEvent = new Event(type, { bubbles: true });
        Object.defineProperty(touchEvent, 'touches', {
            value: touches.map((touch, index) => ({
                ...touch,
                identifier: index,
                target: document.body,
                radiusX: 1,
                radiusY: 1,
                rotationAngle: 0,
                force: 1,
                pageX: touch.clientX,
                pageY: touch.clientY,
                screenX: touch.clientX,
                screenY: touch.clientY,
            })),
            writable: false,
        });
        return touchEvent;
    },

    // Cleanup utilities
    cleanup: () => {
        // Clear all mocks
        jest.clearAllMocks();

        // Reset DOM
        document.body.innerHTML = '';

        // Clear storage
        localStorage.clear();
        sessionStorage.clear();

        // Reset network condition
        global.testUtils.resetNetworkCondition();

        // Reset viewport
        global.testUtils.setViewport(1024, 768);

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
    },
};

// Setup global error handling for tests
const originalError = global.console.error;
global.console.error = (...args) => {
    // Capture errors for test analysis
    if (global.TEST_ERRORS) {
        global.TEST_ERRORS.push(args.join(' '));
    }

    // Call original error handler
    originalError(...args);
};

// Initialize test error collection
global.TEST_ERRORS = [];

// Cleanup after each test
afterEach(() => {
    global.testUtils.cleanup();
    global.TEST_ERRORS = [];
});

// Global test timeout
jest.setTimeout(60000);

// Suppress specific warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
    const message = args[0];

    // Suppress known warnings that don't affect functionality
    if (
        typeof message === 'string' &&
        (message.includes('React Hook useEffect has missing dependencies') ||
            message.includes('Can\'t perform a React state update on an unmounted component'))
    ) {
        return;
    }

    originalWarn(...args);
};

console.log('🧪 Integration test environment initialized');
console.log('📊 Performance monitoring enabled');
console.log('🌐 Network simulation available');
console.log('📱 Mobile device simulation ready');
console.log('💾 Storage mocking configured');
console.log('🎯 Test utilities loaded');