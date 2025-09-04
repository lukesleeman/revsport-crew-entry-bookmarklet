import { clearAllCrewMembers } from './clearAllCrewMembers.js';
import { createBulkAddSection, createStatsSection } from './bulkAddUI.js';
import './styles/buttons.css';

(function() {
  'use strict';
  
  // Check if we're on the right page
  if (!window.location.href.includes('revolutioniseSPORT') && !window.location.href.includes('revolutionise.com.au')) {
    alert('This bookmarklet is designed for revolutioniseSPORT crew pages.');
    return;
  }
  
  // Prevent multiple instances
  const existingOverlay = document.getElementById('revsport-crew-helper-overlay');
  if (existingOverlay) {
    // Set overlay back to visible
    existingOverlay.style.display = 'flex';

    // Since its already setup, we don't need to do anything further
    return;
  }
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'revsport-crew-helper-overlay';
  overlay.className = 'revsport-bookmarklet-overlay';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'revsport-bookmarklet-modal';
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'RevSport Crew Helper';
  title.className = 'revsport-bookmarklet-title';
  
  // Create bulk add section
  const { bulkAddSection } = createBulkAddSection();

  // Create clear all button
  const clearAllBtn = document.createElement('button');
  clearAllBtn.textContent = 'Clear All Crew Members';
  clearAllBtn.className = 'revsport-bookmarklet-btn revsport-bookmarklet-btn-danger';
  
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.className = 'revsport-bookmarklet-btn revsport-bookmarklet-btn-secondary';

  // Add event listeners
  clearAllBtn.addEventListener('click', function() {
    clearAllCrewMembers(overlay);
  });
  
  closeBtn.addEventListener('click', function() {
    overlay.style.display = 'none';
  });
  
  // Close on overlay click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  });
  
  // Create stats section
  const statsSection = createStatsSection();

  // Assemble modal
  modal.appendChild(title);
  modal.appendChild(bulkAddSection);
  modal.appendChild(clearAllBtn);
  modal.appendChild(closeBtn);
  modal.appendChild(statsSection);
  overlay.appendChild(modal);
  
  // Add to page
  document.body.appendChild(overlay);
})();