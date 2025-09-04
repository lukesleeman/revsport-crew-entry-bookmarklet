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

function extractNameParts(fullName) {
  const normalized = normalizeName(fullName);
  const parts = normalized.split(' ').filter(Boolean);
  
  return {
    full: normalized,
    parts: parts,
    first: parts[0] || '',
    last: parts[parts.length - 1] || '',
    middle: parts.slice(1, -1),
    initials: parts.map(p => p[0]).join(''),
  };
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

function matchWithStrategies(inputName, candidateName) {
  const input = extractNameParts(inputName);
  const candidate = extractNameParts(candidateName);
  
  let bestScore = 0;
  let matchReason = '';
  
  // Strategy 1: Exact match (case-insensitive)
  if (input.full === candidate.full) {
    return { score: 1.0, reason: 'exact match' };
  }
  
  // Strategy 2: First name match (very common pattern)
  if (input.first && candidate.first) {
    if (input.first === candidate.first) {
      bestScore = Math.max(bestScore, 0.9);
      matchReason = 'first name exact match';
    } else {
      // Check if input is prefix of candidate's first name
      if (candidate.first.startsWith(input.first) && input.first.length >= 3) {
        bestScore = Math.max(bestScore, 0.85);
        matchReason = 'first name prefix match';
      }
      // Check similarity for close matches (typos, shortenings)
      const firstNameSim = calculateSimilarity(input.first, candidate.first);
      if (firstNameSim > 0.8) {
        bestScore = Math.max(bestScore, firstNameSim * 0.9);
        matchReason = 'first name similarity';
      }
    }
  }
  
  // Strategy 3: Handle "First Initial" pattern (e.g., "Sam F" -> "Samantha French")
  if (input.parts.length === 2 && input.parts[1].length === 1) {
    const inputFirstName = input.parts[0];
    const inputLastInitial = input.parts[1];
    
    if (candidate.first.toLowerCase().startsWith(inputFirstName) && 
        candidate.last.toLowerCase().startsWith(inputLastInitial)) {
      bestScore = Math.max(bestScore, 0.92);
      matchReason = 'first name + last initial';
    }
  }
  
  // Strategy 4: Check if input matches any middle name
  for (const middleName of candidate.middle) {
    if (input.first === middleName) {
      bestScore = Math.max(bestScore, 0.75);
      matchReason = 'middle name match';
    }
  }
  
  // Strategy 5: Check if input appears anywhere in candidate (substring match)
  if (input.full.length >= 3 && candidate.full.includes(input.full)) {
    const substringBonus = input.full.length / candidate.full.length;
    bestScore = Math.max(bestScore, 0.7 + (substringBonus * 0.2));
    matchReason = 'substring match';
  }
  
  // Strategy 6: Fallback to Levenshtein similarity
  const overallSimilarity = calculateSimilarity(input.full, candidate.full);
  if (overallSimilarity > bestScore) {
    bestScore = overallSimilarity;
    matchReason = 'character similarity';
  }
  
  return { score: bestScore, reason: matchReason };
}

function improvedMatchNames(inputNames, eligibleMembers, userMappings = {}) {
  const allResults = [];
  
  for (const inputName of inputNames) {
    let bestMatch = null;
    let bestScore = 0;
    let bestReason = '';
    let isUserMapping = false;
    
    // First, check if we have a user-defined mapping for this input
    const normalizedInput = normalizeName(inputName);
    if (userMappings[normalizedInput]) {
      const mappedName = userMappings[normalizedInput];
      // Verify the mapped name is still in eligible members
      if (eligibleMembers.includes(mappedName)) {
        bestMatch = mappedName;
        bestScore = 1.0;
        bestReason = 'user-defined mapping';
        isUserMapping = true;
      }
    }
    
    // If no user mapping, use algorithmic matching
    if (!isUserMapping) {
      for (const member of eligibleMembers) {
        const result = matchWithStrategies(inputName, member);
        
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMatch = member;
          bestReason = result.reason;
        }
      }
    }
    
    // Create result object
    allResults.push({
      input: inputName,
      match: bestMatch,
      confidence: bestScore,
      reason: bestReason,
      isUserMapping: isUserMapping,
      possibleMatches: !isUserMapping ? findTopMatches(inputName, eligibleMembers, 5) : []
    });
  }
  
  return allResults;
}

function findTopMatches(inputName, eligibleMembers, limit = 5) {
  const matches = [];
  
  for (const member of eligibleMembers) {
    const result = matchWithStrategies(inputName, member);
    matches.push({
      name: member,
      score: result.score,
      reason: result.reason
    });
  }
  
  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { 
  matchNames: improvedMatchNames,  // Export with simpler name
  normalizeName
};