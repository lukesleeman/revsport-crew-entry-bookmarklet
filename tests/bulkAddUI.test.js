/**
 * @jest-environment jsdom
 */

describe('Bulk Add UI Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Mock the location to pass the page check in the bookmarklet
    delete window.location;
    window.location = { href: 'https://revolutioniseSPORT.com/crew' };
    
    // Clear module cache to ensure fresh bookmarklet load
    jest.resetModules();
  });

  test('should create bulk add UI elements when bookmarklet loads', () => {
    // Load the bookmarklet code
    require('../src/index.js');
    
    // Check that the overlay was created
    const overlay = document.getElementById('revsport-crew-helper-overlay');
    expect(overlay).toBeTruthy();
    
    // Check that the textarea for name input exists
    const textarea = overlay.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.placeholder).toBe('Paste names here (one per line)');
    
    // Check that the find matches button exists
    const findMatchesBtn = overlay.querySelector('button');
    expect(findMatchesBtn.textContent).toBe('Find Matches');
    
    // Check that the results container exists but is hidden
    const resultsContainer = overlay.querySelector('#match-results');
    expect(resultsContainer).toBeTruthy();
    expect(resultsContainer.style.display).toBe('none');
  });

  test('should handle empty input gracefully', () => {
    // Mock alert
    window.alert = jest.fn();
    
    // Load the bookmarklet
    require('../src/index.js');
    
    const overlay = document.getElementById('revsport-crew-helper-overlay');
    const textarea = overlay.querySelector('textarea');
    const findMatchesBtn = Array.from(overlay.querySelectorAll('button'))
      .find(btn => btn.textContent === 'Find Matches');
    
    // Test empty input
    textarea.value = '';
    findMatchesBtn.click();
    
    expect(window.alert).toHaveBeenCalledWith('Please enter some names to match.');
  });

  test('should handle whitespace-only input gracefully', () => {
    // Mock alert
    window.alert = jest.fn();
    
    // Load the bookmarklet
    require('../src/index.js');
    
    const overlay = document.getElementById('revsport-crew-helper-overlay');
    const textarea = overlay.querySelector('textarea');
    const findMatchesBtn = Array.from(overlay.querySelectorAll('button'))
      .find(btn => btn.textContent === 'Find Matches');
    
    // Test whitespace-only input - this will be caught by the first validation (trim check)
    textarea.value = '   \n  \n  ';
    findMatchesBtn.click();
    
    expect(window.alert).toHaveBeenCalledWith('Please enter some names to match.');
  });

  test('should parse multi-line input correctly', () => {
    // Mock the eligible members extraction to return some test data
    const mockEligibleMembers = ['John Smith', 'Jane Doe', 'Bob Wilson'];
    
    // Create mock add buttons in the DOM
    mockEligibleMembers.forEach(name => {
      const button = document.createElement('button');
      button.className = 'addToTeam';
      button.setAttribute('data-member_name', name);
      document.body.appendChild(button);
    });
    
    // Load the bookmarklet
    require('../src/index.js');
    
    const overlay = document.getElementById('revsport-crew-helper-overlay');
    const textarea = overlay.querySelector('textarea');
    const findMatchesBtn = Array.from(overlay.querySelectorAll('button'))
      .find(btn => btn.textContent === 'Find Matches');
    
    // Test multi-line input with various formatting
    textarea.value = 'John Smith\n  Jane Doe  \n\nBob Wilson\n   ';
    findMatchesBtn.click();
    
    // Check that results container is now visible
    const resultsContainer = overlay.querySelector('#match-results');
    expect(resultsContainer.style.display).toBe('block');
    
    // Should have match results displayed
    const matchDivs = resultsContainer.querySelectorAll('div[style*="padding: 8px 12px"]');
    expect(matchDivs.length).toBeGreaterThan(0);
  });
});