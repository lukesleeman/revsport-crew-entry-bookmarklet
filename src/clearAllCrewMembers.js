export function clearAllCrewMembers(overlay) {
  // Find all delete buttons for crew members
  const deleteButtons = document.querySelectorAll('button.removeFromTeam.btn-light-danger');
  
  if (deleteButtons.length === 0) {
    alert('No crew members found to remove.');
    return;
  }
  
  if (!confirm(`Are you sure you want to remove all ${deleteButtons.length} crew members?`)) {
    return;
  }
  
  // Click each delete button with a small delay
  let count = 0;
  deleteButtons.forEach((button, index) => {
    setTimeout(() => {
      if (button && button.parentNode) {
        button.click();
        count++;
        
        // Close overlay when done
        if (count === deleteButtons.length) {
          setTimeout(() => {
            overlay.style.display = 'none';
          }, 500);
        }
      }
    }, index * 100); // 100ms delay between clicks
  });
}