document.addEventListener("DOMContentLoaded", function() {
    const sidebarContainer = document.getElementById('sidebar-container');
    // Read the custom attribute; consider using data-role instead for HTML5 validity
    const nav_menu = sidebarContainer.getAttribute('nav_menu');
    const path = `/sidebar-menu/sidebar-${nav_menu}.html`;
  
    fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Could not load ${path}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        sidebarContainer.innerHTML = data;
        // Call the init function if it exists to attach event listeners
        if (typeof initSidebarMenu === 'function') {
          initSidebarMenu();
        }
      })
      .catch(error => console.error('Error loading sidebar:', error));
  });
  