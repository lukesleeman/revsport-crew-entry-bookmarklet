// Debug script to check DOM state before and after adding a member
console.log('=== DEBUGGING DOM STATE ===');

function debugAddButtons() {
    const addButtons = document.querySelectorAll('.addToTeam[data-member_name]');
    console.log(`Found ${addButtons.length} add buttons:`);
    
    addButtons.forEach((button, index) => {
        const name = button.getAttribute('data-member_name');
        const style = window.getComputedStyle(button);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        const isEnabled = !button.hasAttribute('disabled') && !button.classList.contains('disabled');
        
        console.log(`${index + 1}. ${name}:`);
        console.log(`   - Visible: ${isVisible}`);
        console.log(`   - Enabled: ${isEnabled}`);
        console.log(`   - Classes: ${button.className}`);
        console.log(`   - Display: ${style.display}`);
        console.log(`   - Visibility: ${style.visibility}`);
        console.log(`   - Opacity: ${style.opacity}`);
    });
}

function debugRemoveButtons() {
    const removeButtons = document.querySelectorAll('.removeFromTeam[data-member_name]');
    console.log(`Found ${removeButtons.length} crew members with remove buttons:`);
    
    removeButtons.forEach((button, index) => {
        const name = button.getAttribute('data-member_name');
        console.log(`${index + 1}. ${name} (already in crew)`);
    });
}

console.log('BEFORE any action:');
debugAddButtons();
debugRemoveButtons();

// Add this to check after someone is added manually
window.debugAfterAdd = function() {
    console.log('\nAFTER adding someone manually:');
    debugAddButtons();
    debugRemoveButtons();
};

console.log('\nTo debug after adding someone, run: debugAfterAdd()');