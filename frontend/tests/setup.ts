import '@testing-library/jest-dom/vitest'

window.HTMLElement.prototype.scrollIntoView = () => {}

// Polyfill stubs for camera/permissions APIs used by barcode scanning (jsdom lacks these)
// Tests override individual properties as needed via Object.defineProperty or vi.stubGlobal

if (!navigator.mediaDevices) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: () => Promise.reject(new Error('Not implemented in test environment')),
    },
    writable: true,
    configurable: true,
  })
}

if (!navigator.permissions) {
  Object.defineProperty(navigator, 'permissions', {
    value: {
      query: (_descriptor: PermissionDescriptor) =>
        Promise.resolve({ state: 'prompt' } as PermissionStatus),
    },
    writable: true,
    configurable: true,
  })
}
