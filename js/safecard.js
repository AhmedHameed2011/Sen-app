/**
 * Sanad - Safe Passage & Personal Emergency Card Module
 * High-visibility ID for non-verbal or stressful moments, emergency chimes,
 * customizable student details, Father and Mother contact cards.
 * Week 1 a11y patch: privacy banner + wipe-data button.
 */

const safecardModule = {
  profile: {
    name: "زيد المنصوري",
    school: "مدرسة الظاهر للشراكات التعليمية | الصف السادس",
    father_name: "طارق المنصوري",
    father_phone: "+971500000000",
    mother_name: "ام زايد",
    mother_phone: "+971500000000",
    help: "• أتواصل بشكل أفضل باستخدام البطاقات البصرية أو الجمل القصيرة والهادئة.\n• الأصوات العالية أو الزحام المفاجئ قد يسبب لي توتراً حسياً. أرجو إعطائي دقيقتين في مكان هادئ.\n• إذا كنت تائهاً، أرجو مساعدتي بالاتصال بوالديّ فوراً على الأرقام أدناه.",
    medical: "حساسية: الفول السوداني. يستخدم سماعات عازلة للضوضاء في البيئات الصاخبة."
  },

  init() {
    this.loadProfile();
    this.renderCard();
    this.setupEventListeners();

    window.addEventListener('app-lang-changed', () => {
      this.renderCard();
    });
  },

  loadProfile() {
    try {
      const saved = localStorage.getItem('sanad_safe_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration if legacy keys exist
        if (parsed.contact1_phone && !parsed.mother_phone) {
          parsed.mother_phone = parsed.contact1_phone;
          parsed.mother_name = parsed.contact1_name
            ? parsed.contact1_name.replace(/Mother:?\s*/i, '').replace(/الأم:?\s*/i, '')
            : "ام زايد";
        }
        if (parsed.contact2_phone && !parsed.father_phone) {
          parsed.father_phone = parsed.contact2_phone;
          parsed.father_name = parsed.contact2_name
            ? parsed.contact2_name.replace(/Father:?\s*/i, '').replace(/الأب:?\s*/i, '')
            : "طارق المنصوري";
        }
        this.profile = { ...this.profile, ...parsed };
      }
    } catch (e) {
      console.warn("Could not load safe profile", e);
    }
  },

  saveProfile() {
    try {
      localStorage.setItem('sanad_safe_profile', JSON.stringify(this.profile));
    } catch (e) {
      console.warn("Could not save safe profile", e);
    }
  },

  renderCard() {
    const isAr = (i18n.currentLang === 'ar');
    const nameEl = document.getElementById('safecard-name-display');
    const schoolEl = document.getElementById('safecard-school-display');
    const helpEl = document.getElementById('safecard-help-display');
    const medEl = document.getElementById('safecard-medical-display');
    const fatherCardEl = document.getElementById('safecard-father-display');
    const motherCardEl = document.getElementById('safecard-mother-display');

    if (nameEl) nameEl.textContent = this.profile.name || (isAr ? "زيد المنصوري" : "Zaid Al-Mansouri");
    if (schoolEl) schoolEl.textContent = this.profile.school || (isAr ? "مدرسة الظاهر للشراكات التعليمية | الصف السادس" : "Al Dhaher School for Educational Partnerships | Grade 6");
    if (helpEl) helpEl.innerHTML = (this.profile.help || "").replace(/\n/g, '<br>');
    if (medEl) medEl.textContent = this.profile.medical || "";

    const fatherRole = isAr ? "الأب" : "Father";
    const motherRole = isAr ? "الأم" : "Mother";
    const callText = isAr ? "اتصال" : "Call";

    if (fatherCardEl) {
      const fName = this.profile.father_name || (isAr ? "طارق المنصوري" : "Tariq Al-Mansouri");
      const fPhone = this.profile.father_phone || "+971509876543";
      fatherCardEl.setAttribute('href', `tel:${fPhone}`);
      fatherCardEl.setAttribute('aria-label', `${fatherRole}: ${fName}, ${callText}`);
      fatherCardEl.innerHTML = `
        <div class="contact-info-wrap">
          <div class="contact-avatar-icon" aria-hidden="true">👨</div>
          <div class="contact-details-text">
            <span class="contact-role-badge">${fatherRole}</span>
            <span class="contact-person-name">${fName}</span>
            <span class="contact-person-phone" dir="ltr">${fPhone}</span>
          </div>
        </div>
        <div class="contact-call-btn">
          <span>${callText}</span>
          <span aria-hidden="true">📞</span>
        </div>
      `;
    }

    if (motherCardEl) {
      const mName = this.profile.mother_name || (isAr ? "فاطمة الزهراء" : "Um Zayed");
      const mPhone = this.profile.mother_phone || "+971501234567";
      motherCardEl.setAttribute('href', `tel:${mPhone}`);
      motherCardEl.setAttribute('aria-label', `${motherRole}: ${mName}, ${callText}`);
      motherCardEl.innerHTML = `
        <div class="contact-info-wrap">
          <div class="contact-avatar-icon" aria-hidden="true">👩</div>
          <div class="contact-details-text">
            <span class="contact-role-badge">${motherRole}</span>
            <span class="contact-person-name">${mName}</span>
            <span class="contact-person-phone" dir="ltr">${mPhone}</span>
          </div>
        </div>
        <div class="contact-call-btn">
          <span>${callText}</span>
          <span aria-hidden="true">📞</span>
        </div>
      `;
    }
  },

  setupEventListeners() {
    // Sound assistance chime button
    const btnLoudChime = document.getElementById('btn-loud-chime');
    if (btnLoudChime) {
      btnLoudChime.addEventListener('click', () => {
        speechEngine.playEmergencyChime();
        speechEngine.speak(i18n.currentLang === 'ar'
          ? "أنا بحاجة إلى مساعدة، يرجى الاطلاع على بطاقة الهوية الآمنة"
          : "I need assistance, please look at my Safe ID Card");
      });
    }

    // Show Fullscreen Presenter
    const btnPresent = document.getElementById('btn-present-safecard');
    if (btnPresent) {
      btnPresent.addEventListener('click', () => {
        const isAr = (i18n.currentLang === 'ar');
        const text = `${this.profile.name} - ${this.profile.school}\n\n${this.profile.help}\n\n${isAr ? 'الأب' : 'Father'}: ${this.profile.father_name} (${this.profile.father_phone})\n${isAr ? 'الأم' : 'Mother'}: ${this.profile.mother_name} (${this.profile.mother_phone})`;
        schoolModule.presentFullscreen("🪪", text);
      });
    }

    // Edit modal
    const btnEdit = document.getElementById('btn-edit-safecard');
    const modal = document.getElementById('modal-edit-safecard');
    const btnClose = document.getElementById('btn-close-safecard-modal');
    const btnCancel = document.getElementById('btn-cancel-safecard');
    const form = document.getElementById('form-edit-safecard');

    const closeModal = () => {
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    };

    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        if (modal) {
          document.getElementById('input-card-name').value = this.profile.name || '';
          document.getElementById('input-card-school').value = this.profile.school || '';
          document.getElementById('input-card-father-name').value = this.profile.father_name || '';
          document.getElementById('input-card-father-phone').value = this.profile.father_phone || '';
          document.getElementById('input-card-mother-name').value = this.profile.mother_name || '';
          document.getElementById('input-card-mother-phone').value = this.profile.mother_phone || '';
          document.getElementById('input-card-help').value = this.profile.help || '';
          document.getElementById('input-card-medical').value = this.profile.medical || '';

          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
        }
      });
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.profile.name = document.getElementById('input-card-name').value.trim();
        this.profile.school = document.getElementById('input-card-school').value.trim();
        this.profile.father_name = document.getElementById('input-card-father-name').value.trim();
        this.profile.father_phone = document.getElementById('input-card-father-phone').value.trim();
        this.profile.mother_name = document.getElementById('input-card-mother-name').value.trim();
        this.profile.mother_phone = document.getElementById('input-card-mother-phone').value.trim();
        this.profile.help = document.getElementById('input-card-help').value.trim();
        this.profile.medical = document.getElementById('input-card-medical').value.trim();

        this.saveProfile();
        this.renderCard();
        speechEngine.playSuccessChime();
        closeModal();
      });
    }

    // Week 1 a11y patch: wipe-data button
    const btnWipe = document.getElementById('btn-wipe-data');
    if (btnWipe) {
      btnWipe.addEventListener('click', () => {
        const isAr = i18n.currentLang === 'ar';
        const msg = isAr
          ? 'سيتم حذف جميع بيانات البطاقة والبطاقات المخصصة من هذا المتصفح نهائياً. هل أنت متأكد؟'
          : 'This will permanently delete the Safe Card, custom AAC tiles, and all settings from this browser. Continue?';
        if (!window.confirm(msg)) return;

        const n = (typeof SanadPrivacy !== 'undefined') ? SanadPrivacy.wipeAll() : 0;

        this.profile = {
          name: isAr ? "زيد المنصوري" : "Zaid Al-Mansouri",
          school: isAr ? "أكاديمية النور | الصف الخامس" : "Al Noor Academy | Grade 5",
          father_name: isAr ? "طارق المنصوري" : "Tariq Al-Mansouri",
          father_phone: "+971509876543",
          mother_name: isAr ? "ام زايد" : " Um zayed",
          mother_phone: "+971501234567",
          help: "",
          medical: ""
        };
        this.renderCard();

        const done = isAr
          ? `تم حذف ${n} عنصر بيانات. تم إعادة التعيين.`
          : `Deleted ${n} stored item(s). Reset to defaults.`;
        const sr = document.getElementById('sr-alert');
        if (sr) sr.textContent = done;
      });
    }
  }
};