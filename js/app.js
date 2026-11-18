/**
 * Sanad - Master Application Orchestrator
 * Coordinates navigation, accessibility preferences, theme changes, and module bootstrapping.
 */

const app = {
  currentFontSize: 18,

  init() {
    this.initModules();
    this.setupNavigation();
    this.setupA11yToolbar();
    this.loadUserPreferences();
    this.registerServiceWorker();
    
    // بدء ميزة ولي الأمر
    this.setupParentLinking();
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
      navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      sections.forEach(sec => sec.classList.remove('active'));

      const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
      const activeSection = document.getElementById(`section-${targetId}`);

      if (activeLink && activeSection) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
        activeSection.classList.add('active');

        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
          const lang = (typeof i18n !== 'undefined' && i18n.currentLang) ? i18n.currentLang : 'en';
          const label = activeLink.innerText.trim();
          announcer.textContent = lang === 'ar' ? `تم الانتقال إلى ${label}` : `Navigated to ${label}`;
        }
      }
    };

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href').replace('#', '');
        switchSection(hash);
      });
    });

    const initialHash = window.location.hash.replace('#', '') || 'school';
    switchSection(initialHash);

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'school';
      switchSection(hash);
    });

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

    const selectTheme = document.getElementById('select-theme');
    if (selectTheme) {
      selectTheme.addEventListener('change', () => {
        const theme = selectTheme.value;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('sanad_theme', theme);
        if (typeof auditorModule !== 'undefined' && auditorModule && typeof auditorModule.runAudit === 'function') {
          auditorModule.runAudit();
        }
      });
    }

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
    localStorage.setItem('sanad_font_size', this.currentFontSize);
  },

  loadUserPreferences() {
    const savedFontSize = localStorage.getItem('sanad_font_size');
    if (savedFontSize) {
      this.currentFontSize = parseInt(savedFontSize);
      this.applyFontSize();
    }

    const savedTheme = localStorage.getItem('sanad_theme');
    const selectTheme = document.getElementById('select-theme');
    if (savedTheme && selectTheme) {
      document.body.setAttribute('data-theme', savedTheme);
      selectTheme.value = savedTheme;
    }

    const savedDyslexic = localStorage.getItem('sanad_dyslexic') === 'true';
    const btnDyslexic = document.getElementById('btn-dyslexic-font');
    if (savedDyslexic && btnDyslexic) {
      document.body.setAttribute('data-dyslexic', 'true');
      btnDyslexic.setAttribute('aria-pressed', 'true');
    }

    const savedLang = localStorage.getItem('sanad_lang');
    if (savedLang) {
      i18n.setLanguage(savedLang);
    }
  },

  registerServiceWorker() {
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(k => {
          if (k !== 'sanad-v6-realtime') {
            caches.delete(k);
          }
        });
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js?v=6').then(reg => {
        reg.update();
      }).catch(err => {});

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  },

  // ==========================================
  // ميزة ولي الأمر (Parent Linking)
  // ==========================================
  setupParentLinking() {
    const btn = document.getElementById('btn-link-parent');
    const input = document.getElementById('parent-email-input');
    const msg = document.getElementById('link-status-msg');

    if (!btn || !input) return;

    const savedEmail = localStorage.getItem('parent_email');
    if (savedEmail) {
      input.value = savedEmail;
      this.sendPresenceSignal(savedEmail);
    }

    btn.addEventListener('click', async () => {
      const email = input.value.trim().toLowerCase();
      if (!email) return;

      localStorage.setItem('parent_email', email);
      if(msg) {
        msg.textContent = "✅ تم ربط الحساب بنجاح!";
        msg.style.color = "green";
      }
      
      this.sendPresenceSignal(email);
    });
  },

    async sendPresenceSignal(email) {
    try {
      const { db } = await import('./firebase-config.js');
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      
      const studentId = email.replace(/[^a-zA-Z0-9]/g, '_');
      
      // دالة إرسال الإشارة
      const updatePresence = async () => {
        await setDoc(doc(db, "presence", studentId), {
          isOnline: true,
          lastSeen: new Date().toISOString()
        }, { merge: true });
      };

      // إرسال إشارة فورية عند البدء
      await updatePresence();

      // إرسال إشارة كل 10 ثوانٍ (نبضة قلب)
      setInterval(updatePresence, 10000);
      
    } catch (error) {
      console.error("Error with Firebase:", error);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});