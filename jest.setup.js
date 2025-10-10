import '@testing-library/jest-dom'
import React from 'react'

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const MockIcon = (props) => {
    const { className, ...rest } = props || {};
    return React.createElement('svg', {
      className,
      ...rest,
      'data-testid': 'mock-icon'
    });
  };

  return {
    Search: MockIcon,
    BarChartIcon: MockIcon,
    BuildingIcon: MockIcon,
    FileTextIcon: MockIcon,
    HelpCircleIcon: MockIcon,
    LayoutDashboardIcon: MockIcon,
    MapPinIcon: MockIcon,
    SearchIcon: MockIcon,
    SettingsIcon: MockIcon,
    UsersIcon: MockIcon,
    TrendingUpIcon: MockIcon,
    ShieldIcon: MockIcon,
    DatabaseIcon: MockIcon,
    PlusIcon: MockIcon,
    EditIcon: MockIcon,
    FolderIcon: MockIcon,
    LayersIcon: MockIcon,
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Global test utilities
global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }

  append(key, value) {
    this.data.set(key, value)
  }

  get(key) {
    return this.data.get(key) || null
  }

  has(key) {
    return this.data.has(key)
  }

  entries() {
    return this.data.entries()
  }
}

// Add TextDecoder and TextEncoder for Node.js compatibility
const { TextDecoder, TextEncoder } = require('util')
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})