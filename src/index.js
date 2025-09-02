import { clearAllCrewMembers } from './clearAllCrewMembers.js';

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
    existingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    `;
    return;
  }
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'revsport-crew-helper-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
  `;
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    text-align: center;
    max-width: 400px;
    width: 90%;
  `;
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'RevSport Crew Helper';
  title.style.cssText = `
    margin: 0 0 20px 0;
    color: #333;
  `;
  
  // Create clear all button
  const clearAllBtn = document.createElement('button');
  clearAllBtn.textContent = 'Clear All Crew Members';
  clearAllBtn.style.cssText = `
    background: #dc3545;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin: 10px;
    transition: background 0.3s;
  `;
  
  clearAllBtn.onmouseover = function() {
    this.style.background = '#c82333';
  };
  
  clearAllBtn.onmouseout = function() {
    this.style.background = '#dc3545';
  };
  
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = `
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin: 10px;
    transition: background 0.3s;
  `;
  
  closeBtn.onmouseover = function() {
    this.style.background = '#5a6268';
  };
  
  closeBtn.onmouseout = function() {
    this.style.background = '#6c757d';
  };
  
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
  
  // Assemble modal
  modal.appendChild(title);
  modal.appendChild(clearAllBtn);
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  
  // Add to page
  document.body.appendChild(overlay);
})();