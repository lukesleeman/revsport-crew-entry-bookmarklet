// Test setup file for Jest
// Mock DOM globals that bookmarklets might use
global.window = window;
global.document = document;
global.navigator = navigator;

// Mock console methods if needed
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};