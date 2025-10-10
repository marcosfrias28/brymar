/**
 * Integration Test Polyfills
 * 
 * This file provides polyfills and mocks for browser APIs that are not
 * available in the Jest test environment but are needed for comprehensive
 * integration testing of the Universal Wizard System.
 */

// Polyfill for TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = class TextEncoder {
        encode(input = '') {
            const bytes = new Uint8Array(input.length);
            for (let i = 0; i < input.length; i++) {
                bytes[i] = input.charCodeAt(i);
            }
            return bytes;
        }
    };
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = class TextDecoder {
        decode(input) {
            return String.fromCharCode(...input);
        }
    };
}

// Polyfill for ReadableStream
if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = class ReadableStream {
        constructor(underlyingSource = {}) {
            this.underlyingSource = underlyingSource;
            this.locked = false;
            this.state = 'readable';
        }

        getReader() {
            if (this.locked) {
                throw new TypeError('ReadableStream is locked');
            }
            this.locked = true;

            return {
                read: () => {
                    if (this.underlyingSource.start) {
                        const controller = {
                            enqueue: (chunk) => ({ value: chunk, done: false }),
                            close: () => ({ value: undefined, done: true }),
                            error: (error) => Promise.reject(error),
                        };
                        return Promise.resolve(this.underlyingSource.start(controller));
                    }
                    return Promise.resolve({ value: undefined, done: true });
                },
                releaseLock: () => {
                    this.locked = false;
                },
                cancel: () => Promise.resolve(),
            };
        }

        cancel() {
            return Promise.resolve();
        }
    };
}

// Polyfill for WritableStream
if (typeof global.WritableStream === 'undefined') {
    global.WritableStream = class WritableStream {
        constructor(underlyingSink = {}) {
            this.underlyingSink = underlyingSink;
            this.locked = false;
        }

        getWriter() {
            if (this.locked) {
                throw new TypeError('WritableStream is locked');
            }
            this.locked = true;

            return {
                write: (chunk) => {
                    if (this.underlyingSink.write) {
                        return Promise.resolve(this.underlyingSink.write(chunk));
                    }
                    return Promise.resolve();
                },
                close: () => {
                    if (this.underlyingSink.close) {
                        return Promise.resolve(this.underlyingSink.close());
                    }
                    return Promise.resolve();
                },
                abort: (reason) => {
                    if (this.underlyingSink.abort) {
                        return Promise.resolve(this.underlyingSink.abort(reason));
                    }
                    return Promise.resolve();
                },
                releaseLock: () => {
                    this.locked = false;
                },
            };
        }
    };
}

// Polyfill for Blob
if (typeof global.Blob === 'undefined') {
    global.Blob = class Blob {
        constructor(parts = [], options = {}) {
            this.parts = parts;
            this.type = options.type || '';
            this.size = parts.reduce((size, part) => {
                if (typeof part === 'string') {
                    return size + part.length;
                }
                if (part instanceof ArrayBuffer) {
                    return size + part.byteLength;
                }
                if (part && typeof part.size === 'number') {
                    return size + part.size;
                }
                return size;
            }, 0);
        }

        slice(start = 0, end = this.size, contentType = '') {
            const slicedParts = this.parts.slice(start, end);
            return new Blob(slicedParts, { type: contentType });
        }

        text() {
            return Promise.resolve(this.parts.join(''));
        }

        arrayBuffer() {
            const buffer = new ArrayBuffer(this.size);
            const view = new Uint8Array(buffer);
            let offset = 0;

            for (const part of this.parts) {
                if (typeof part === 'string') {
                    for (let i = 0; i < part.length; i++) {
                        view[offset + i] = part.charCodeAt(i);
                    }
                    offset += part.length;
                }
            }

            return Promise.resolve(buffer);
        }

        stream() {
            return new ReadableStream({
                start(controller) {
                    for (const part of this.parts) {
                        controller.enqueue(new TextEncoder().encode(part));
                    }
                    controller.close();
                },
            });
        }
    };
}

// Polyfill for FormData
if (typeof global.FormData === 'undefined') {
    global.FormData = class FormData {
        constructor() {
            this.data = new Map();
        }

        append(name, value, filename) {
            if (!this.data.has(name)) {
                this.data.set(name, []);
            }
            this.data.get(name).push({ value, filename });
        }

        delete(name) {
            this.data.delete(name);
        }

        get(name) {
            const values = this.data.get(name);
            return values ? values[0].value : null;
        }

        getAll(name) {
            const values = this.data.get(name);
            return values ? values.map(item => item.value) : [];
        }

        has(name) {
            return this.data.has(name);
        }

        set(name, value, filename) {
            this.data.set(name, [{ value, filename }]);
        }

        entries() {
            const entries = [];
            for (const [name, values] of this.data) {
                for (const { value } of values) {
                    entries.push([name, value]);
                }
            }
            return entries[Symbol.iterator]();
        }

        keys() {
            return this.data.keys();
        }

        values() {
            const values = [];
            for (const [, valueArray] of this.data) {
                for (const { value } of valueArray) {
                    values.push(value);
                }
            }
            return values[Symbol.iterator]();
        }

        [Symbol.iterator]() {
            return this.entries();
        }
    };
}

// Polyfill for Headers
if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers {
        constructor(init = {}) {
            this.map = new Map();

            if (init) {
                if (init instanceof Headers) {
                    for (const [name, value] of init.entries()) {
                        this.append(name, value);
                    }
                } else if (Array.isArray(init)) {
                    for (const [name, value] of init) {
                        this.append(name, value);
                    }
                } else {
                    for (const [name, value] of Object.entries(init)) {
                        this.append(name, value);
                    }
                }
            }
        }

        append(name, value) {
            const normalizedName = name.toLowerCase();
            const existing = this.map.get(normalizedName);
            this.map.set(normalizedName, existing ? `${existing}, ${value}` : value);
        }

        delete(name) {
            this.map.delete(name.toLowerCase());
        }

        get(name) {
            return this.map.get(name.toLowerCase()) || null;
        }

        has(name) {
            return this.map.has(name.toLowerCase());
        }

        set(name, value) {
            this.map.set(name.toLowerCase(), value);
        }

        entries() {
            return this.map.entries();
        }

        keys() {
            return this.map.keys();
        }

        values() {
            return this.map.values();
        }

        [Symbol.iterator]() {
            return this.entries();
        }
    };
}

// Polyfill for Request
if (typeof global.Request === 'undefined') {
    global.Request = class Request {
        constructor(input, init = {}) {
            this.url = typeof input === 'string' ? input : input.url;
            this.method = init.method || 'GET';
            this.headers = new Headers(init.headers);
            this.body = init.body || null;
            this.mode = init.mode || 'cors';
            this.credentials = init.credentials || 'same-origin';
            this.cache = init.cache || 'default';
            this.redirect = init.redirect || 'follow';
            this.referrer = init.referrer || '';
            this.integrity = init.integrity || '';
        }

        clone() {
            return new Request(this.url, {
                method: this.method,
                headers: this.headers,
                body: this.body,
                mode: this.mode,
                credentials: this.credentials,
                cache: this.cache,
                redirect: this.redirect,
                referrer: this.referrer,
                integrity: this.integrity,
            });
        }

        text() {
            return Promise.resolve(this.body || '');
        }

        json() {
            return this.text().then(text => JSON.parse(text));
        }

        blob() {
            return Promise.resolve(new Blob([this.body || '']));
        }

        arrayBuffer() {
            return Promise.resolve(new ArrayBuffer(0));
        }

        formData() {
            return Promise.resolve(new FormData());
        }
    };
}

// Polyfill for Response
if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        constructor(body = null, init = {}) {
            this.body = body;
            this.status = init.status || 200;
            this.statusText = init.statusText || 'OK';
            this.headers = new Headers(init.headers);
            this.ok = this.status >= 200 && this.status < 300;
            this.redirected = false;
            this.type = 'default';
            this.url = '';
        }

        clone() {
            return new Response(this.body, {
                status: this.status,
                statusText: this.statusText,
                headers: this.headers,
            });
        }

        text() {
            return Promise.resolve(this.body ? String(this.body) : '');
        }

        json() {
            return this.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch {
                    return {};
                }
            });
        }

        blob() {
            return Promise.resolve(new Blob([this.body || '']));
        }

        arrayBuffer() {
            return Promise.resolve(new ArrayBuffer(0));
        }

        formData() {
            return Promise.resolve(new FormData());
        }

        static error() {
            const response = new Response(null, { status: 0, statusText: '' });
            response.ok = false;
            response.type = 'error';
            return response;
        }

        static redirect(url, status = 302) {
            const response = new Response(null, { status, statusText: 'Redirect' });
            response.headers.set('Location', url);
            response.redirected = true;
            return response;
        }
    };
}

// Polyfill for AbortController
if (typeof global.AbortController === 'undefined') {
    global.AbortController = class AbortController {
        constructor() {
            this.signal = {
                aborted: false,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
                onabort: null,
            };
        }

        abort() {
            this.signal.aborted = true;
            if (this.signal.onabort) {
                this.signal.onabort();
            }
        }
    };

    global.AbortSignal = class AbortSignal {
        constructor() {
            this.aborted = false;
            this.addEventListener = jest.fn();
            this.removeEventListener = jest.fn();
            this.dispatchEvent = jest.fn();
            this.onabort = null;
        }

        static abort() {
            const signal = new AbortSignal();
            signal.aborted = true;
            return signal;
        }
    };
}

// Polyfill for CustomEvent
if (typeof global.CustomEvent === 'undefined') {
    global.CustomEvent = class CustomEvent extends Event {
        constructor(type, options = {}) {
            super(type, options);
            this.detail = options.detail || null;
        }
    };
}

// Polyfill for DOMRect
if (typeof global.DOMRect === 'undefined') {
    global.DOMRect = class DOMRect {
        constructor(x = 0, y = 0, width = 0, height = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.top = y;
            this.right = x + width;
            this.bottom = y + height;
            this.left = x;
        }

        static fromRect(other) {
            return new DOMRect(other.x, other.y, other.width, other.height);
        }

        toJSON() {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                top: this.top,
                right: this.right,
                bottom: this.bottom,
                left: this.left,
            };
        }
    };
}

// Polyfill for MutationObserver
if (typeof global.MutationObserver === 'undefined') {
    global.MutationObserver = class MutationObserver {
        constructor(callback) {
            this.callback = callback;
            this.observations = [];
        }

        observe(target, options) {
            this.observations.push({ target, options });
            // Immediately trigger callback for testing
            setTimeout(() => {
                this.callback([
                    {
                        type: 'childList',
                        target,
                        addedNodes: [],
                        removedNodes: [],
                        previousSibling: null,
                        nextSibling: null,
                        attributeName: null,
                        attributeNamespace: null,
                        oldValue: null,
                    },
                ]);
            }, 0);
        }

        disconnect() {
            this.observations = [];
        }

        takeRecords() {
            return [];
        }
    };
}

// Polyfill for PerformanceObserver
if (typeof global.PerformanceObserver === 'undefined') {
    global.PerformanceObserver = class PerformanceObserver {
        constructor(callback) {
            this.callback = callback;
        }

        observe(options) {
            // Mock implementation for testing
            setTimeout(() => {
                this.callback({
                    getEntries: () => [],
                    getEntriesByName: () => [],
                    getEntriesByType: () => [],
                });
            }, 0);
        }

        disconnect() { }

        takeRecords() {
            return [];
        }

        static get supportedEntryTypes() {
            return ['navigation', 'resource', 'measure', 'mark'];
        }
    };
}

// Polyfill for crypto.randomUUID
if (typeof global.crypto === 'undefined') {
    global.crypto = {};
}

if (typeof global.crypto.randomUUID === 'undefined') {
    global.crypto.randomUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };
}

// Polyfill for crypto.getRandomValues
if (typeof global.crypto.getRandomValues === 'undefined') {
    global.crypto.getRandomValues = (array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    };
}

// Polyfill for structuredClone
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

// Polyfill for queueMicrotask
if (typeof global.queueMicrotask === 'undefined') {
    global.queueMicrotask = (callback) => {
        Promise.resolve().then(callback);
    };
}

// Mock for requestIdleCallback
if (typeof global.requestIdleCallback === 'undefined') {
    global.requestIdleCallback = (callback, options = {}) => {
        const timeout = options.timeout || 0;
        return setTimeout(() => {
            callback({
                didTimeout: false,
                timeRemaining: () => 50, // Mock 50ms remaining
            });
        }, timeout);
    };

    global.cancelIdleCallback = (id) => {
        clearTimeout(id);
    };
}

// Mock for requestAnimationFrame
if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (callback) => {
        return setTimeout(callback, 16); // ~60fps
    };

    global.cancelAnimationFrame = (id) => {
        clearTimeout(id);
    };
}

// Mock for getComputedStyle
if (typeof global.getComputedStyle === 'undefined') {
    global.getComputedStyle = (element) => {
        return {
            getPropertyValue: (prop) => '',
            setProperty: () => { },
            removeProperty: () => '',
            cssText: '',
            length: 0,
            parentRule: null,
        };
    };
}

console.log('🔧 Browser API polyfills loaded for integration tests');