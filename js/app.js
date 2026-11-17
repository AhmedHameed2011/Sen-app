/**
 * Sanad - Master Application Orchestrator
 * Coordinates navigation, accessibility preferences, theme changes, and module bootstrapping.
 * Week 1 a11y patch: nav uses aria-current instead of tab roles; storage keys aligned with privacy.js.
 */

const app = {
  currentFontSize: 18,

  init() {
    this.initModules();
    this.setupNavigation();
    this.setupA11yToolbar();
    this.loadUserPreferences();
    this.registerServiceWorker();
  },

  initModules() {
    speechEngine.init();
    schoolModule.init();
    lifeModule.init();
    aacModule.init();
    calmModule.init();
    safecardModule.init();
    auditorModule.init();
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    const switchSection = (targetId) => {
      // Deactivate all
      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      sections.forEach(sec => sec.classList.remove('active'));

      // Find active link and section
      const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
      const activeSection = document.getElementById(`section-${targetId}`);

      if (activeLink && activeSection) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
        activeSection.classList.add('active');

        // Announce section change to screen readers (defer to let DOM settle)
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
          const lang = (typeof i18n !== 'undefined' && i18n.currentLang) ? i18n.currentLang : 'en';
          const label = activeLink.innerText.trim();
          announcer.textContent = lang === 'ar'
            ? `تم الانتقال إلى ${label}`
            : `Navigated to ${label}`;
        }
      }
    };

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href').replace('#', '');
        switchSection(hash);
        // Do NOT preventDefault — allow anchor hash update for back/forward
      });
    });

    // Check initial URL hash
    const initialHash = window.location.hash.replace('#', '') || 'school';
    switchSection(initialHash);

    // Support browser back/forward buttons
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'school';
      switchSection(hash);
    });

    // SOS quick button in header
    const btnSos = document.getElementById('btn-quick-sos');
    if (btnSos) {
      btnSos.addEventListener('click', () => {
        window.location.hash = '#safe';
        switchSection('safe');
        speechEngine.speak(i18n.currentLang === 'ar' ? "تم فتح بطاقة الهوية الآمنة" : "Safe ID Card Opened");
      });
    }
  },

  setupA11yToolbar() {
    // 1. Font Size Scaling
    const btnFontInc = document.getElementById('btn-font-inc');
    const btnFontDec = document.getElementById('btn-font-dec');

    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        if (this.currentFontSize < 28) {
          this.currentFontSize += 2;
          this.applyFontSize();
        }
      });
    }

    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        if (this.currentFontSize > 14) {
          this.currentFontSize -= 2;
          this.applyFontSize();
        }
      });
    }

    // 2. High Contrast Theme Selector
    const selectTheme = document.getElementById('select-theme');
    if (selectTheme) {
      selectTheme.addEventListener('change', () => {
        const theme = selectTheme.value;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('sanad_theme', theme);
        // Trigger auditor update
        if (typeof auditorModule !== 'undefined' && auditorModule && typeof auditorModule.runAudit === 'function') {
          auditorModule.runAudit();
        }
      });
    }

    // 3. Dyslexia Font Toggle
    const btnDyslexic = document.getElementById('btn-dyslexic-font');
    if (btnDyslexic) {
      btnDyslexic.addEventListener('click', () => {
        const isCurrentlyDyslexic = document.body.getAttribute('data-dyslexic') === 'true';
        const newState = !isCurrentlyDyslexic;
        document.body.setAttribute('data-dyslexic', newState ? 'true' : 'false');
        btnDyslexic.setAttribute('aria-pressed', newState ? 'true' : 'false');
        localStorage.setItem('sanad_dyslexic', newState ? 'true' : 'false');
      });
    }

    // 4. Voice Assist / Hover-to-Read Toggle
    const btnHoverSpeech = document.getElementById('btn-hover-speech');
    if (btnHoverSpeech) {
      btnHoverSpeech.addEventListener('click', () => {
        speechEngine.hoverReadEnabled = !speechEngine.hoverReadEnabled;
        btnHoverSpeech.setAttribute('aria-pressed', speechEngine.hoverReadEnabled ? 'true' : 'false');
        if (speechEngine.hoverReadEnabled) {
          speechEngine.speak(i18n.currentLang === 'ar' ? "المساعد الصوتي مفعل" : "Voice Assist enabled");
        }
      });
    }

    // 5. Language Switcher (EN / AR)
    const btnLang = document.getElementById('btn-lang-toggle');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        const nextLang = (i18n.currentLang === 'en') ? 'ar' : 'en';
        i18n.setLanguage(nextLang);
        localStorage.setItem('sanad_lang', nextLang);
      });
    }
  },

  applyFontSize() {
    document.documentElement.style.setProperty('--font-base-size', `${this.currentFontSize}px`);
    // NOTE: This key is deliberately distinct from 'sanad_font_scale' (used by
    // privacy.js for the concept of a scale multiplier); here we persist the raw px value.
    localStorage.setItem('sanad_font_size', this.currentFontSize);
  },

  loadUserPreferences() {
    // Font size
    const savedFontSize = localStorage.getItem('sanad_font_size');
    if (savedFontSize) {
      this.currentFontSize = parseInt(savedFontSize);
      this.applyFontSize();
    }

    // Theme
    const savedTheme = localStorage.getItem('sanad_theme');
    const selectTheme = document.getElementById('select-theme');
    if (savedTheme && selectTheme) {
      document.body.setAttribute('data-theme', savedTheme);
      selectTheme.value = savedTheme;
    }

    // Dyslexic Font
    const savedDyslexic = localStorage.getItem('sanad_dyslexic') === 'true';
    const btnDyslexic = document.getElementById('btn-dyslexic-font');
    if (savedDyslexic && btnDyslexic) {
      document.body.setAttribute('data-dyslexic', 'true');
      btnDyslexic.setAttribute('aria-pressed', 'true');
    }

    // Language
    const savedLang = localStorage.getItem('sanad_lang');
    if (savedLang) {
      i18n.setLanguage(savedLang);
    }
  },

  // Notify backend that student is active (presence)
  const studentId = localStorage.getItem('sanad_student_id');
  if (studentId) {
    fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    }).catch(() => {});
  }

    // Clear legacy client-side caches
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(k => {
          if (k !== 'sanad-v5-realtime') {
            console.log('Purging legacy cache:', k);
            caches.delete(k);
          }
        });
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js?v=5').then(reg => {
        reg.update(); // Trigger immediate background update check
      }).catch(err => {
        // Safe to ignore in sandbox or file protocol
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});