import { matchNames } from './matching/nameMatcher.js';
import { loadMappings, addMapping, getMappingStats } from './utils/cookieManager.js';

function getEligibleMemberNamesFromButtons() {
  const addButtons = document.querySelectorAll('.addToTeam[data-member_name]');
  const currentCrewNames = getCurrentCrewMemberNames();
  const memberNames = [];

  addButtons.forEach(button => {
    const name = button.getAttribute('data-member_name');
    if (name && isButtonClickable(button)) {
      const trimmedName = name.trim();
      // Don't include members who are already in the crew
      if (!currentCrewNames.includes(trimmedName)) {
        memberNames.push(trimmedName);
      }
    }
  });

  return memberNames;
}

function getCurrentCrewMemberNames() {
  const removeButtons = document.querySelectorAll('.removeFromTeam[data-member_name]');
  const crewNames = [];
  
  removeButtons.forEach(button => {
    const name = button.getAttribute('data-member_name');
    if (name) {
      crewNames.push(name.trim());
    }
  });
  
  return crewNames;
}

function isButtonClickable(button) {
  // Check if button is visible and not disabled
  const style = window.getComputedStyle(button);
  const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  const isEnabled = !button.hasAttribute('disabled') && !button.classList.contains('disabled');
  
  return isVisible && isEnabled;
}

function createBulkAddSection() {
  const bulkAddSection = document.createElement('div');
  bulkAddSection.className = 'revsport-bookmarklet-bulk-section';

  const nameInput = document.createElement('textarea');
  nameInput.placeholder = 'Paste names here (one per line)';
  nameInput.className = 'revsport-bookmarklet-textarea';

  const findMatchesBtn = document.createElement('button');
  findMatchesBtn.textContent = 'Find Matches';
  findMatchesBtn.className = 'revsport-bookmarklet-btn revsport-bookmarklet-btn-primary';

  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'match-results';
  resultsContainer.className = 'revsport-bookmarklet-results';

  bulkAddSection.appendChild(nameInput);
  bulkAddSection.appendChild(findMatchesBtn);
  bulkAddSection.appendChild(resultsContainer);

  // Add event listener
  findMatchesBtn.addEventListener('click', function() {
    handleFindMatches(nameInput, resultsContainer);
  });

  return { bulkAddSection, nameInput, resultsContainer };
}

function createStatsSection() {
  const statsDiv = document.createElement('div');
  statsDiv.className = 'revsport-bookmarklet-stats';
  updateStatsDisplay(statsDiv);
  return statsDiv;
}

function updateStatsDisplay(statsDiv) {
  const stats = getMappingStats();
  statsDiv.innerHTML = `
    <strong>Saved Mappings:</strong> ${stats.count} name${stats.count !== 1 ? 's' : ''} remembered
    ${stats.count > 0 ? '<br><small>The bookmarklet remembers your selections for future use</small>' : ''}
  `;
}

function handleFindMatches(nameInput, resultsContainer) {
  const inputText = nameInput.value.trim();
  if (!inputText) {
    alert('Please enter some names to match.');
    return;
  }

  const inputNames = inputText.split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (inputNames.length === 0) {
    alert('Please enter valid names (one per line).');
    return;
  }

  try {
    const eligibleMembers = getEligibleMemberNamesFromButtons();
    if (eligibleMembers.length === 0) {
      alert('No eligible members found on this page. Make sure you\'re on the correct crew management page.');
      return;
    }

    const userMappings = loadMappings();
    const matchResults = matchNames(inputNames, eligibleMembers, userMappings);
    displayMatchResults(matchResults, resultsContainer, nameInput, eligibleMembers);
  } catch (error) {
    console.error('Error matching names:', error);
    alert('Error occurred while matching names. Please try again.');
  }
}

function createDropdown(currentMatch, possibleMatches, eligibleMembers, inputName) {
  const select = document.createElement('select');
  select.className = 'revsport-bookmarklet-match-select';
  
  // Add current match as first option
  if (currentMatch) {
    const option = document.createElement('option');
    option.value = currentMatch;
    option.textContent = currentMatch;
    option.selected = true;
    select.appendChild(option);
  }
  
  // Add "No match" option
  const noMatchOption = document.createElement('option');
  noMatchOption.value = '';
  noMatchOption.textContent = '-- No match --';
  if (!currentMatch) {
    noMatchOption.selected = true;
  }
  select.appendChild(noMatchOption);
  
  // Add separator
  if (possibleMatches && possibleMatches.length > 0) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '── Suggestions ──';
    select.appendChild(separator);
    
    // Add top matches
    const addedNames = new Set([currentMatch]);
    possibleMatches.forEach(match => {
      if (!addedNames.has(match.name)) {
        const option = document.createElement('option');
        option.value = match.name;
        const confidence = Math.round(match.score * 100);
        option.textContent = `${match.name} (${confidence}%)`;
        select.appendChild(option);
        addedNames.add(match.name);
      }
    });
    
    // Add separator for all members
    const allSeparator = document.createElement('option');
    allSeparator.disabled = true;
    allSeparator.textContent = '── All Members ──';
    select.appendChild(allSeparator);
    
    // Add all eligible members alphabetically
    const sortedMembers = [...eligibleMembers].sort();
    sortedMembers.forEach(member => {
      if (!addedNames.has(member)) {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        select.appendChild(option);
      }
    });
  }
  
  // Store the input name for later use
  select.dataset.inputName = inputName;
  
  return select;
}

function displayMatchResults(matchResults, resultsContainer, nameInput, eligibleMembers) {
  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'block';

  if (matchResults.length === 0) {
    resultsContainer.innerHTML = '<p style="color: #6c757d; text-align: center;">No results to display.</p>';
    return;
  }

  const matchesContainer = document.createElement('div');

  matchResults.forEach((match) => {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'revsport-bookmarklet-match-item';

    // Checkbox for selection
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = match.confidence >= 0.85 || match.isUserMapping;
    checkbox.className = 'revsport-bookmarklet-match-checkbox';
    checkbox.dataset.inputName = match.input;

    // Label showing the input name
    const inputLabel = document.createElement('div');
    inputLabel.className = 'revsport-bookmarklet-match-label';
    inputLabel.textContent = match.input;

    // Arrow
    const arrow = document.createElement('span');
    arrow.textContent = '→';
    arrow.className = 'revsport-bookmarklet-match-arrow';

    // Dropdown for selecting the match
    const dropdown = createDropdown(
      match.match, 
      match.possibleMatches, 
      eligibleMembers,
      match.input
    );

    // Update checkbox value when dropdown changes
    dropdown.addEventListener('change', function() {
      checkbox.dataset.matchedName = dropdown.value;
      checkbox.checked = dropdown.value !== '';
    });

    // Set initial checkbox value
    checkbox.dataset.matchedName = dropdown.value;

    matchDiv.appendChild(checkbox);
    matchDiv.appendChild(inputLabel);
    matchDiv.appendChild(arrow);
    matchDiv.appendChild(dropdown);

    matchesContainer.appendChild(matchDiv);
  });

  resultsContainer.appendChild(matchesContainer);

  // Add action buttons
  const actionContainer = document.createElement('div');
  actionContainer.className = 'revsport-bookmarklet-actions';

  const addSelectedBtn = document.createElement('button');
  addSelectedBtn.textContent = 'Add Selected Members';
  addSelectedBtn.className = 'revsport-bookmarklet-btn revsport-bookmarklet-btn-success';

  actionContainer.appendChild(addSelectedBtn);
  resultsContainer.appendChild(actionContainer);

  addSelectedBtn.addEventListener('click', function() {
    const selectedCheckboxes = resultsContainer.querySelectorAll('input[type="checkbox"]:checked');
    
    // Save mappings for all selected items where the user changed the dropdown
    selectedCheckboxes.forEach(checkbox => {
      const inputName = checkbox.dataset.inputName;
      const matchedName = checkbox.dataset.matchedName;
      const dropdown = checkbox.parentElement.querySelector('select');
      
      if (matchedName && dropdown) {
        // Get the original match to see if user changed it
        const originalMatch = dropdown.options[0]?.value || '';
        
        // Save if this is a user-modified selection
        if (matchedName !== originalMatch && matchedName !== '') {
          addMapping(inputName, matchedName);
        }
      }
    });
    
    const selectedMembers = Array.from(selectedCheckboxes)
      .map(cb => cb.dataset.matchedName)
      .filter(name => name && name !== '');
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member to add.');
      return;
    }

    let addedCount = 0;
    let errorCount = 0;
    
    selectedMembers.forEach(memberName => {
      const addButton = document.querySelector(`.addToTeam[data-member_name="${memberName}"]`);
      if (addButton && isButtonClickable(addButton)) {
        addButton.click();
        addedCount++;
      } else {
        console.error(`Could not find or click add button for member: ${memberName}`);
        errorCount++;
      }
    });

    if (addedCount > 0) {
      // Update stats display after saving
      const statsDiv = document.querySelector('.revsport-bookmarklet-stats');
      if (statsDiv) {
        updateStatsDisplay(statsDiv);
      }
      alert(`Successfully added ${addedCount} member${addedCount === 1 ? '' : 's'} to the crew!${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      resultsContainer.style.display = 'none';
      nameInput.value = '';
    } else {
      alert('Failed to add any members. Please check the page and try again.');
    }
  });
}

export { createBulkAddSection, createStatsSection, getEligibleMemberNamesFromButtons };