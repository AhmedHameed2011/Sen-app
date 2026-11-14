/**
 * Sanad - AAC (Augmentative and Alternative Communication) Board Module
 * High-affordance visual symbols, sentence strip builder, speech output, & custom tiles.
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
    try {
      const saved = localStorage.getItem('sanad_custom_aac');
      if (saved) {
        this.customTiles = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load custom AAC tiles", e);
    }
  },

  saveCustomTiles() {
    try {
      localStorage.setItem('sanad_custom_aac', JSON.stringify(this.customTiles));
    } catch (e) {
      console.warn("Could not save custom AAC tiles", e);
    }
  },

  getAllTiles() {
    return [...this.defaultTiles, ...this.customTiles];
  },

  renderCategoryTabs() {
    const tabs = document.querySelectorAll('.aac-cat-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.currentCategory = tab.getAttribute('data-cat');
        this.renderGrid();
      });
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
        }
      });
    });
  },

  updateSentenceStripDisplay() {
    const stream = document.getElementById('aac-tiles-stream');
    if (!stream) return;

    const lang = i18n.currentLang;

    if (this.sentenceStrip.length === 0) {
      stream.innerHTML = `
        <span id="aac-empty-placeholder" style="color: var(--text-muted); font-style: italic; font-size: 1.05rem;">
          ${i18n.t('sentence_empty_hint')}
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
          document.getElementById('input-tile-text').focus();
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
