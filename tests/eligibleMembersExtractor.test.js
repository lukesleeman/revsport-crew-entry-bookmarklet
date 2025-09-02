/**
 * @jest-environment jsdom
 */

const { getEligibleMemberNames, getEligibleMemberNamesFromButtons } = require('../src/matching/eligibleMembersExtractor');

describe('Eligible Members Extractor', () => {
  beforeEach(() => {
    // Clear the document
    document.body.innerHTML = '';
  });

  describe('getEligibleMemberNames', () => {
    test('should extract names from eligibleMemberName links', () => {
      document.body.innerHTML = `
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Wei Lin Tan</a>
            <button class="addToTeam"></button>
          </div>
        </div>
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Kevin Wong</a>
            <button class="addToTeam"></button>
          </div>
        </div>
      `;

      const names = getEligibleMemberNames();
      expect(names).toEqual(['Wei Lin Tan', 'Kevin Wong']);
    });

    test('should handle names with extra whitespace', () => {
      document.body.innerHTML = `
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">  Maria Santos  </a>
          </div>
        </div>
      `;

      const names = getEligibleMemberNames();
      expect(names).toEqual(['Maria Santos']);
    });

    test('should skip cards without name links', () => {
      document.body.innerHTML = `
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Carlos Rodriguez</a>
          </div>
        </div>
        <div class="eligibleMemberCard">
          <div class="card-body">
            <!-- No name link -->
          </div>
        </div>
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Ana Martinez</a>
          </div>
        </div>
      `;

      const names = getEligibleMemberNames();
      expect(names).toEqual(['Carlos Rodriguez', 'Ana Martinez']);
    });

    test('should return empty array when no eligible members found', () => {
      document.body.innerHTML = '<div>No eligible members</div>';
      
      const names = getEligibleMemberNames();
      expect(names).toEqual([]);
    });

    test('should handle real-world dragon boat team names', () => {
      document.body.innerHTML = `
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Yuen Chun Eugene Chan</a>
          </div>
        </div>
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Grace Evelyn Dong</a>
          </div>
        </div>
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Ryz Dela Rosa</a>
          </div>
        </div>
      `;

      const names = getEligibleMemberNames();
      expect(names).toEqual([
        'Yuen Chun Eugene Chan',
        'Grace Evelyn Dong', 
        'Ryz Dela Rosa'
      ]);
    });
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
  });

  describe('both methods should return same results', () => {
    test('should extract identical names using both methods', () => {
      document.body.innerHTML = `
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Wei Lin Tan</a>
            <button class="addToTeam" data-member_name="Wei Lin Tan"></button>
          </div>
        </div>
        <div class="eligibleMemberCard">
          <div class="card-body">
            <a class="eligibleMemberName">Kevin Wong</a>
            <button class="addToTeam" data-member_name="Kevin Wong"></button>
          </div>
        </div>
      `;

      const namesFromLinks = getEligibleMemberNames();
      const namesFromButtons = getEligibleMemberNamesFromButtons();
      
      expect(namesFromLinks).toEqual(namesFromButtons);
      expect(namesFromLinks).toEqual(['Wei Lin Tan', 'Kevin Wong']);
    });
  });
});