/**
 * Sanad - AAC (Augmentative and Alternative Communication) Board Module
 * High-affordance visual symbols, sentence strip builder, speech output, & custom tiles.
 * Week 1 a11y patch: dedicated live region announces only the newly-added word;
 * category tabs get roving keyboard focus; custom tiles persist + save.
 */

const aacModule = {
  currentCategory: 'all',
  sentenceStrip: [],

  defaultTiles: [
    // Urgent
    { id: 'u1', cat: 'urgent', icon: '🆘', en: 'Help me', ar: 'ساعدني' },
    { id: 'u2', cat: 'urgent', icon: '🛑', en: 'Stop please', ar: 'توقف رجاءً' },
    { id: 'u3', cat: 'urgent', icon: '🩹', en: 'I am hurt', ar: 'أنا أتألم' },
    { id: 'u4', cat: 'urgent', icon: '🚻', en: 'Bathroom', ar: 'دورة المياه' },
    { id: 'u5', cat: 'urgent', icon: '👍', en: 'Yes', ar: 'نعم' },
    { id: 'u6', cat: 'urgent', icon: '👎', en: 'No', ar: 'لا' },

    // Needs
    { id: 'n1', cat: 'needs', icon: '💧', en: 'I need water', ar: 'أريد ماء' },
    { id: 'n2', cat: 'needs', icon: '🥪', en: 'I am hungry', ar: 'أنا جائع' },
    { id: 'n3', cat: 'needs', icon: '🛋️', en: 'Quiet break', ar: 'استراحة هادئة' },
    { id: 'n4', cat: 'needs', icon: '🎧', en: 'Headphones', ar: 'سماعات العزل' },
    { id: 'n5', cat: 'needs', icon: '🧥', en: 'I feel cold', ar: 'أشعر بالبرد' },
    { id: 'n6', cat: 'needs', icon: '😴', en: 'I am tired', ar: 'أنا متعب' },

    // Feelings
    { id: 'f1', cat: 'feelings', icon: '😊', en: 'Happy', ar: 'سعيد' },
    { id: 'f2', cat: 'feelings', icon: '😢', en: 'Sad', ar: 'حزين' },
    { id: 'f3', cat: 'feelings', icon: '😌', en: 'Calm', ar: 'هادئ' },
    { id: 'f4', cat: 'feelings', icon: '😟', en: 'Worried', ar: 'قلق' },
    { id: 'f5', cat: 'feelings', icon: '😡', en: 'Frustrated', ar: 'منزعج' },
    { id: 'f6', cat: 'feelings', icon: '🌟', en: 'Proud', ar: 'فخور' },

    // Social
    { id: 's1', cat: 'social', icon: '👋', en: 'Hello', ar: 'مرحباً' },
    { id: 's2', cat: 'social', icon: '🙏', en: 'Thank you', ar: 'شكراً لك' },
    { id: 's3', cat: 'social', icon: '🤝', en: 'Please', ar: 'من فضلك' },
    { id: 's4', cat: 'social', icon: '⚽', en: 'Play with me', ar: 'العب معي' },
    { id: 's5', cat: 'social', icon: '🙋', en: 'Excuse me', ar: 'عفواً' },
    { id: 's6', cat: 'social', icon: '👋', en: 'Goodbye', ar: 'مع السلامة' },

    // Actions
    { id: 'a1', cat: 'actions', icon: '🚶', en: 'I want to go', ar: 'أريد الذهاب' },
    { id: 'a2', cat: 'actions', icon: '⏳', en: 'Wait please', ar: 'انتظر رجاءً' },
    { id: 'a3', cat: 'actions', icon: '👀', en: 'Look here', ar: 'انظر هنا' },
    { id: 'a4', cat: 'actions', icon: '👂', en: 'Listen', ar: 'استمع' },
    { id: 'a5', cat: 'actions', icon: '✏️', en: 'I want to draw', ar: 'أريد أن أرسم' },
    { id: 'a6', cat: 'actions', icon: '✅', en: 'Finished', ar: 'انتهيت' }
  ],

  customTiles: [],

  init() {
    this.loadCustomTiles();
    this.renderCategoryTabs();
    this.renderGrid();
    this.setupSentenceStripControls();
    this.setupCustomTileModal();

    window.addEventListener('app-lang-changed', () => {
      this.renderCategoryTabs();
      this.renderGrid();
      this.updateSentenceStripDisplay();
    });
  },

  loadCustomTiles() {
    // Week 1 patch: support both old ('sanad_custom_aac') and new ('sanad_custom_aac_tiles') keys
    try {
      const saved = localStorage.getItem('sanad_custom_aac_tiles')
        || localStorage.getItem('sanad_custom_aac');
      if (saved) {
        this.customTiles = JSON.parse(saved);
        // Migrate to the canonical key so privacy.js can wipe it
        if (!localStorage.getItem('sanad_custom_aac_tiles')) {
          localStorage.setItem('sanad_custom_aac_tiles', saved);
        }
      }
    } catch (e) {
      console.warn("Could not load custom AAC tiles", e);
    }
  },

  saveCustomTiles() {
    try {
      localStorage.setItem('sanad_custom_aac_tiles', JSON.stringify(this.customTiles));
      // Keep legacy key in sync for older backups
      localStorage.setItem('sanad_custom_aac', JSON.stringify(this.customTiles));
    } catch (e) {
      console.warn("Could not save custom AAC tiles", e);
    }
  },

  getAllTiles() {
    return [...this.defaultTiles, ...this.customTiles];
  },

  renderCategoryTabs() {
    const tabs = Array.from(document.querySelectorAll('.aac-cat-btn[data-cat]'));
    if (tabs.length === 0) return;

    // Sync active state to this.currentCategory (important after lang-change re-render)
    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-cat') === this.currentCategory;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');

      // Click handler is attached once per element in the DOM — guard with a flag
      if (!tab.dataset.bound) {
        tab.dataset.bound = '1';
        tab.addEventListener('click', () => {
          this.currentCategory = tab.getAttribute('data-cat');
          this.renderCategoryTabs();
          this.renderGrid();
        });
        tab.addEventListener('keydown', (e) => {
          const i = tabs.indexOf(tab);
          let next = -1;
          if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
          else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = tabs.length - 1;
          else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tab.click();
            return;
          }
          if (next !== -1) {
            e.preventDefault();
            const newTabs = Array.from(document.querySelectorAll('.aac-cat-btn[data-cat]'));
            newTabs[next].focus();
            newTabs[next].click();
          }
        });
      }
    });
  },

  renderGrid() {
    const grid = document.getElementById('aac-grid-container');
    if (!grid) return;

    const all = this.getAllTiles();
    const filtered = (this.currentCategory === 'all')
      ? all
      : all.filter(t => t.cat === this.currentCategory);

    const lang = i18n.currentLang;

    grid.innerHTML = filtered.map(tile => {
      const label = (lang === 'ar') ? tile.ar : tile.en;
      return `
        <button class="aac-tile" data-id="${tile.id}" data-category="${tile.cat}" aria-label="${label}">
          <span class="tile-icon" aria-hidden="true">${tile.icon}</span>
          <span class="tile-label">${label}</span>
        </button>
      `;
    }).join('');

    // Attach click handler to add to sentence strip & speak word
    grid.querySelectorAll('.aac-tile').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const tile = all.find(t => t.id === id);
        if (tile) {
          const word = (i18n.currentLang === 'ar') ? tile.ar : tile.en;
          speechEngine.speak(word);
          this.sentenceStrip.push(tile);
          this.updateSentenceStripDisplay();
          this.announceTileAdded(word);
        }
      });
    });
  },

  /**
   * Week 1 a11y patch: announce only the newly-added word (not the whole sentence).
   */
  announceTileAdded(word) {
    const liveEl = document.getElementById('aac-live-status');
    if (!liveEl) return;
    const lang = i18n.currentLang;
    const count = this.sentenceStrip.length;
    liveEl.textContent = (lang === 'ar')
      ? `تمت إضافة "${word}". الجملة تحتوي على ${count} كلمة.`
      : `Added "${word}". Sentence now has ${count} word${count === 1 ? '' : 's'}.`;
  },

  announceCleared() {
    const liveEl = document.getElementById('aac-live-status');
    if (!liveEl) return;
    liveEl.textContent = (i18n.currentLang === 'ar') ? 'تم مسح الجملة.' : 'Sentence cleared.';
  },

  updateSentenceStripDisplay() {
    const stream = document.getElementById('aac-tiles-stream');
    if (!stream) return;

    const lang = i18n.currentLang;

    if (this.sentenceStrip.length === 0) {
      stream.innerHTML = `
        <span id="aac-empty-placeholder" style="color: var(--text-muted); font-style: italic; font-size: 1.05rem;">
          ${(typeof i18n.t === 'function') ? i18n.t('sentence_empty_hint') : 'Tap cards below to build your sentence...'}
        </span>
      `;
      return;
    }

    stream.innerHTML = this.sentenceStrip.map(tile => {
      const text = (lang === 'ar') ? tile.ar : tile.en;
      return `
        <div class="aac-stream-tile">
          <span aria-hidden="true">${tile.icon}</span>
          <span>${text}</span>
        </div>
      `;
    }).join('');

    // Scroll to end of strip
    stream.scrollLeft = stream.scrollWidth;
  },

  setupSentenceStripControls() {
    const btnSpeak = document.getElementById('btn-aac-speak-sentence');
    const btnBack = document.getElementById('btn-aac-backspace');
    const btnClear = document.getElementById('btn-aac-clear');

    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        if (this.sentenceStrip.length === 0) return;
        const lang = i18n.currentLang;
        const sentence = this.sentenceStrip.map(t => (lang === 'ar') ? t.ar : t.en).join(' ');
        speechEngine.speak(sentence);
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.sentenceStrip.pop();
        this.updateSentenceStripDisplay();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.sentenceStrip = [];
        this.updateSentenceStripDisplay();
        this.announceCleared();
      });
    }
  },

  setupCustomTileModal() {
    const btnOpen = document.getElementById('btn-custom-tile');
    const modal = document.getElementById('modal-custom-aac');
    const btnClose = document.getElementById('btn-close-aac-modal');
    const btnCancel = document.getElementById('btn-cancel-aac');
    const form = document.getElementById('form-custom-aac');

    const closeModal = () => {
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    };

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        if (modal) {
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
          const input = document.getElementById('input-tile-text');
          if (input) input.focus();
        }
      });
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emoji = document.getElementById('input-tile-emoji').value || '✨';
        const text = document.getElementById('input-tile-text').value.trim();
        const cat = document.getElementById('select-tile-cat').value;

        if (text) {
          const newTile = {
            id: 'custom_' + Date.now(),
            cat: cat,
            icon: emoji,
            en: text,
            ar: text
          };
          this.customTiles.push(newTile);
          this.saveCustomTiles();
          this.renderGrid();
          speechEngine.playSuccessChime();
          form.reset();
          closeModal();
        }
      });
    }
  }
};