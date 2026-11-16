/**
 * Sanad - In School Companion Module
 * Discreet Teacher Cards, Visual Timetable, Task Chunking, & Speech Reader/Dictator.
 * Week 2 patch: timetable uses a real modal + persistence + live clock + overlap validation.
 */

const schoolModule = {
  discreetCards: [
    {
      id: 'break',
      icon: '🌿',
      text_en: "I need a 3-minute sensory break",
      text_ar: "أحتاج إلى استراحة حسية هادئة لمدة 3 دقائق"
    },
    {
      id: 'repeat',
      icon: '🔄',
      text_en: "Can you please repeat the last instruction slower?",
      text_ar: "هل يمكن تكرار التعليمات السابقة ببطء رجاءً؟"
    },
    {
      id: 'restroom',
      icon: '🚻',
      text_en: "May I use the restroom?",
      text_ar: "هل يمكنني الذهاب إلى دورة المياه "
    },
    {
      id: 'noise',
      icon: '🎧',
      text_en: "The room is too loud. May I wear my headphones?",
      text_ar: "الصف صاخب جداً. هل يمكنني ارتداء سماعات العزل؟"
    },
    {
      id: 'help',
      icon: '🙋',
      text_en: "I need assistance with this question",
      text_ar: "أحتاج إلى مساعدة في فهم هذا السؤال"
    },
    {
      id: 'ready',
      icon: '✅',
      text_en: "I have finished and I am ready",
      text_ar: "لقد انتهيت من عملي وأنا مستعد"
    }
  ],

  // Default schedule (used only if no saved timetable exists)
  defaultTimetable: [
    { id: 1, title_en: "Morning Gathering & Goals", title_ar: "التجمع الصباحي والأهداف", start: "08:00", end: "08:30", icon: "☀️" },
    { id: 2, title_en: "Math & Numbers Explorer",  title_ar: "استكشاف الرياضيات والأرقام", start: "08:35", end: "09:20", icon: "📐" },
    { id: 3, title_en: "Reading & Phonics",        title_ar: "القراءة والأصوات اللغوية", start: "09:25", end: "10:10", icon: "📚" },
    { id: 4, title_en: "Snack & Outdoor Sensory Break", title_ar: "وجبة خفيفة واستراحة حسية", start: "10:15", end: "10:55", icon: "🍎" },
    { id: 5, title_en: "Science & Nature Discovery", title_ar: "اكتشاف العلوم والطبيعة", start: "11:00", end: "11:45", icon: "🔬" },
    { id: 6, title_en: "Creative Arts & Music",    title_ar: "الفنون التعبيرية والموسيقى", start: "11:50", end: "12:35", icon: "🎨" },
    { id: 7, title_en: "Daily Wrap-up & Dismissal", title_ar: "مراجعة اليوم والانصراف", start: "12:40", end: "13:15", icon: "🎒" }
  ],

  timetable: [],
  currentPeriodId: null,
  clockIntervalId: null,
  lastRenderedCurrentId: null,

  chunkTasks: [
    { id: 1, text_en: "Open notebook to page 24", text_ar: "افتح الدفتر على صفحة 24", done: true },
    { id: 2, text_en: "Circle the main topic keywords", text_ar: "ضع دائرة حول الكلمات المفتاحية", done: false },
    { id: 3, text_en: "Write one sentence explaining your idea", text_ar: "اكتب جملة واحدة تشرح فكرتك", done: false },
    { id: 4, text_en: "Take 3 deep breaths and review work", text_ar: "خذ 3 أنفاس عميقة وراجع إجابتك", done: false }
  ],

  STORAGE_KEYS: {
    timetable: 'sanad_timetable',
    timetableDone: 'sanad_timetable_done'
  },

  init() {
    this.loadTimetable();
    this.renderDiscreetCards();
    this.renderTimetable();
    this.renderChunkTasks();
    this.setupReader();
    this.setupEventListeners();
    this.setupTimetableModal();
    this.startClock();

    window.addEventListener('app-lang-changed', () => {
      this.renderDiscreetCards();
      this.renderTimetable();
      this.renderChunkTasks();
    });
  },

  /* ---------- Persistence ---------- */

  loadTimetable() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.timetable);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].start) {
          this.timetable = parsed;
        } else {
          // Migrate old format: time:"08:00 - 08:30" → start/end
          this.timetable = (parsed || []).map(p => {
            const m = (p.time || '').match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
            return {
              id: p.id || Date.now() + Math.random(),
              title_en: p.title_en || '',
              title_ar: p.title_ar || p.title_en || '',
              start: m ? this._padTime(m[1]) : '08:00',
              end:   m ? this._padTime(m[2]) : '08:30',
              icon: p.icon || '⭐'
            };
          });
        }
      } else {
        this.timetable = this.defaultTimetable.map(p => ({ ...p }));
      }

      // Restore per-period "done" flags
      const doneRaw = localStorage.getItem(this.STORAGE_KEYS.timetableDone);
      if (doneRaw) {
        const doneMap = JSON.parse(doneRaw);
        this.timetable.forEach(p => { p.done = !!doneMap[p.id]; });
      } else {
        this.timetable.forEach(p => { p.done = p.done || false; });
      }
    } catch (e) {
      console.warn('Could not load timetable', e);
      this.timetable = this.defaultTimetable.map(p => ({ ...p }));
    }
  },

  saveTimetable() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.timetable, JSON.stringify(this.timetable));
      const doneMap = {};
      this.timetable.forEach(p => { doneMap[p.id] = !!p.done; });
      localStorage.setItem(this.STORAGE_KEYS.timetableDone, JSON.stringify(doneMap));
    } catch (e) {
      console.warn('Could not save timetable', e);
    }
  },

  _padTime(t) {
    const [h, m] = t.split(':');
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  },

  _timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  },

  _formatTime12h(t) {
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
  },

  /* ---------- Discreet cards (unchanged behavior) ---------- */

  renderDiscreetCards() {
    const container = document.getElementById('discreet-cards-container');
    if (!container) return;

    const lang = i18n.currentLang;
    container.innerHTML = this.discreetCards.map(card => {
      const text = (lang === 'ar') ? card.text_ar : card.text_en;
      return `
        <button class="discreet-btn" data-id="${card.id}" aria-label="${text}">
          <span class="icon-large" aria-hidden="true">${card.icon}</span>
          <span>${text}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.discreet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const card = this.discreetCards.find(c => c.id === id);
        if (card) {
          const text = (i18n.currentLang === 'ar') ? card.text_ar : card.text_en;
          speechEngine.speak(text);
          this.presentFullscreen(card.icon, text);
        }
      });
    });
  },

  presentFullscreen(icon, text) {
    const modal = document.getElementById('modal-presentation');
    const presIcon = document.getElementById('pres-icon');
    const presTitle = document.getElementById('pres-title');
    if (!modal || !presIcon || !presTitle) return;

    presIcon.textContent = icon;
    presTitle.textContent = text;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    const announcer = document.getElementById('sr-announcer');
    if (announcer) announcer.textContent = text;
  },

  /* ---------- Timetable ---------- */

  renderTimetable() {
    const list = document.getElementById('timetable-list');
    if (!list) return;

    const lang = i18n.currentLang;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // Determine active period (live)
    let currentId = null;
    for (const p of this.timetable) {
      const start = this._timeToMinutes(p.start);
      const end = this._timeToMinutes(p.end);
      if (nowMin >= start && nowMin < end) {
        currentId = p.id;
        break;
      }
    }
    this.currentPeriodId = currentId;

    // Only chime on transitions (not on every re-render)
    if (this.lastRenderedCurrentId && this.lastRenderedCurrentId !== currentId && currentId !== null) {
      speechEngine.playSuccessChime();
    }
    this.lastRenderedCurrentId = currentId;

    list.innerHTML = this.timetable.map(p => {
      const title = (lang === 'ar') ? p.title_ar : p.title_en;
      const isCurrent = p.id === currentId;
      const statusClass = isCurrent ? 'is-current' : '';
      const checkedAttr = p.done ? 'checked' : '';
      const nowBadge = isCurrent ? `<span style="font-size: 0.8rem; background: var(--accent-green); color: #fff; padding: 0.2rem 0.5rem; border-radius: var(--radius-full); margin-inline-start: 0.5rem;">NOW</span>` : '';
      const timeLabel = `${this._formatTime12h(p.start)} – ${this._formatTime12h(p.end)}`;
      return `
        <div class="period-item ${statusClass}" role="listitem" data-period-id="${p.id}">
          <div class="period-info">
            <div class="period-icon" aria-hidden="true">${p.icon}</div>
            <div>
              <div class="period-title">${title} ${nowBadge}</div>
              <div class="period-time">⏰ ${timeLabel}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 700;">
              <input type="checkbox" class="period-checkbox" data-id="${p.id}" ${checkedAttr} style="width: 24px; height: 24px; accent-color: var(--accent-green);">
              <span style="font-size: 0.9rem;">${i18n.currentLang === 'ar' ? 'مكتمل' : 'Done'}</span>
            </label>
            <button type="button" class="tool-btn period-delete-btn" data-id="${p.id}" aria-label="${i18n.currentLang === 'ar' ? 'حذف هذه الحصة' : 'Remove this period'}" style="min-height: 36px; min-width: 36px; padding: 0.25rem 0.5rem;">✕</button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.period-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = parseInt(cb.getAttribute('data-id'), 10);
        const item = this.timetable.find(t => t.id === id);
        if (item) {
          item.done = cb.checked;
          if (item.done) speechEngine.playSuccessChime();
          this.saveTimetable();
        }
      });
    });

    list.querySelectorAll('.period-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const isAr = i18n.currentLang === 'ar';
        const confirmMsg = isAr ? 'حذف هذه الحصة من الجدول؟' : 'Remove this period from the timetable?';
        if (!window.confirm(confirmMsg)) return;
        this.timetable = this.timetable.filter(t => t.id !== id);
        this.saveTimetable();
        this.renderTimetable();
      });
    });

    // Update the header clock badge
    this.updateClockBadge();
  },

  updateClockBadge() {
    const badge = document.getElementById('current-time-badge');
    if (!badge) return;
    const now = new Date();
    const h = String(now.getHours() % 12 === 0 ? 12 : now.getHours() % 12).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const suffix = now.getHours() >= 12 ? 'PM' : 'AM';
    badge.textContent = `${h}:${m} ${suffix}`;
    badge.setAttribute('aria-label', `Current time: ${h}:${m} ${suffix}`);
  },

  startClock() {
    if (this.clockIntervalId) clearInterval(this.clockIntervalId);
    this.updateClockBadge();
    // Recompute active period once a minute
    this.clockIntervalId = setInterval(() => {
      this.renderTimetable();
    }, 60_000);
  },

  /* ---------- Timetable modal ---------- */

  setupTimetableModal() {
    const modal = document.getElementById('modal-add-period');
    const openBtn = document.getElementById('btn-add-period');
    const closeBtn = document.getElementById('btn-close-period-modal');
    const cancelBtn = document.getElementById('btn-cancel-period');
    const form = document.getElementById('form-add-period');
    const errorEl = document.getElementById('period-form-error');

    if (!modal || !form) return;

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      form.reset();
      if (errorEl) { errorEl.textContent = ''; errorEl.hidden = true; }
    };

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('input-period-start').value = '08:00';
        document.getElementById('input-period-end').value = '08:45';
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => document.getElementById('input-period-name').focus(), 50);
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isAr = i18n.currentLang === 'ar';
      const name = document.getElementById('input-period-name').value.trim();
      const start = document.getElementById('input-period-start').value;
      const end   = document.getElementById('input-period-end').value;

      if (!name) {
        this._showFormError(errorEl, isAr ? 'الرجاء إدخال اسم الحصة.' : 'Please enter a class name.');
        return;
      }
      if (!start || !end) {
        this._showFormError(errorEl, isAr ? 'الرجاء تحديد وقت البداية والنهاية.' : 'Please set both start and end times.');
        return;
      }
      if (this._timeToMinutes(end) <= this._timeToMinutes(start)) {
        this._showFormError(errorEl, isAr ? 'وقت النهاية يجب أن يكون بعد وقت البداية.' : 'End time must be after start time.');
        return;
      }

      // Overlap check
      const s = this._timeToMinutes(start);
      const e2 = this._timeToMinutes(end);
      const overlap = this.timetable.some(p => {
        const ps = this._timeToMinutes(p.start);
        const pe = this._timeToMinutes(p.end);
        return s < pe && e2 > ps;
      });
      if (overlap) {
        this._showFormError(errorEl, isAr ? 'هذا الوقت يتعارض مع حصة أخرى.' : 'This time overlaps with an existing period.');
        return;
      }

      this.timetable.push({
        id: Date.now(),
        title_en: name,
        title_ar: name,
        start: this._padTime(start),
        end: this._padTime(end),
        icon: '⭐',
        done: false
      });
      this.timetable.sort((a, b) => this._timeToMinutes(a.start) - this._timeToMinutes(b.start));
      this.saveTimetable();
      this.renderTimetable();
      speechEngine.playSuccessChime();
      closeModal();
    });
  },

  _showFormError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  },

  /* ---------- Chunk tasks (unchanged behavior + persistence) ---------- */

  renderChunkTasks() {
    const list = document.getElementById('chunk-tasks-list');
    const progressBar = document.getElementById('chunk-progress-bar');
    if (!list) return;

    const lang = i18n.currentLang;
    const completedCount = this.chunkTasks.filter(t => t.done).length;
    const totalCount = this.chunkTasks.length;
    const percent = Math.round((completedCount / totalCount) * 100);

    if (progressBar) progressBar.style.width = `${percent}%`;

    list.innerHTML = this.chunkTasks.map(t => {
      const text = (lang === 'ar') ? t.text_ar : t.text_en;
      const completedClass = t.done ? 'completed' : '';
      return `
        <li class="chunk-task-item ${completedClass}" data-id="${t.id}" tabindex="0" role="checkbox" aria-checked="${t.done}">
          <input type="checkbox" id="task-cb-${t.id}" ${t.done ? 'checked' : ''} tabindex="-1">
          <label for="task-cb-${t.id}" style="cursor: pointer; flex: 1; font-weight: 700; font-size: 1.05rem;">${text}</label>
          ${t.done ? '<span aria-hidden="true">⭐</span>' : ''}
        </li>
      `;
    }).join('');

    list.querySelectorAll('.chunk-task-item').forEach(item => {
      const toggle = () => {
        const id = parseInt(item.getAttribute('data-id'), 10);
        const task = this.chunkTasks.find(t => t.id === id);
        if (task) {
          task.done = !task.done;
          if (task.done) speechEngine.playSuccessChime();
          this.renderChunkTasks();
        }
      };
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  },

  /* ---------- Reader ---------- */

  setupReader() {
    const textarea = document.getElementById('reader-textarea');
    const btnPlay = document.getElementById('btn-tts-play');
    const btnStop = document.getElementById('btn-tts-stop');
    const btnDictate = document.getElementById('btn-stt-record');
    const btnClear = document.getElementById('btn-clear-text');
    const speedSelect = document.getElementById('select-speech-rate');

    if (btnPlay && textarea) {
      btnPlay.addEventListener('click', () => {
        const text = textarea.value;
        if (!text || text.trim() === '') {
          speechEngine.speak(i18n.currentLang === 'ar' ? "يرجى كتابة أو لصق نص هنا أولاً" : "Please paste or type text here first");
          return;
        }
        speechEngine.speak(text);
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', () => speechEngine.stopSpeaking());
    }

    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        speechEngine.speechRate = parseFloat(speedSelect.value);
      });
    }

    if (btnClear && textarea) {
      btnClear.addEventListener('click', () => {
        textarea.value = '';
        speechEngine.stopSpeaking();
      });
    }

    if (btnDictate) {
      btnDictate.addEventListener('click', () => {
        speechEngine.toggleDictation(i18n.currentLang);
      });

      window.addEventListener('speech-dictation-started', () => {
        btnDictate.style.background = 'var(--accent-rose)';
        btnDictate.innerHTML = `<span aria-hidden="true">🛑</span> <span>${i18n.currentLang === 'ar' ? 'إيقاف الإملاء' : 'Stop Dictation'}</span>`;
      });

      window.addEventListener('speech-dictation-ended', () => {
        btnDictate.style.background = 'var(--accent-purple)';
        btnDictate.innerHTML = `<span aria-hidden="true">🎙️</span> <span>${i18n.currentLang === 'ar' ? 'إملاء صوتي' : 'Voice Dictate'}</span>`;
      });

      window.addEventListener('speech-dictation-result', (e) => {
        if (textarea && e.detail.final) {
          textarea.value += e.detail.final;
        }
      });
    }
  },

  /* ---------- Misc listeners ---------- */

  setupEventListeners() {
    const btnResetTasks = document.getElementById('btn-reset-tasks');
    if (btnResetTasks) {
      btnResetTasks.addEventListener('click', () => {
        this.chunkTasks.forEach(t => t.done = false);
        this.renderChunkTasks();
      });
    }

    const btnClosePres = document.getElementById('btn-close-presentation');
    const btnPresDone = document.getElementById('btn-pres-done');
    const btnPresSpeak = document.getElementById('btn-pres-speak');
    const modalPres = document.getElementById('modal-presentation');

    const closeModal = () => {
      if (modalPres) {
        modalPres.classList.remove('open');
        modalPres.setAttribute('aria-hidden', 'true');
      }
    };

    if (btnClosePres) btnClosePres.addEventListener('click', closeModal);
    if (btnPresDone) btnPresDone.addEventListener('click', closeModal);
    if (btnPresSpeak) {
      btnPresSpeak.addEventListener('click', () => {
        const title = document.getElementById('pres-title');
        if (title) speechEngine.speak(title.textContent);
      });
    }
  }
};