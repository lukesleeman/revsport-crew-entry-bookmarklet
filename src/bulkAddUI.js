import { matchNames } from './matching/nameMatcher.js';

function getEligibleMemberNamesFromButtons() {
  const addButtons = document.querySelectorAll('.addToTeam[data-member_name]');
  const memberNames = [];

  addButtons.forEach(button => {
    const name = button.getAttribute('data-member_name');
    if (name) {
      memberNames.push(name.trim());
    }
  });

  return memberNames;
}

function createBulkAddSection() {
  const bulkAddSection = document.createElement('div');
  bulkAddSection.style.cssText = `
    margin-bottom: 20px;
    text-align: left;
  `;

  const nameInput = document.createElement('textarea');
  nameInput.placeholder = 'Paste names here (one per line)';
  nameInput.style.cssText = `
    width: 100%;
    height: 120px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    resize: vertical;
    margin-bottom: 10px;
  `;

  const findMatchesBtn = document.createElement('button');
  findMatchesBtn.textContent = 'Find Matches';
  findMatchesBtn.className = 'revsport-bookmarklet-btn revsport-bookmarklet-btn-primary';

  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'match-results';
  resultsContainer.style.cssText = `
    margin-top: 15px;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 10px;
    display: none;
  `;

  bulkAddSection.appendChild(nameInput);
  bulkAddSection.appendChild(findMatchesBtn);
  bulkAddSection.appendChild(resultsContainer);

  // Add event listeners
  findMatchesBtn.addEventListener('click', function() {
    handleFindMatches(nameInput, resultsContainer);
  });

  return { bulkAddSection, nameInput, resultsContainer };
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

    const matchResult = matchNames(inputNames, eligibleMembers);
    displayMatchResults(matchResult, resultsContainer, nameInput);
  } catch (error) {
    console.error('Error matching names:', error);
    alert('Error occurred while matching names. Please try again.');
  }
}

function displayMatchResults(matchResults, resultsContainer, nameInput) {
  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'block';

  if (matchResults.length === 0) {
    resultsContainer.innerHTML = '<p style="color: #6c757d; text-align: center;">No results to display.</p>';
    return;
  }

  matchResults.forEach((match) => {
    const matchDiv = document.createElement('div');
    matchDiv.style.cssText = `
      padding: 8px 12px;
      margin-bottom: 5px;
      border: 1px solid #eee;
      border-radius: 3px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
    `;

    if (match.category === 'none') {
      const icon = document.createElement('span');
      icon.textContent = '❓';
      icon.style.cssText = 'margin-right: 8px; color: #6c757d;';
      
      const text = document.createElement('span');
      text.textContent = match.input;
      text.style.cssText = 'color: #6c757d;';
      
      matchDiv.appendChild(icon);
      matchDiv.appendChild(text);
    } else {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = match.category === 'high';
      checkbox.style.cssText = 'margin-right: 8px;';
      checkbox.dataset.inputName = match.input;
      checkbox.dataset.matchedName = match.match;

      const icon = document.createElement('span');
      icon.style.cssText = 'margin-right: 8px;';
      if (match.category === 'high') {
        icon.textContent = '✅';
      } else if (match.category === 'medium') {
        icon.textContent = '⚠️';
      } else {
        icon.textContent = '❌';
      }

      const content = document.createElement('div');
      content.style.cssText = 'flex: 1;';
      
      const confidence = Math.round(match.confidence * 100);
      content.innerHTML = `
        <strong>${match.input}</strong> → ${match.match}
        <small style="color: #6c757d; margin-left: 8px;">(${confidence}%)</small>
      `;

      matchDiv.appendChild(checkbox);
      matchDiv.appendChild(icon);
      matchDiv.appendChild(content);
    }

    resultsContainer.appendChild(matchDiv);
  });

  const hasSelectableMatches = matchResults.some(match => match.category !== 'none');
  if (hasSelectableMatches) {
    const addSelectedBtn = createAddSelectedButton(resultsContainer, nameInput);
    resultsContainer.appendChild(addSelectedBtn);
  }
}

function createAddSelectedButton(resultsContainer, nameInput) {
  const addSelectedBtn = document.createElement('button');
  addSelectedBtn.textContent = 'Add Selected Members';
  addSelectedBtn.className = 'revsport-bookmarklet-btn revsport-bookmarklet-btn-success';

  addSelectedBtn.addEventListener('click', function() {
    const selectedCheckboxes = resultsContainer.querySelectorAll('input[type="checkbox"]:checked');
    const selectedMembers = Array.from(selectedCheckboxes).map(cb => cb.dataset.matchedName);
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member to add.');
      return;
    }

    let addedCount = 0;
    let errorCount = 0;
    
    selectedMembers.forEach(memberName => {
      const addButton = document.querySelector(`.addToTeam[data-member_name="${memberName}"]`);
      if (addButton) {
        addButton.click();
        addedCount++;
      } else {
        console.error(`Could not find add button for member: ${memberName}`);
        errorCount++;
      }
    });

    if (addedCount > 0) {
      alert(`Successfully added ${addedCount} member${addedCount === 1 ? '' : 's'} to the crew!${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      resultsContainer.style.display = 'none';
      nameInput.value = '';
    } else {
      alert('Failed to add any members. Please check the page and try again.');
    }
  });

  return addSelectedBtn;
}

export { createBulkAddSection, getEligibleMemberNamesFromButtons };