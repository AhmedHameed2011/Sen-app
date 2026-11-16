/**
 * Sanad - Real Life & Community Skills Module
 * Interactive Social Stories, Visual Money Calculator, & Daily Independence Routines.
 * Week 1 a11y patch: money input clamped, storage keys aligned, story tabs get roving keyboard focus.
 */

const lifeModule = {
  currentStoryIndex: 0,
  moneyInHand: 0,
  waterGlassesDrank: 0,

  PRICE_MAX: 10000,
  PRICE_MIN: 0,
  PRICE_STEP: 0.5,

  socialStories: [
    {
      id: "cafeteria",
      title_en: "🍽️ Ordering Food at Cafeteria",
      title_ar: "🍽️ طلب الطعام في المقصف أو المطعم",
      steps_en: [
        "Wait patiently in line behind the line markers without crowding.",
        "Look at the menu pictures or decide what you want beforehand.",
        "Say or show your card: 'May I please have a chicken wrap and apple juice?'",
        "Hand your money or card to the cashier calmly.",
        "Say 'Thank you' and carry your tray with both hands to a clean table."
      ],
      steps_ar: [
        "انتظر في الطابور بهدوء خلف العلامات المحددة دون تدافع.",
        "انظر إلى صور قائمة الطعام واختر وجبتك مسبقاً بهدوء.",
        "قل أو اعرض بطاقتك: 'هل يمكنني الحصول على شطيرة وعصير تفاح رجاءً؟'",
        "سلّم النقود أو بطاقة الدفع إلى المحاسب بهدوء.",
        "قل 'شكراً لك' واحمل صينيتك بكلتا يديك إلى طاولة نظيفة."
      ]
    },
    {
      id: "street",
      title_en: "🚶 Crossing the Street Safely",
      title_ar: "🚶 عبور الشارع بأمان وسلامة",
      steps_en: [
        "Stop at the curb. Never step directly into the road.",
        "Look LEFT, look RIGHT, and look LEFT again for oncoming vehicles.",
        "Wait for the green pedestrian walk signal (walk icon).",
        "Walk straight and steadily across the zebra stripes. Do not run.",
        "Step safely onto the opposite sidewalk and continue your journey."
      ],
      steps_ar: [
        "توقف عند حافة الرصيف. لا تخطُ أبداً داخل الشارع مباشرة.",
        "انظر إلى اليسار، ثم إلى اليمين، ثم إلى اليسار مرة أخرى للتأكد من خلو الطريق.",
        "انتظر حتى تضيء إشارة المشاة باللون الأخضر (صورة الشخص الذي يمشي).",
        "امشِ بثبات وانتباه على خطوط عبور المشاة دون ركض.",
        "اصعد إلى الرصيف المقابل بأمان وتابع طريقك براحة."
      ]
    },
    {
      id: "bus",
      title_en: "🚌 Riding the School Bus",
      title_ar: "🚌 ركوب حافلة المدرسة",
      steps_en: [
        "Wait at the bus stop away from the street until the bus stops completely.",
        "Greet the bus supervisor and driver with a friendly wave or hello.",
        "Walk to your assigned seat and fasten your seatbelt.",
        "Keep your backpack and hands in your own seat area during the ride.",
        "Stay seated until the bus comes to a complete stop at your destination."
      ],
      steps_ar: [
        "انتظر عند نقطة توقف الحافلة بعيداً عن الطريق حتى تتوقف تماماً.",
        "حيِّ المشرف والسائق بابتسامة أو تلويحة ودية.",
        "توجه إلى مقعدك المخصص واربط حزام الأمان فوراً.",
        "حافظ على حقيبتك وأغراضك داخل نطاق مقعدك طوال الرحلة.",
        "ابقَ جالساً حتى تتوقف الحافلة كلياً عند وجهتك."
      ]
    },
    {
      id: "lost",
      title_en: "🧭 What to Do If I Feel Lost",
      title_ar: "🧭 ماذا أفعل إذا تهت أو ابتعدت عن أهلي",
      steps_en: [
        "Stop right where you are. Take 3 deep, slow breaths. You are safe.",
        "Look for a safe helper: a police officer, security guard, or cashier in uniform.",
        "Show them your Sanad Safe ID Card on your phone or emergency card.",
        "Politely say: 'I am lost. Please help me call my guardian.'",
        "Wait calmly beside the helper until your parent or teacher arrives."
      ],
      steps_ar: [
        "توقف في مكانك تماماً. خذ 3 أنفاس عميقة وهادئة. أنت بأمان.",
        "ابحث عن شخص موثوق: شرطي، رجل أمن، أو بائع يرتدي زياً رسمياً.",
        "اعرض له بطاقة الهوية الآمنة في هذا التطبيق أو بطاقتك المعلقة.",
        "قل له بلطف: 'أنا تائه، أرجو مساعدتي بالاتصال بولي أمري.'",
        "انتظر بهدوء بجانب الشخص الموثوق حتى يصل والدك أو معلمك."
      ]
    },
    {
      id: "packing",
      title_en: "🎒 Packing My School Bag",
      title_ar: "🎒 تجهيز حقيبتي المدرسية للمساء",
      steps_en: [
        "Check tomorrow's visual timetable for the books and notebooks needed.",
        "Fill your clean water bottle and pack your healthy lunchbox.",
        "Check your pencil case for pencils, eraser, sharpener, and ruler.",
        "Put your charged learning tablet or laptop into its padded case.",
        "Place your completed backpack next to the front door for tomorrow morning."
      ],
      steps_ar: [
        "راجع الجدول البصري للغد وتأكد من الكتب والدفاتر المطلوبة.",
        "املأ زجاجة الماء النظيفة وجهز صندوق الغداء الصحي.",
        "تفقد مقلمتك وتأكد من وجود الأقلام والممحاة والمسطرة.",
        "ضع جهازك اللوحي أو حاسوبك المشحون في غلافه الواقي.",
        "ضع حقيبتك المجهزة بجانب باب المنزل لتكون مستعداً لصباح الغد."
      ]
    }
  ],

  backpackTasks: [
    { id: 1, text_en: "Check tomorrow's school timetable", text_ar: "مراجعة جدول الحصص للغد", done: true },
    { id: 2, text_en: "Pack textbooks & notebooks", text_ar: "وضع الكتب والدفاتر في الحقيبة", done: true },
    { id: 3, text_en: "Fill water bottle & snacks", text_ar: "ملء زجاجة الماء وتجهيز الوجبة الخفيفة", done: false },
    { id: 4, text_en: "Charge learning device / tablet", text_ar: "شحن الجهاز اللوحي المكتبي", done: false },
    { id: 5, text_en: "Set out school uniform & shoes", text_ar: "تجهيز الزي المدرسي والحذاء", done: false }
  ],

  init() {
    this.renderStoryTabs();
    this.renderActiveStory();
    this.setupMoneyCalculator();
    this.renderWaterGlasses();
    this.renderBackpackTasks();

    window.addEventListener('app-lang-changed', () => {
      this.renderStoryTabs();
      this.renderActiveStory();
      this.updateMoneyDisplay();
      this.renderBackpackTasks();
      this.renderWaterGlasses();
    });
  },

  renderStoryTabs() {
    const tabsContainer = document.getElementById('story-selector-tabs');
    if (!tabsContainer) return;

    const lang = i18n.currentLang;
    tabsContainer.setAttribute('role', 'tablist');

    tabsContainer.innerHTML = this.socialStories.map((story, idx) => {
      const title = (lang === 'ar') ? story.title_ar : story.title_en;
      const activeClass = (idx === this.currentStoryIndex) ? 'active' : '';
      const tabIndex = (idx === this.currentStoryIndex) ? 0 : -1;
      return `
        <button
          class="aac-cat-btn ${activeClass}"
          data-index="${idx}"
          role="tab"
          aria-selected="${idx === this.currentStoryIndex}"
          tabindex="${tabIndex}">
          ${title}
        </button>
      `;
    }).join('');

    const tabs = Array.from(tabsContainer.querySelectorAll('.aac-cat-btn'));

    tabs.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        this.currentStoryIndex = parseInt(btn.getAttribute('data-index'));
        this.renderStoryTabs();
        this.renderActiveStory();
      });
      btn.addEventListener('keydown', (e) => {
        let next = -1;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
          return;
        }
        if (next !== -1) {
          e.preventDefault();
          this.currentStoryIndex = next;
          this.renderStoryTabs();
          this.renderActiveStory();
          const newTabs = tabsContainer.querySelectorAll('.aac-cat-btn');
          if (newTabs[next]) newTabs[next].focus();
        }
      });
    });
  },

  renderActiveStory() {
    const display = document.getElementById('active-story-display');
    if (!display) return;

    const lang = i18n.currentLang;
    const story = this.socialStories[this.currentStoryIndex];
    const title = (lang === 'ar') ? story.title_ar : story.title_en;
    const steps = (lang === 'ar') ? story.steps_ar : story.steps_en;

    display.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <h4 style="font-size: 1.3rem; font-weight: 800;">${title}</h4>
        <button id="btn-read-story" class="tool-btn" style="background: var(--accent-blue); color: #fff;">
          <span aria-hidden="true">🔊</span> <span>${lang === 'ar' ? 'استمع للدليل' : 'Listen to Guide'}</span>
        </button>
      </div>
      <div class="story-steps">
        ${steps.map((step, idx) => `
          <div class="story-step" tabindex="0">
            <div class="step-number" aria-hidden="true">${idx + 1}</div>
            <div style="font-weight: 700; font-size: 1.05rem; line-height: 1.5; flex: 1;">${step}</div>
          </div>
        `).join('')}
      </div>
    `;

    const btnRead = document.getElementById('btn-read-story');
    if (btnRead) {
      btnRead.addEventListener('click', () => {
        const fullText = steps.join('. ');
        speechEngine.speak(fullText);
      });
    }
  },

  setupMoneyCalculator() {
    const priceInput = document.getElementById('input-item-price');
    const moneyBtns = document.querySelectorAll('.money-btn');
    const resetBtn = document.getElementById('btn-money-reset');

    if (priceInput) {
      // Live update as user types
      priceInput.addEventListener('input', () => this.updateMoneyDisplay());
      // Week 1 a11y patch: clamp on change/blur
      priceInput.addEventListener('change', () => {
        const v = parseFloat(priceInput.value);
        if (!Number.isFinite(v) || v < this.PRICE_MIN) {
          priceInput.value = this.PRICE_MIN;
        } else if (v > this.PRICE_MAX) {
          priceInput.value = this.PRICE_MAX;
        } else {
          priceInput.value = Math.round(v * 100) / 100;
        }
        this.updateMoneyDisplay();
      });
    }

    moneyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.getAttribute('data-val'));
        this.moneyInHand = Math.round((this.moneyInHand + val) * 100) / 100;
        this.updateMoneyDisplay();
        speechEngine.playSuccessChime();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.moneyInHand = 0;
        this.updateMoneyDisplay();
      });
    }

    this.updateMoneyDisplay();
  },

  updateMoneyDisplay() {
    const totalDisplay = document.getElementById('money-total-display');
    const statusBadge = document.getElementById('money-status-badge');
    const priceInput = document.getElementById('input-item-price');
    if (!totalDisplay || !statusBadge || !priceInput) return;

    const price = parseFloat(priceInput.value) || 0;
    const lang = i18n.currentLang;
    const currency = (lang === 'ar') ? 'درهم' : '$';

    totalDisplay.textContent = (lang === 'ar')
      ? `${this.moneyInHand.toFixed(2)} ${currency}`
      : `${currency}${this.moneyInHand.toFixed(2)}`;

    if (this.moneyInHand >= price && price > 0) {
      const change = (this.moneyInHand - price).toFixed(2);
      statusBadge.style.background = 'var(--accent-green-light)';
      statusBadge.style.color = 'var(--accent-green)';
      statusBadge.style.borderColor = 'var(--accent-green)';
      statusBadge.textContent = (lang === 'ar')
        ? `✅ نعم يمكنك الشراء! سيعود لك: ${change} درهم`
        : `✅ Yes you can buy it! Change: $${change}`;
    } else {
      const needed = Math.max(0, price - this.moneyInHand).toFixed(2);
      statusBadge.style.background = 'var(--accent-amber-light)';
      statusBadge.style.color = 'var(--accent-amber)';
      statusBadge.style.borderColor = 'var(--accent-amber)';
      statusBadge.textContent = (lang === 'ar')
        ? `⚠️ تحتاج إلى: ${needed} درهم إضافية`
        : `⚠️ Need $${needed} more`;
    }
  },

  renderWaterGlasses() {
    const container = document.getElementById('water-glasses-grid');
    const countBadge = document.getElementById('water-count-badge');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const isFilled = i <= this.waterGlassesDrank;
      const cup = document.createElement('button');
      cup.type = 'button';
      cup.className = 'tool-btn';
      cup.style.minHeight = '60px';
      cup.style.fontSize = '1.6rem';
      cup.style.background = isFilled ? 'var(--accent-blue-light)' : 'var(--bg-surface)';
      cup.style.borderColor = isFilled ? 'var(--accent-blue)' : 'var(--border-subtle)';
      cup.setAttribute('aria-label', i18n.currentLang === 'ar'
        ? `كوب ماء ${i} من 8`
        : `Glass of water ${i} of 8`);
      cup.setAttribute('aria-pressed', isFilled ? 'true' : 'false');
      cup.innerHTML = isFilled ? '🥛💧' : '🥛';

      cup.addEventListener('click', () => {
        if (i <= this.waterGlassesDrank) {
          this.waterGlassesDrank = i - 1;
        } else {
          this.waterGlassesDrank = i;
          speechEngine.playSuccessChime();
        }
        this.renderWaterGlasses();
      });

      container.appendChild(cup);
    }

    if (countBadge) {
      countBadge.textContent = `${this.waterGlassesDrank} / 8 ${i18n.currentLang === 'ar' ? 'أكواب' : 'Glasses'}`;
    }
  },

  renderBackpackTasks() {
    const list = document.getElementById('backpack-routine-list');
    if (!list) return;

    const lang = i18n.currentLang;
    list.innerHTML = this.backpackTasks.map(t => {
      const text = (lang === 'ar') ? t.text_ar : t.text_en;
      const completedClass = t.done ? 'completed' : '';
      return `
        <li class="chunk-task-item ${completedClass}" data-id="${t.id}" tabindex="0" role="checkbox" aria-checked="${t.done}">
          <input type="checkbox" id="backpack-cb-${t.id}" ${t.done ? 'checked' : ''} tabindex="-1">
          <label for="backpack-cb-${t.id}" style="cursor: pointer; flex: 1; font-weight: 700; font-size: 1rem;">${text}</label>
          ${t.done ? '<span aria-hidden="true">✅</span>' : ''}
        </li>
      `;
    }).join('');

    list.querySelectorAll('.chunk-task-item').forEach(item => {
      const toggle = () => {
        const id = parseInt(item.getAttribute('data-id'));
        const task = this.backpackTasks.find(t => t.id === id);
        if (task) {
          task.done = !task.done;
          if (task.done) speechEngine.playSuccessChime();
          this.renderBackpackTasks();
        }
      };
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }
};