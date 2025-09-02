describe('RevSport Crew Helper Bookmarklet', () => {
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock global functions
    global.alert = jest.fn();
    global.confirm = jest.fn();
    
    // Reset require cache
    delete require.cache[require.resolve('../src/index.js')];
  });

  test('should show alert when not on revolutioniseSPORT page', () => {
    // Mock window.location for non-revsport site
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com' },
      writable: true
    });
    
    require('../src/index.js');
    
    expect(global.alert).toHaveBeenCalledWith('This bookmarklet is designed for revolutioniseSPORT crew pages.');
  });

  test('should validate correct page detection', () => {
    // Mock window.location for revsport site  
    Object.defineProperty(window, 'location', {
      value: { href: 'https://portal.revolutionise.com.au/test' },
      writable: true
    });
    
    // Mock DOM elements properly
    const mockElement = {
      style: { cssText: '', display: '' },
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      textContent: '',
      onmouseover: null,
      onmouseout: null,
      id: ''
    };
    
    document.getElementById = jest.fn().mockReturnValue(null);
    document.createElement = jest.fn().mockReturnValue(mockElement);
    
    // Mock document.body.appendChild instead of replacing document.body
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = jest.fn();
    
    require('../src/index.js');
    
    // Should not show the wrong page alert
    expect(global.alert).not.toHaveBeenCalledWith('This bookmarklet is designed for revolutioniseSPORT crew pages.');
    
    // Restore original appendChild
    document.body.appendChild = originalAppendChild;
  });

  test('bookmarklet should load without syntax errors', () => {
    // Mock window.location for revsport site to avoid alert
    Object.defineProperty(window, 'location', {
      value: { href: 'https://portal.revolutionise.com.au/test' },
      writable: true
    });
    
    // Test that the built bookmarklet (which is bundled) can be parsed as valid JavaScript
    const mockFS = require('fs');
    const builtBookmarkletCode = mockFS.readFileSync(require.resolve('../dist/bookmarklet.js'), 'utf8');
    
    expect(() => {
      new Function(builtBookmarkletCode);
    }).not.toThrow();
  });
});