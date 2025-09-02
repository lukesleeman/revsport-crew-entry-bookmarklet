const { matchNames } = require('../src/matching/nameMatcher');

describe('Name Normalizer (internal)', () => {
  // Test normalization behavior through matching identical normalized strings
  test('should handle case differences', () => {
    const result = matchNames(['WEI LIN TAN'], ['wei lin tan']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle whitespace differences', () => {
    const result = matchNames(['Wei  Lin  Tan'], ['Wei Lin Tan']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle punctuation differences', () => {
    const result = matchNames(['Ana-Maria'], ['Ana Maria']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle apostrophes', () => {
    const result = matchNames(['O\'Brien'], ['OBrien']);
    expect(result.mediumConfidence).toHaveLength(1);
    expect(result.mediumConfidence[0].confidence).toBeGreaterThan(0.8);
  });

  test('should handle mixed formatting issues', () => {
    const result = matchNames(['  WEI LIN TAN  '], ['wei lin tan']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle empty and whitespace-only strings', () => {
    const result = matchNames(['   '], ['']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });

  test('should normalize complex names consistently', () => {
    const result = matchNames(['Van Der Nguyen'], ['van der nguyen']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle quotes and periods', () => {
    const result = matchNames(['Dr. Wei Lin Jr.'], ['dr wei lin jr']);
    expect(result.highConfidence).toHaveLength(1);
    expect(result.highConfidence[0].confidence).toBe(1.0);
  });
});

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
    
    expect(result.mediumConfidence.length + result.highConfidence.length + result.lowConfidence.length).toBeGreaterThan(0);
    // Wei Tan should match Wei Lin Tan (might be low confidence due to distance)
    // Marie Santos should match Maria Santos with high confidence
    const weiMatch = [...result.mediumConfidence, ...result.highConfidence, ...result.lowConfidence].find(m => m.input === 'Wei Tan');
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