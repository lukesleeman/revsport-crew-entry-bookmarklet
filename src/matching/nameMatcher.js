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

  const allResults = [];

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

    // Create result object with category
    if (bestSimilarity >= highThreshold) {
      allResults.push({
        input: inputName,
        match: bestMatch,
        confidence: bestSimilarity,
        category: 'high'
      });
    } else if (bestSimilarity >= mediumThreshold) {
      allResults.push({
        input: inputName,
        match: bestMatch,
        confidence: bestSimilarity,
        category: 'medium'
      });
    } else if (bestSimilarity >= minThreshold) {
      allResults.push({
        input: inputName,
        match: bestMatch,
        confidence: bestSimilarity,
        category: 'low'
      });
    } else {
      allResults.push({
        input: inputName,
        category: 'none'
      });
    }
  }

  // Sort by confidence (highest first), with no matches at the end
  return allResults.sort((a, b) => {
    if (a.category === 'none' && b.category !== 'none') return 1;
    if (a.category !== 'none' && b.category === 'none') return -1;
    if (a.category === 'none' && b.category === 'none') return 0;
    return b.confidence - a.confidence;
  });
}

module.exports = { matchNames };