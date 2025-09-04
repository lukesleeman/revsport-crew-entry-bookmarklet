// Cookie management for storing user-defined name mappings

const COOKIE_NAME = 'revsport_crew_mappings';
const COOKIE_EXPIRY_DAYS = 365; // Store mappings for a year

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  // Use SameSite=Lax for better compatibility with bookmarklets
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function loadMappings() {
  try {
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue) {
      // Decode URI component and parse JSON
      return JSON.parse(decodeURIComponent(cookieValue));
    }
  } catch (error) {
    console.error('Error loading mappings from cookie:', error);
  }
  return {};
}

function saveMappings(mappings) {
  try {
    // Encode as URI component to handle special characters
    const encodedMappings = encodeURIComponent(JSON.stringify(mappings));
    setCookie(COOKIE_NAME, encodedMappings, COOKIE_EXPIRY_DAYS);
    return true;
  } catch (error) {
    console.error('Error saving mappings to cookie:', error);
    return false;
  }
}

function addMapping(inputName, revsportName) {
  const mappings = loadMappings();
  // Normalize the input name for consistent storage
  const normalizedInput = inputName.trim().toLowerCase();
  mappings[normalizedInput] = revsportName;
  return saveMappings(mappings);
}

function removeMapping(inputName) {
  const mappings = loadMappings();
  const normalizedInput = inputName.trim().toLowerCase();
  delete mappings[normalizedInput];
  return saveMappings(mappings);
}

function clearAllMappings() {
  deleteCookie(COOKIE_NAME);
  return true;
}

function getMappingStats() {
  const mappings = loadMappings();
  return {
    count: Object.keys(mappings).length,
    mappings: mappings
  };
}

module.exports = {
  loadMappings,
  saveMappings,
  addMapping,
  removeMapping,
  clearAllMappings,
  getMappingStats
};