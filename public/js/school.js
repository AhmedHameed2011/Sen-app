/**
 * Sanad - In School Companion Module
 * Discreet Teacher Cards, Visual Timetable, Task Chunking, & Speech Reader/Dictator.
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
      text_en: "May I use the quiet restroom?",
      text_ar: "هل يمكنني الذهاب إلى دورة المياه الهادئة؟"
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

  timetable: [
    { id: 1, title_en: "Morning Gathering & Goals", title_ar: "التجمع الصباحي والأهداف", time: "08:00 - 08:30", icon: "☀️", current: false, done: true },
    { id: 2, title_en: "Math & Numbers Explorer", title_ar: "استكشاف الرياضيات والأرقام", time: "08:35 - 09:20", icon: "📐", current: true, done: false },
    { id: 3, title_en: "Reading & Phonics", title_ar: "القراءة والأصوات اللغوية", time: "09:25 - 10:10", icon: "📚", current: false, done: false },
    { id: 4, title_en: "Snack & Outdoor Sensory Break", title_ar: "وجبة خفيفة واستراحة حسية", time: "10:15 - 10:55", icon: "🍎", current: false, done: false },
    { id: 5, title_en: "Science & Nature Discovery", title_ar: "اكتشاف العلوم والطبيعة", time: "11:00 - 11:45", icon: "🔬", current: false, done: false },
    { id: 6, title_en: "Creative Arts & Music", title_ar: "الفنون التعبيرية والموسيقى", time: "11:50 - 12:35", icon: "🎨", current: false, done: false },
    { id: 7, title_en: "Daily Wrap-up & Dismissal", title_ar: "مراجعة اليوم والانصراف", time: "12:40 - 01:15", icon: "🎒", current: false, done: false }
  ],

  chunkTasks: [
    { id: 1, text_en: "Open notebook to page 24", text_ar: "افتح الدفتر على صفحة 24", done: true },
    { id: 2, text_en: "Circle the main topic keywords", text_ar: "ضع دائرة حول الكلمات المفتاحية", done: false },
    { id: 3, text_en: "Write one sentence explaining your idea", text_ar: "اكتب جملة واحدة تشرح فكرتك", done: false },
    { id: 4, text_en: "Take 3 deep breaths and review work", text_ar: "خذ 3 أنفاس عميقة وراجع إجابتك", done: false }
  ],

  init() {
    this.renderDiscreetCards();
    this.renderTimetable();
    this.renderChunkTasks();
    this.setupReader();
    this.setupEventListeners();

    // Listen for language change to re-render texts
    window.addEventListener('app-lang-changed', () => {
      this.renderDiscreetCards();
      this.renderTimetable();
      this.renderChunkTasks();
    });
  },

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

    // Attach click events
    container.querySelectorAll('.discreet-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const card = this.discreetCards.find(c => c.id === id);
        if (card) {
          const text = (i18n.currentLang === 'ar') ? card.text_ar : card.text_en;
          // Speak aloud
          speechEngine.speak(text);
          // Show fullscreen presentation modal
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

    // Announce to screen reader
    const announcer = document.getElementById('sr-announcer');
    if (announcer) announcer.textContent = text;
  },

  renderTimetable() {
    const list = document.getElementById('timetable-list');
    if (!list) return;

    const lang = i18n.currentLang;
    list.innerHTML = this.timetable.map(p => {
      const title = (lang === 'ar') ? p.title_ar : p.title_en;
      const statusClass = p.current ? 'is-current' : '';
      const checkedAttr = p.done ? 'checked' : '';
      return `
        <div class="period-item ${statusClass}" role="listitem">
          <div class="period-info">
            <div class="period-icon" aria-hidden="true">${p.icon}</div>
            <div>
              <div class="period-title">${title} ${p.current ? '<span style="font-size: 0.8rem; background: var(--accent-green); color: #fff; padding: 0.2rem 0.5rem; border-radius: var(--radius-full); margin-left: 0.5rem;">NOW</span>' : ''}</div>
              <div class="period-time">⏰ ${p.time}</div>
            </div>
          </div>
          <div>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 700;">
              <input type="checkbox" class="period-checkbox" data-id="${p.id}" ${checkedAttr} style="width: 24px; height: 24px; accent-color: var(--accent-green);">
              <span style="font-size: 0.9rem;">${i18n.currentLang === 'ar' ? 'مكتمل' : 'Done'}</span>
            </label>
          </div>
        </div>
      `;
    }).join('');

    // Attach checkbox toggles
    list.querySelectorAll('.period-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(cb.getAttribute('data-id'));
        const item = this.timetable.find(t => t.id === id);
        if (item) {
          item.done = cb.checked;
          if (item.done) {
            speechEngine.playSuccessChime();
          }
        }
      });
    });
  },

  renderChunkTasks() {
    const list = document.getElementById('chunk-tasks-list');
    const progressBar = document.getElementById('chunk-progress-bar');
    if (!list) return;

    const lang = i18n.currentLang;
    const completedCount = this.chunkTasks.filter(t => t.done).length;
    const totalCount = this.chunkTasks.length;
    const percent = Math.round((completedCount / totalCount) * 100);

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    list.innerHTML = this.chunkTasks.map(t => {
      const text = (lang === 'ar') ? t.text_ar : t.text_en;
      const completedClass = t.done ? 'completed' : '';
      return `
        <li class="chunk-task-item ${completedClass}" data-id="${t.id}" tabindex="0" role="checkbox" aria-checked="${t.done}">
          <input type="checkbox" id="task-cb-${t.id}" ${t.done ? 'checked' : ''} tabindex="-1">
          <label for="task-cb-${t.id}" style="cursor: pointer; flex: 1; font-weight: 700; font-size: 1.05rem;">${text}</label>
          ${t.done ? '<span>⭐</span>' : ''}
        </li>
      `;
    }).join('');

    // Attach click toggles
    list.querySelectorAll('.chunk-task-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.getAttribute('data-id'));
        const task = this.chunkTasks.find(t => t.id === id);
        if (task) {
          task.done = !task.done;
          if (task.done) {
            speechEngine.playSuccessChime();
          }
          this.renderChunkTasks();
        }
      });
    });
  },

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
      btnStop.addEventListener('click', () => {
        speechEngine.stopSpeaking();
      });
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
        btnDictate.innerHTML = `<span>🛑</span> <span>${i18n.currentLang === 'ar' ? 'إيقاف الإملاء' : 'Stop Dictation'}</span>`;
      });

      window.addEventListener('speech-dictation-ended', () => {
        btnDictate.style.background = 'var(--accent-purple)';
        btnDictate.innerHTML = `<span>🎙️</span> <span>${i18n.currentLang === 'ar' ? 'إملاء صوتي' : 'Voice Dictate'}</span>`;
      });

      window.addEventListener('speech-dictation-result', (e) => {
        if (textarea && e.detail.final) {
          textarea.value += e.detail.final;
        }
      });
    }
  },

  setupEventListeners() {
    // Add period button
    const btnAddPeriod = document.getElementById('btn-add-period');
    if (btnAddPeriod) {
      btnAddPeriod.addEventListener('click', () => {
        const title = prompt(i18n.currentLang === 'ar' ? "أدخل اسم الحصة الجديدة:" : "Enter new class title:");
        if (title && title.trim()) {
          const time = prompt(i18n.currentLang === 'ar' ? "أدخل وقت الحصة (مثال: 01:30 - 02:15):" : "Enter time (e.g. 01:30 - 02:15):") || "01:30 - 02:15";
          this.timetable.push({
            id: Date.now(),
            title_en: title,
            title_ar: title,
            time: time,
            icon: "⭐",
            current: false,
            done: false
          });
          this.renderTimetable();
          speechEngine.playSuccessChime();
        }
      });
    }

    // Reset tasks
    const btnResetTasks = document.getElementById('btn-reset-tasks');
    if (btnResetTasks) {
      btnResetTasks.addEventListener('click', () => {
        this.chunkTasks.forEach(t => t.done = false);
        this.renderChunkTasks();
      });
    }

    // Modal Presentation Close buttons
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
