/**
 * @jest-environment jsdom
 */

const { getEligibleMemberNamesFromButtons } = require('../src/bulkAddUI');

describe('Member Extraction', () => {
  beforeEach(() => {
    // Clear the document
    document.body.innerHTML = '';
  });

  describe('getEligibleMemberNamesFromButtons', () => {
    test('should extract names from data-member_name attributes', () => {
      document.body.innerHTML = `
        <button class="addToTeam" data-member_name="Wei Lin Tan"></button>
        <button class="addToTeam" data-member_name="Kevin Wong"></button>
      `;

      const names = getEligibleMemberNamesFromButtons();
      expect(names).toEqual(['Wei Lin Tan', 'Kevin Wong']);
    });

    test('should handle buttons without data-member_name', () => {
      document.body.innerHTML = `
        <button class="addToTeam" data-member_name="Maria Santos"></button>
        <button class="addToTeam"></button>
        <button class="addToTeam" data-member_name="Carlos Rodriguez"></button>
      `;

      const names = getEligibleMemberNamesFromButtons();
      expect(names).toEqual(['Maria Santos', 'Carlos Rodriguez']);
    });

    test('should trim whitespace from data attributes', () => {
      document.body.innerHTML = `
        <button class="addToTeam" data-member_name="  Ana Martinez  "></button>
      `;

      const names = getEligibleMemberNamesFromButtons();
      expect(names).toEqual(['Ana Martinez']);
    });

    test('should return empty array when no buttons found', () => {
      document.body.innerHTML = '<div>No buttons</div>';
      
      const names = getEligibleMemberNamesFromButtons();
      expect(names).toEqual([]);
    });

    test('should handle real-world dragon boat team names', () => {
      document.body.innerHTML = `
        <button class="addToTeam" data-member_name="Yuen Chun Eugene Chan"></button>
        <button class="addToTeam" data-member_name="Grace Evelyn Dong"></button>
        <button class="addToTeam" data-member_name="Ryz Dela Rosa"></button>
      `;

      const names = getEligibleMemberNamesFromButtons();
      expect(names).toEqual([
        'Yuen Chun Eugene Chan',
        'Grace Evelyn Dong', 
        'Ryz Dela Rosa'
      ]);
    });
  });
});