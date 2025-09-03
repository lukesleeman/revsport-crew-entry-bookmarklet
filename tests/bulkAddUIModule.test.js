/**
 * @jest-environment jsdom
 */

const { createBulkAddSection } = require('../src/bulkAddUI.js');

describe('Bulk Add UI Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should create bulk add section with required elements', () => {
    const { bulkAddSection, nameInput, resultsContainer } = createBulkAddSection();
    
    expect(bulkAddSection).toBeTruthy();
    expect(nameInput).toBeTruthy();
    expect(resultsContainer).toBeTruthy();
    
    // Check textarea properties
    expect(nameInput.tagName).toBe('TEXTAREA');
    expect(nameInput.placeholder).toBe('Paste names here (one per line)');
    
    // Check results container is initially hidden
    expect(resultsContainer.id).toBe('match-results');
    expect(resultsContainer.style.display).toBe('none');
    
    // Check find matches button exists
    const findMatchesBtn = bulkAddSection.querySelector('button');
    expect(findMatchesBtn).toBeTruthy();
    expect(findMatchesBtn.textContent).toBe('Find Matches');
  });

  test('should handle empty input validation', () => {
    // Mock alert
    window.alert = jest.fn();
    
    const { bulkAddSection, nameInput } = createBulkAddSection();
    const findMatchesBtn = bulkAddSection.querySelector('button');
    
    // Test empty input
    nameInput.value = '';
    findMatchesBtn.click();
    
    expect(window.alert).toHaveBeenCalledWith('Please enter some names to match.');
  });

  test('should handle whitespace-only input validation', () => {
    // Mock alert
    window.alert = jest.fn();
    
    const { bulkAddSection, nameInput } = createBulkAddSection();
    const findMatchesBtn = bulkAddSection.querySelector('button');
    
    // Test whitespace-only input
    nameInput.value = '   \n  \n  ';
    findMatchesBtn.click();
    
    expect(window.alert).toHaveBeenCalledWith('Please enter some names to match.');
  });

  test('should handle case when no eligible members found', () => {
    // Mock alert
    window.alert = jest.fn();
    
    const { bulkAddSection, nameInput } = createBulkAddSection();
    const findMatchesBtn = bulkAddSection.querySelector('button');
    
    // Test with valid input but no eligible members on page
    nameInput.value = 'John Smith\nJane Doe';
    findMatchesBtn.click();
    
    expect(window.alert).toHaveBeenCalledWith('No eligible members found on this page. Make sure you\'re on the correct crew management page.');
  });

  test('should process matching when eligible members exist', () => {
    // Create mock add buttons in the DOM
    const mockMembers = ['John Smith', 'Jane Doe', 'Bob Wilson'];
    mockMembers.forEach(name => {
      const button = document.createElement('button');
      button.className = 'addToTeam';
      button.setAttribute('data-member_name', name);
      document.body.appendChild(button);
    });
    
    const { bulkAddSection, nameInput, resultsContainer } = createBulkAddSection();
    const findMatchesBtn = bulkAddSection.querySelector('button');
    
    // Test with matching input
    nameInput.value = 'John Smith\nJane Doe';
    findMatchesBtn.click();
    
    // Should show results
    expect(resultsContainer.style.display).toBe('block');
    
    // Should have match results
    const matchDivs = resultsContainer.querySelectorAll('div[style*="padding: 8px 12px"]');
    expect(matchDivs.length).toBeGreaterThan(0);
  });
});