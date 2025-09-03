const { levenshteinDistance } = require('../src/matching/levenshtein');

describe('Levenshtein Distance', () => {
  test('identical strings should have distance 0', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  test('empty string vs non-empty should return length of non-empty', () => {
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('hello', '')).toBe(5);
  });

  test('single character differences', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1); // substitution
    expect(levenshteinDistance('cat', 'cats')).toBe(1); // insertion
    expect(levenshteinDistance('cats', 'cat')).toBe(1); // deletion
  });

  test('multiple character differences', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
  });

  test('real name examples', () => {
    expect(levenshteinDistance('Wei Lin Tan', 'Wei Lin Tan')).toBe(0);
    expect(levenshteinDistance('Maria Santos', 'Marie Santos')).toBe(1);
    expect(levenshteinDistance('Li Wei Chen', 'Li Wei Tan')).toBe(3);
    expect(levenshteinDistance('Alexandra Rodriguez', 'Alex Rodriguez')).toBe(5);
  });

  test('case sensitivity', () => {
    expect(levenshteinDistance('Wei Lin', 'wei lin')).toBe(2);
    expect(levenshteinDistance('SANTOS', 'santos')).toBe(6);
  });

  test('whitespace and punctuation', () => {
    expect(levenshteinDistance('Wei Lin Tan', 'Wei Lin  Tan')).toBe(1);
    expect(levenshteinDistance('Ana-Maria', 'Ana Maria')).toBe(1);
    expect(levenshteinDistance("O'Brien", 'OBrien')).toBe(1);
  });
});