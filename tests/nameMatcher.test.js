const { matchNames } = require('../src/matching/nameMatcher');

describe('Name Normalizer (internal)', () => {
  // Test normalization behavior through matching identical normalized strings
  test('should handle case differences', () => {
    const result = matchNames(['WEI LIN TAN'], ['wei lin tan']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle whitespace differences', () => {
    const result = matchNames(['Wei  Lin  Tan'], ['Wei Lin Tan']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle punctuation differences', () => {
    const result = matchNames(['Ana-Maria'], ['Ana Maria']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle apostrophes', () => {
    const result = matchNames(['O\'Brien'], ['OBrien']);
    const mediumConfidence = result.filter(r => r.category === 'medium');
    expect(mediumConfidence).toHaveLength(1);
    expect(mediumConfidence[0].confidence).toBeGreaterThan(0.8);
  });

  test('should handle mixed formatting issues', () => {
    const result = matchNames(['  WEI LIN TAN  '], ['wei lin tan']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle empty and whitespace-only strings', () => {
    const result = matchNames(['   '], ['']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
  });

  test('should normalize complex names consistently', () => {
    const result = matchNames(['Van Der Nguyen'], ['van der nguyen']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
  });

  test('should handle quotes and periods', () => {
    const result = matchNames(['Dr. Wei Lin Jr.'], ['dr wei lin jr']);
    const highConfidence = result.filter(r => r.category === 'high');
    expect(highConfidence).toHaveLength(1);
    expect(highConfidence[0].confidence).toBe(1.0);
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
    
    const highConfidenceMatches = result.filter(r => r.category === 'high');
    expect(highConfidenceMatches).toHaveLength(2);
    expect(highConfidenceMatches[0]).toEqual({
      input: 'Wei Lin Tan',
      match: 'Wei Lin Tan',
      confidence: 1.0,
      category: 'high'
    });
    expect(highConfidenceMatches[1]).toEqual({
      input: 'Maria Santos',
      match: 'Maria Santos',
      confidence: 1.0,
      category: 'high'
    });
  });

  test('should handle case differences as high confidence', () => {
    const inputNames = ['WEI LIN TAN', 'kevin wong'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const highConfidenceMatches = result.filter(r => r.category === 'high');
    expect(highConfidenceMatches).toHaveLength(2);
    expect(highConfidenceMatches.find(m => m.input === 'WEI LIN TAN').match).toBe('Wei Lin Tan');
    expect(highConfidenceMatches.find(m => m.input === 'kevin wong').match).toBe('Kevin Wong');
  });

  test('should find close matches with medium/low confidence', () => {
    const inputNames = ['Wei Tan', 'Marie Santos'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const allMatches = result.filter(r => r.category !== 'none');
    expect(allMatches.length).toBeGreaterThan(0);
    
    const weiMatch = result.find(m => m.input === 'Wei Tan');
    expect(weiMatch).toBeDefined();
    expect(weiMatch.match).toBe('Wei Lin Tan');
  });

  test('should handle nickname variations', () => {
    const inputNames = ['Kev Wong', 'Jess O\'Brien'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const nonExactMatches = result.filter(r => r.category === 'medium' || r.category === 'low');
    expect(nonExactMatches.length).toBeGreaterThan(0);
  });

  test('should return no matches for unmatched names', () => {
    const inputNames = ['Nonexistent Person', 'Another Fake Name'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const noMatches = result.filter(r => r.category === 'none');
    expect(noMatches).toHaveLength(2);
    expect(noMatches.map(r => r.input)).toContain('Nonexistent Person');
    expect(noMatches.map(r => r.input)).toContain('Another Fake Name');
  });

  test('should handle whitespace and punctuation differences', () => {
    const inputNames = ['Wei  Lin  Tan', 'Ana-Rodriguez'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const goodMatches = result.filter(r => r.category === 'high' || r.category === 'medium');
    expect(goodMatches.length).toBe(2);
  });

  test('should handle mixed confidence levels', () => {
    const inputNames = [
      'Wei Lin Tan',       // exact match - high
      'Wei Tan',           // close match - medium  
      'Kev Wong',          // nickname - medium/low
      'Fake Person'        // no match
    ];
    const result = matchNames(inputNames, eligibleMembers);
    
    const highMatches = result.filter(r => r.category === 'high');
    const noMatches = result.filter(r => r.category === 'none');
    
    expect(highMatches.length).toBeGreaterThan(0);
    expect(noMatches.map(r => r.input)).toContain('Fake Person');
    expect(result.length).toBe(4);
  });

  test('should return empty array for empty input', () => {
    const result = matchNames([], eligibleMembers);
    expect(result).toHaveLength(0);
  });

  test('should handle duplicate input names', () => {
    const inputNames = ['Wei Lin Tan', 'Wei Lin Tan'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const highMatches = result.filter(r => r.category === 'high');
    expect(highMatches).toHaveLength(2);
  });

  test('should return results sorted by confidence', () => {
    const inputNames = ['Wei Tan', 'Wei Lin Tan', 'Wei'];
    const result = matchNames(inputNames, eligibleMembers);
    
    const matchedResults = result.filter(r => r.category !== 'none');
    // Should be sorted by confidence descending
    for (let i = 1; i < matchedResults.length; i++) {
      expect(matchedResults[i-1].confidence).toBeGreaterThanOrEqual(matchedResults[i].confidence);
    }
  });
});