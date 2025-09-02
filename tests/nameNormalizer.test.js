const { normalizeName } = require('../src/matching/nameNormalizer');

describe('Name Normalizer', () => {
  test('should trim whitespace', () => {
    expect(normalizeName('  Wei Lin Tan  ')).toBe('wei lin tan');
    expect(normalizeName('\tMaria Santos\n')).toBe('maria santos');
  });

  test('should convert to lowercase', () => {
    expect(normalizeName('WEI LIN TAN')).toBe('wei lin tan');
    expect(normalizeName('Carlos Rodriguez')).toBe('carlos rodriguez');
    expect(normalizeName('kEvIn WoNg')).toBe('kevin wong');
  });

  test('should handle multiple spaces', () => {
    expect(normalizeName('Li   Wei   Chen')).toBe('li wei chen');
    expect(normalizeName('Ana    Maria    Santos')).toBe('ana maria santos');
  });

  test('should remove common punctuation', () => {
    expect(normalizeName("O'Brien")).toBe('obrien');
    expect(normalizeName('Lee-Ann Wong')).toBe('lee ann wong');
    expect(normalizeName('Dr. Wei Lin Tan Jr.')).toBe('dr wei lin tan jr');
  });

  test('should handle empty and whitespace-only strings', () => {
    expect(normalizeName('')).toBe('');
    expect(normalizeName('   ')).toBe('');
    expect(normalizeName('\t\n')).toBe('');
  });

  test('should handle real-world name variations', () => {
    expect(normalizeName('Ana-Maria O\'Brien')).toBe('ana maria obrien');
    expect(normalizeName('KEVIN "KEV" WONG JR.')).toBe('kevin kev wong jr');
    expect(normalizeName('Van Der Nguyen')).toBe('van der nguyen');
  });

  test('should preserve numbers in names', () => {
    expect(normalizeName('Wei Lin Tan II')).toBe('wei lin tan ii');
    expect(normalizeName('Carlos Santos 3rd')).toBe('carlos santos 3rd');
  });
});