// Theme switcher functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get theme buttons and theme preference from storage
  const lightThemeBtn = document.getElementById('lightThemeBtn');
  const darkThemeBtn = document.getElementById('darkThemeBtn');
  const midnightThemeBtn = document.getElementById('midnightThemeBtn');
  
  // Load saved theme preference or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  // Add event listeners to theme buttons
  lightThemeBtn.addEventListener('click', () => setTheme('light'));
  darkThemeBtn.addEventListener('click', () => setTheme('dark'));
  midnightThemeBtn.addEventListener('click', () => setTheme('midnight'));
  
  // Update active button state based on current theme
  updateActiveThemeButton(savedTheme);
  
  // Function to set theme
  function setTheme(theme) {
    // Remove any existing theme
    document.body.removeAttribute('data-theme');
    
    // Set new theme if not light (light is default)
    if (theme !== 'light') {
      document.body.setAttribute('data-theme', theme);
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme);
    
    // Update active button state
    updateActiveThemeButton(theme);
  }
  
  // Function to update active button state
  function updateActiveThemeButton(theme) {
    // Remove active class from all buttons
    lightThemeBtn.classList.remove('active-theme');
    darkThemeBtn.classList.remove('active-theme');
    midnightThemeBtn.classList.remove('active-theme');
    
    // Add active class to selected theme button
    if (theme === 'light') {
      lightThemeBtn.classList.add('active-theme');
    } else if (theme === 'dark') {
      darkThemeBtn.classList.add('active-theme');
    } else if (theme === 'midnight') {
      midnightThemeBtn.classList.add('active-theme');
    }
  }
});
