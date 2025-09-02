const { levenshteinDistance } = require('./levenshtein');

function normalizeName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  return name
    .trim()
    .toLowerCase()
    .replace(/['".-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

function matchNames(inputNames, eligibleMembers, options = {}) {
  const { 
    highThreshold = 0.9, 
    mediumThreshold = 0.7,
    minThreshold = 0.4
  } = options;

  const result = {
    highConfidence: [],
    mediumConfidence: [],
    lowConfidence: [],
    noMatch: []
  };

  for (const inputName of inputNames) {
    const normalizedInput = normalizeName(inputName);
    let bestMatch = null;
    let bestSimilarity = 0;

    // Find best match among eligible members
    for (const member of eligibleMembers) {
      const normalizedMember = normalizeName(member);
      const similarity = calculateSimilarity(normalizedInput, normalizedMember);
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = member;
      }
    }

    // Categorize match based on similarity
    if (bestSimilarity >= highThreshold) {
      result.highConfidence.push({
        input: inputName,
        match: bestMatch,
        confidence: bestSimilarity
      });
    } else if (bestSimilarity >= mediumThreshold) {
      result.mediumConfidence.push({
        input: inputName,
        match: bestMatch,
        confidence: bestSimilarity
      });
    } else if (bestSimilarity >= minThreshold) {
      result.lowConfidence.push({
        input: inputName,
        match: bestMatch,
        confidence: bestSimilarity
      });
    } else {
      result.noMatch.push(inputName);
    }
  }

  return result;
}

module.exports = { matchNames };