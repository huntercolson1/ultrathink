(function () {
  // Apply persisted theme early if possible
  var saved = localStorage.getItem('site-theme');
  if (saved && window.jtd && typeof jtd.setTheme === 'function') {
    jtd.setTheme(saved);
  }
  document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle
    var btnTheme = document.getElementById('theme-toggle');
    function currentTheme() {
      // jtd keeps a data-theme on <html>; read it
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    function setTheme(next) {
      if (window.jtd && typeof jtd.setTheme === 'function') {
        jtd.setTheme(next);
        localStorage.setItem('site-theme', next);
        btnTheme.setAttribute('aria-pressed', next === 'dark');
        btnTheme.textContent = (next === 'dark') ? 'Light' : 'Dark';
      }
    }
    if (btnTheme) {
      var init = saved || currentTheme();
      setTheme(init);
      btnTheme.addEventListener('click', function () {
        setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
    }

    // Sidebar toggle (desktop)
    var btnSidebar = document.getElementById('sidebar-toggle');
    if (btnSidebar) {
      var root = document.documentElement;
      var collapsed = localStorage.getItem('sidebar-collapsed') === '1';
      function applySidebar() {
        root.classList.toggle('sidebar-collapsed', collapsed);
        btnSidebar.setAttribute('aria-pressed', collapsed);
      }
      applySidebar();
      btnSidebar.addEventListener('click', function () {
        collapsed = !collapsed;
        localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
        applySidebar();
      });
    }
  });
})();
