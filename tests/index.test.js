// Basic test for hello world bookmarklet
describe('Hello World Bookmarklet', () => {
  beforeEach(() => {
    // Mock alert
    global.alert = jest.fn();
  });

  test('should show alert when executed', () => {
    // Import and execute the bookmarklet code
    require('../src/index.js');
    
    expect(global.alert).toHaveBeenCalledWith('Hello World from bookmarklet!');
  });
});