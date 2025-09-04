const { matchNames, normalizeName } = require('../src/matching/nameMatcher');

describe('Improved Name Matcher', () => {
  describe('Basic matching strategies', () => {
    test('should match exact first names', () => {
      const members = ['Alex Thompson', 'Alexander Brown', 'Alexis Davis'];
      const results = matchNames(['Alex'], members);
      
      expect(results[0].match).toBe('Alex Thompson');
      expect(results[0].confidence).toBeGreaterThan(0.85);
    });

    test('should match first name + initial pattern', () => {
      const members = ['Christopher Moore', 'Christina Martinez', 'Chris Mitchell'];
      const results = matchNames(['Chris M'], members);
      
      expect(results[0].confidence).toBeGreaterThan(0.9);
      // Should match either Christopher Moore or Chris Mitchell
      expect(['Christopher Moore', 'Chris Mitchell']).toContain(results[0].match);
    });

    test('should match shortened first names', () => {
      const members = ['Robert Anderson', 'Robin Baker', 'Roberto Garcia'];
      const results = matchNames(['Rob'], members);
      
      expect(results[0].match).toBe('Robert Anderson');
      expect(results[0].confidence).toBeGreaterThan(0.8);
    });

    test('should handle case variations', () => {
      const members = ['Sarah Johnson', 'Sandra White', 'Samantha Brown'];
      const results = matchNames(['sarah'], members);
      
      expect(results[0].match).toBe('Sarah Johnson');
      expect(results[0].confidence).toBeGreaterThan(0.85);
    });

    test('should match prefix patterns', () => {
      const members = ['Stephanie Clark', 'Stephen Hall', 'Sterling Adams'];
      const results = matchNames(['Steph'], members);
      
      expect(results[0].match).toBe('Stephanie Clark');
      expect(results[0].confidence).toBeGreaterThan(0.8);
    });

    test('should handle middle names', () => {
      const members = ['David Smith', 'Ming Wei David Lee', 'David Park'];
      const results = matchNames(['David'], members);
      
      // Should prefer direct first name matches
      expect(['David Smith', 'David Park']).toContain(results[0].match);
      expect(results[0].confidence).toBeGreaterThan(0.85);
    });
  });

  describe('User mappings (cookie simulation)', () => {
    test('should prioritize user-defined mappings', () => {
      const members = ['Robert Wilson', 'Brandon White', 'Bruce Williams'];
      const userMappings = { 'buddy': 'Robert Wilson' };
      
      const results = matchNames(['Buddy'], members, userMappings);
      
      expect(results[0].match).toBe('Robert Wilson');
      expect(results[0].confidence).toBe(1.0);
      expect(results[0].isUserMapping).toBe(true);
    });

    test('should handle multiple user mappings', () => {
      const members = [
        'Robert Wilson', 'Jennifer Smith', 'Michael Chang', 'Sarah Peterson'
      ];
      const userMappings = {
        'buddy': 'Robert Wilson',
        'ace': 'Jennifer Smith',
        'sparky': 'Michael Chang',
        'doc': 'Sarah Peterson'
      };
      
      const inputNames = ['Buddy', 'Ace', 'Sparky', 'Doc'];
      const results = matchNames(inputNames, members, userMappings);
      
      results.forEach((result) => {
        expect(result.isUserMapping).toBe(true);
        expect(result.confidence).toBe(1.0);
      });
      
      expect(results[0].match).toBe('Robert Wilson');
      expect(results[1].match).toBe('Jennifer Smith');
      expect(results[2].match).toBe('Michael Chang');
      expect(results[3].match).toBe('Sarah Peterson');
    });

    test('should ignore user mapping if member not in eligible list', () => {
      const members = ['John Smith', 'Jane Doe'];
      const userMappings = { 'buddy': 'Robert Wilson' }; // Not in members
      
      const results = matchNames(['Buddy'], members, userMappings);
      
      expect(results[0].isUserMapping).toBe(false);
      expect(results[0].match).toBeTruthy(); // Should fall back to algorithmic matching
    });
  });

  describe('Possible matches generation', () => {
    test('should generate top 5 possible matches', () => {
      const members = [
        'Christopher Moore', 'Christina Martinez', 'Chris Mitchell',
        'Charles Brown', 'Charlotte Wilson', 'Christian Davis', 'Christie Anderson'
      ];
      
      const results = matchNames(['Chris'], members);
      
      expect(results[0].possibleMatches).toBeDefined();
      expect(results[0].possibleMatches.length).toBeLessThanOrEqual(5);
      expect(results[0].possibleMatches.length).toBeGreaterThan(0);
      
      // Should be sorted by score
      for (let i = 1; i < results[0].possibleMatches.length; i++) {
        expect(results[0].possibleMatches[i-1].score)
          .toBeGreaterThanOrEqual(results[0].possibleMatches[i].score);
      }
    });

    test('should not include possible matches for user mappings', () => {
      const members = ['Robert Wilson', 'Brandon White'];
      const userMappings = { 'buddy': 'Robert Wilson' };
      
      const results = matchNames(['Buddy'], members, userMappings);
      
      expect(results[0].possibleMatches).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty input', () => {
      const members = ['John Smith', 'Jane Doe'];
      const results = matchNames([''], members);
      
      // Empty input should still try to match
      expect(results[0].confidence).toBeDefined();
      expect(results[0].confidence).toBeLessThanOrEqual(1);
    });

    test('should handle no good matches', () => {
      const members = ['John Smith', 'Jane Doe'];
      const results = matchNames(['Zzzzz'], members);
      
      // Should still return best match even if poor
      expect(results[0].confidence).toBeDefined();
      expect(results[0].confidence).toBeLessThan(0.5);
    });

    test('should handle special characters in names', () => {
      const members = ["O'Brien", "D'Angelo", "Smith-Jones"];
      const results = matchNames(['OBrien'], members);
      
      expect(results[0].match).toBe("O'Brien");
      expect(results[0].confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Name normalization', () => {
    test('should normalize names consistently', () => {
      expect(normalizeName('John Smith')).toBe('john smith');
      expect(normalizeName('  John  Smith  ')).toBe('john smith');
      expect(normalizeName('JOHN SMITH')).toBe('john smith');
      expect(normalizeName("O'Brien")).toBe('o brien');
      expect(normalizeName('Smith-Jones')).toBe('smith jones');
    });

    test('should handle empty and null inputs', () => {
      expect(normalizeName('')).toBe('');
      expect(normalizeName(null)).toBe('');
      expect(normalizeName(undefined)).toBe('');
    });
  });
});