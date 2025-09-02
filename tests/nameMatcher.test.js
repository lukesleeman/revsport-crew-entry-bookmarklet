const { matchNames } = require('../src/matching/nameMatcher');

describe('Name Matcher', () => {
  const eligibleMembers = [
    'Wei Lin Tan',
    'Maria Santos',
    'Kevin Wong',
    'Ana Rodriguez',
    'Li Wei Chen',
    'Carlos Gutierrez',
    'Jessica O\'Brien',
    'Daniel Nguyen',
    'Isabella Fernandez',
    'Ryan Lim',
    'Priya Singh',
    'Alex Thompson',
    'Sofia Martinez',
    'Michael Lee'
  ];

  test('should find exact matches with high confidence', () => {
    const inputNames = ['Wei Lin Tan', 'Maria Santos'];
    const result = matchNames(inputNames, eligibleMembers);
    
    expect(result.highConfidence).toHaveLength(2);
    expect(result.highConfidence[0]).toEqual({
      input: 'Wei Lin Tan',
      match: 'Wei Lin Tan',
      confidence: 1.0
    });
    expect(result.highConfidence[1]).toEqual({
      input: 'Maria Santos',
      match: 'Maria Santos',
      confidence: 1.0
    });
  });

  test('should handle case differences as high confidence', () => {
    const inputNames = ['WEI LIN TAN', 'kevin wong'];
    const result = matchNames(inputNames, eligibleMembers);
    
    expect(result.highConfidence).toHaveLength(2);
    expect(result.highConfidence[0].match).toBe('Wei Lin Tan');
    expect(result.highConfidence[1].match).toBe('Kevin Wong');
  });

  test('should find close matches with medium confidence', () => {
    const inputNames = ['Wei Tan', 'Marie Santos'];
    const result = matchNames(inputNames, eligibleMembers);
    
    expect(result.mediumConfidence.length + result.highConfidence.length).toBeGreaterThan(0);
    // Wei Tan should match Wei Lin Tan with medium confidence
    // Marie Santos should match Maria Santos with high confidence
    const weiMatch = [...result.mediumConfidence, ...result.highConfidence].find(m => m.input === 'Wei Tan');
    expect(weiMatch).toBeDefined();
    expect(weiMatch.match).toBe('Wei Lin Tan');
  });

  test('should handle nickname variations', () => {
    const inputNames = ['Kev Wong', 'Jess O\'Brien'];
    const result = matchNames(inputNames, eligibleMembers);
    
    // These might be medium confidence due to significant character differences
    expect(result.mediumConfidence.length + result.lowConfidence.length).toBeGreaterThan(0);
  });

  test('should return no matches for unmatched names', () => {
    const inputNames = ['Nonexistent Person', 'Another Fake Name'];
    const result = matchNames(inputNames, eligibleMembers);
    
    expect(result.noMatch).toHaveLength(2);
    expect(result.noMatch).toContain('Nonexistent Person');
    expect(result.noMatch).toContain('Another Fake Name');
  });

  test('should handle whitespace and punctuation differences', () => {
    const inputNames = ['Wei  Lin  Tan', 'Ana-Rodriguez'];
    const result = matchNames(inputNames, eligibleMembers);
    
    // Should still find high confidence matches after normalization
    expect(result.highConfidence.length + result.mediumConfidence.length).toBe(2);
  });

  test('should handle mixed confidence levels', () => {
    const inputNames = [
      'Wei Lin Tan',       // exact match - high
      'Wei Tan',           // close match - medium  
      'Kev Wong',          // nickname - medium/low
      'Fake Person'        // no match
    ];
    const result = matchNames(inputNames, eligibleMembers);
    
    expect(result.highConfidence.length).toBeGreaterThan(0);
    expect(result.noMatch).toContain('Fake Person');
    expect(result.highConfidence.length + result.mediumConfidence.length + result.lowConfidence.length + result.noMatch.length).toBe(4);
  });

  test('should return empty arrays for empty input', () => {
    const result = matchNames([], eligibleMembers);
    
    expect(result.highConfidence).toHaveLength(0);
    expect(result.mediumConfidence).toHaveLength(0);
    expect(result.lowConfidence).toHaveLength(0);
    expect(result.noMatch).toHaveLength(0);
  });

  test('should handle duplicate input names', () => {
    const inputNames = ['Wei Lin Tan', 'Wei Lin Tan'];
    const result = matchNames(inputNames, eligibleMembers);
    
    // Should process both instances
    expect(result.highConfidence).toHaveLength(2);
  });
});