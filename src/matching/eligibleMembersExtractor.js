function getEligibleMemberNames() {
  // Find all eligible member cards
  const memberCards = document.querySelectorAll('.eligibleMemberCard');
  const memberNames = [];

  memberCards.forEach(card => {
    // Look for the name link within each card
    const nameLink = card.querySelector('.eligibleMemberName');
    if (nameLink) {
      const name = nameLink.textContent.trim();
      if (name) {
        memberNames.push(name);
      }
    }
  });

  return memberNames;
}

// Alternative approach using the data attribute from the add button
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

module.exports = { getEligibleMemberNames, getEligibleMemberNamesFromButtons };