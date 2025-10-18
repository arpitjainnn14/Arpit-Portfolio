// ================================================
// THEME SWITCHER - Light/Cyber
// ================================================

(function () {
  const STORAGE_KEY = 'arpit-portfolio-theme';
  const DEFAULT_THEME = 'cyber';
  const THEMES = ['cyber', 'light'];

  // Initialize theme on page load
  function initTheme() {
    // Get saved theme from localStorage or use default
    const savedTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    applyTheme(savedTheme);
    updateButtons(savedTheme);
  }

  // Apply theme by setting data attribute on html element
  function applyTheme(theme) {
    if (!THEMES.includes(theme)) {
      console.warn(`Invalid theme: ${theme}, using default`);
      theme = DEFAULT_THEME;
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Update active button state
  function updateButtons(theme) {
    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-theme') === theme) {
        btn.classList.add('active');
      }
    });
  }

  // Attach event listeners to theme buttons
  function attachListeners() {
    document.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const theme = btn.getAttribute('data-theme');
        applyTheme(theme);
        updateButtons(theme);
        
        // Optional: Play a subtle sound or animation
        playThemeSwitch();
      });
    });
  }

  // Optional: Add subtle feedback animation
  function playThemeSwitch() {
    const all = document.querySelectorAll('*');
    const randomElements = Array.from(all).sort(() => Math.random() - 0.5).slice(0, 5);
    
    randomElements.forEach((el) => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0.8';
      setTimeout(() => {
        el.style.opacity = '';
      }, 150);
    });
  }

  // Listen for system theme preference changes
  function watchSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

    prefersDark.addEventListener('change', (e) => {
      if (e.matches && !localStorage.getItem(STORAGE_KEY)) {
        applyTheme('cyber');
        updateButtons('cyber');
      }
    });

    prefersLight.addEventListener('change', (e) => {
      if (e.matches && !localStorage.getItem(STORAGE_KEY)) {
        applyTheme('light');
        updateButtons('light');
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      attachListeners();
      watchSystemTheme();
    });
  } else {
    initTheme();
    attachListeners();
    watchSystemTheme();
  }

  // Expose for external use if needed
  window.ThemeSwitcher = {
    setTheme: applyTheme,
    getTheme: () => localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME,
    toggleTheme: () => {
      const current = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
      const nextIndex = (THEMES.indexOf(current) + 1) % THEMES.length;
      applyTheme(THEMES[nextIndex]);
      updateButtons(THEMES[nextIndex]);
    }
  };
})();

