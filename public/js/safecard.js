/**
 * Sanad - Safe Passage & Personal Emergency Card Module
 * High-visibility ID for non-verbal or stressful moments, emergency chimes, & customizable profile.
 */

const safecardModule = {
  profile: {
    name: "Zaid Al-Mansouri",
    school: "Al Noor Academy | Grade 5",
    help: "• I communicate best using visual cards or short, gentle sentences.\n• Loud noises or sudden crowds may overwhelm me. Please give me 2 minutes in a quiet space.\n• If I am separated or lost, please assist me in contacting my parents below immediately.",
    medical: "Allergies: Peanuts. Uses noise-canceling headphones in loud environments.",
    contact1_name: "Mother: Fatima",
    contact1_phone: "+971501234567",
    contact2_name: "Father: Tariq",
    contact2_phone: "+971509876543"
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
        this.profile = { ...this.profile, ...JSON.parse(saved) };
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
    const nameEl = document.getElementById('safecard-name-display');
    const schoolEl = document.getElementById('safecard-school-display');
    const helpEl = document.getElementById('safecard-help-display');
    const medEl = document.getElementById('safecard-medical-display');
    const phone1El = document.getElementById('safecard-phone1-display');
    const phone2El = document.getElementById('safecard-phone2-display');

    if (nameEl) nameEl.textContent = this.profile.name;
    if (schoolEl) schoolEl.textContent = this.profile.school;
    if (helpEl) helpEl.innerHTML = this.profile.help.replace(/\n/g, '<br>');
    if (medEl) medEl.textContent = this.profile.medical;

    if (phone1El) {
      phone1El.setAttribute('href', `tel:${this.profile.contact1_phone}`);
      phone1El.innerHTML = `<span>👩 ${this.profile.contact1_name}</span> <span aria-hidden="true">📞 Call</span>`;
    }
    if (phone2El) {
      phone2El.setAttribute('href', `tel:${this.profile.contact2_phone}`);
      phone2El.innerHTML = `<span>👨 ${this.profile.contact2_name}</span> <span aria-hidden="true">📞 Call</span>`;
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
        const text = `${this.profile.name} - ${this.profile.school}\n\n${this.profile.help}\n\nEmergency: ${this.profile.contact1_name} (${this.profile.contact1_phone})`;
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
          document.getElementById('input-card-name').value = this.profile.name;
          document.getElementById('input-card-school').value = this.profile.school;
          document.getElementById('input-card-help').value = this.profile.help;
          document.getElementById('input-card-medical').value = this.profile.medical;
          document.getElementById('input-card-contact1').value = this.profile.contact1_phone;
          document.getElementById('input-card-contact2').value = this.profile.contact2_phone;

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
        this.profile.name = document.getElementById('input-card-name').value;
        this.profile.school = document.getElementById('input-card-school').value;
        this.profile.help = document.getElementById('input-card-help').value;
        this.profile.medical = document.getElementById('input-card-medical').value;
        this.profile.contact1_phone = document.getElementById('input-card-contact1').value;
        this.profile.contact2_phone = document.getElementById('input-card-contact2').value;

        this.saveProfile();
        this.renderCard();
        speechEngine.playSuccessChime();
        closeModal();
      });
    }
  }
};
