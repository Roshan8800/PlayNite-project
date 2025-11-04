import 'jest-canvas-mock';
import '@testing-library/jest-dom';

// Import polyfills first
import './jest.polyfills';

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

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock URL constructor - use JSDOM's URL but add missing static methods
const originalURL = global.URL;
global.URL = class extends originalURL {
  static canParse(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  }

  static parse(url, base) {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  }

  static createObjectURL = jest.fn(() => 'blob:mock-url');
  static revokeObjectURL = jest.fn();
};

// Mock document.requestFullscreen
Object.defineProperty(document, 'requestFullscreen', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

// Mock document.exitFullscreen
Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

// Mock document.fullscreenElement
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

// Mock HTMLVideoElement methods
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: jest.fn(),
});

// Mock HTMLVideoElement properties
Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
  get: function() { return this._currentTime || 0; },
  set: function(value) { this._currentTime = value; },
});

Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
  get: function() { return this._duration || 0; },
  set: function(value) { this._duration = value; },
});

Object.defineProperty(HTMLVideoElement.prototype, 'volume', {
  get: function() { return this._volume || 1; },
  set: function(value) { this._volume = value; },
});

Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
  get: function() { return this._muted || false; },
  set: function(value) { this._muted = value; },
});

Object.defineProperty(HTMLVideoElement.prototype, 'paused', {
  get: function() { return this._paused || true; },
  set: function(value) { this._paused = value; },
});
