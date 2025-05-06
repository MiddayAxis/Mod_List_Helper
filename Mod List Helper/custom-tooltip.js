// Custom tooltip implementation
document.addEventListener('DOMContentLoaded', () => {
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = 'custom-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);
  
  // Function to show tooltip
  function showTooltip(text, event) {
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    
    // Position tooltip below the cursor
    const x = event.clientX;
    const y = event.clientY + 20; // 20px below cursor
    
    // Make sure tooltip stays within viewport
    const tooltipWidth = tooltip.offsetWidth;
    const windowWidth = window.innerWidth;
    
    // Center tooltip horizontally below cursor
    let left = x - (tooltipWidth / 2);
    
    // Ensure tooltip doesn't go off screen
    if (left < 10) left = 10;
    if (left + tooltipWidth > windowWidth - 10) left = windowWidth - tooltipWidth - 10;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = y + 'px';
  }
  
  // Function to hide tooltip
  function hideTooltip() {
    tooltip.style.display = 'none';
  }
  
  // Add event listeners to truncated text elements
  function setupTooltips() {
    // For mod names
    document.querySelectorAll('.mod-name-col .truncate-text').forEach(el => {
      const fullText = el.textContent;
      
      el.addEventListener('mouseenter', (event) => {
        // Only show tooltip if text is truncated
        if (el.offsetWidth < el.scrollWidth) {
          showTooltip(fullText, event);
        }
      });
      
      el.addEventListener('mousemove', (event) => {
        // Update tooltip position as mouse moves
        if (el.offsetWidth < el.scrollWidth && tooltip.style.display === 'block') {
          showTooltip(fullText, event);
        }
      });
      
      el.addEventListener('mouseleave', hideTooltip);
    });
    
    // For website links
    document.querySelectorAll('.mod-website-col .truncate-text').forEach(el => {
      const fullText = el.textContent;
      
      el.addEventListener('mouseenter', (event) => {
        if (el.offsetWidth < el.scrollWidth) {
          showTooltip(fullText, event);
        }
      });
      
      el.addEventListener('mousemove', (event) => {
        if (el.offsetWidth < el.scrollWidth && tooltip.style.display === 'block') {
          showTooltip(fullText, event);
        }
      });
      
      el.addEventListener('mouseleave', hideTooltip);
    });
    
    // For descriptions
    document.querySelectorAll('.mod-description-col .truncate-text').forEach(el => {
      const fullText = el.textContent;
      
      el.addEventListener('mouseenter', (event) => {
        if (el.offsetWidth < el.scrollWidth) {
          showTooltip(fullText, event);
        }
      });
      
      el.addEventListener('mousemove', (event) => {
        if (el.offsetWidth < el.scrollWidth && tooltip.style.display === 'block') {
          showTooltip(fullText, event);
        }
      });
      
      el.addEventListener('mouseleave', hideTooltip);
    });
  }
  
  // Initial setup
  setupTooltips();
  
  // Set up a mutation observer to handle dynamically added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        setupTooltips();
      }
    });
  });
  
  // Start observing the mod list container
  const modList = document.getElementById('modList');
  if (modList) {
    observer.observe(modList, { childList: true, subtree: true });
  }
});
