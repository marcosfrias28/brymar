import '@testing-library/jest-dom'
import React from 'react'

// Mock performance API for performance tests
global.performance = global.performance || {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

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
})

// Mock Leaflet for map tests
jest.mock('leaflet', () => ({
    map: jest.fn(() => ({
        setView: jest.fn(),
        addLayer: jest.fn(),
        removeLayer: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        remove: jest.fn(),
    })),
    tileLayer: jest.fn(() => ({
        addTo: jest.fn(),
    })),
    marker: jest.fn(() => ({
        addTo: jest.fn(),
        bindPopup: jest.fn(),
        setLatLng: jest.fn(),
    })),
    icon: jest.fn(),
    divIcon: jest.fn(),
}))

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
    MapContainer: ({ children, ...props }) => (
        React.createElement('div', {
            'data-testid': 'map-container',
            ...props
        }, children)
    ),
    TileLayer: () => React.createElement('div', { 'data-testid': 'tile-layer' }),
    Marker: ({ position, ...props }) => (
        React.createElement('div', {
            'data-testid': 'marker',
            'data-position': JSON.stringify(position),
            ...props
        })
    ),
    Popup: ({ children }) => React.createElement('div', { 'data-testid': 'popup' }, children),
    useMapEvents: () => null,
}))

// Mock Vercel Blob for upload tests
jest.mock('@vercel/blob', () => ({
    put: jest.fn(),
    del: jest.fn(),
    head: jest.fn(),
    list: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, ...props }) {
        return React.createElement('img', { src, alt, ...props })
    }
})

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href, ...props }) {
        return React.createElement('a', { href, ...props }, children)
    }
})

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => React.createElement('div', props, children),
        button: ({ children, ...props }) => React.createElement('button', props, children),
        form: ({ children, ...props }) => React.createElement('form', props, children),
        img: ({ children, ...props }) => React.createElement('img', props, children),
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
        start: jest.fn(),
        stop: jest.fn(),
        set: jest.fn(),
    }),
}))

// Mock Radix UI components
jest.mock('@radix-ui/react-dialog', () => ({
    Root: ({ children }) => children,
    Trigger: ({ children, ...props }) => React.createElement('button', props, children),
    Portal: ({ children }) => children,
    Overlay: ({ children, ...props }) => React.createElement('div', props, children),
    Content: ({ children, ...props }) => React.createElement('div', { role: 'dialog', ...props }, children),
    Title: ({ children, ...props }) => React.createElement('h2', props, children),
    Description: ({ children, ...props }) => React.createElement('p', props, children),
    Close: ({ children, ...props }) => React.createElement('button', props, children),
}))

// Mock toast notifications
jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
        loading: jest.fn(),
        dismiss: jest.fn(),
    },
    Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
}))

// Mock i18n
jest.mock('next-intl', () => ({
    useTranslations: () => (key) => key,
    useLocale: () => 'es',
}))

// Global test utilities
global.createMockFile = (name, size = 1024, type = 'image/jpeg') => {
    const file = new File(['x'.repeat(size)], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
}

global.createMockFormData = (data = {}) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
    })
    return formData
}

// Mock console methods for cleaner test output
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning:') ||
                args[0].includes('React does not recognize') ||
                args[0].includes('validateDOMNesting'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }

    console.warn = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('componentWillReceiveProps')
        ) {
            return
        }
        originalWarn.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
    console.warn = originalWarn
})

// Cleanup after each test
afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Clean up DOM
    document.body.innerHTML = ''

    // Reset any global state
    if (global.gc) {
        global.gc()
    }
})