/**
 * Sanad - Sensory Calm Sanctuary Module
 * Visual Breathing Bubble, Web Audio Procedural Noise Synthesizers, & Zones of Regulation.
 */

const calmModule = {
  // Breathing state
  breathingInterval: null,
  isBreathingActive: true,
  currentPattern: 'box',
  breathPhase: 0, // 0: inhale, 1: hold, 2: exhale, 3: rest
  breathCounter: 4,

  // Audio nodes for procedural sound generator
  audioCtx: null,
  brownNoiseNode: null,
  brownGainNode: null,
  rainNoiseNode: null,
  rainGainNode: null,
  oceanNoiseNode: null,
  oceanGainNode: null,

  patterns: {
    box: [
      { name_en: "Inhale", name_ar: "شهيق", duration: 4, scale: 1.6, color: "var(--accent-blue-light)" },
      { name_en: "Hold", name_ar: "احبس النفس", duration: 4, scale: 1.6, color: "var(--accent-purple-light)" },
      { name_en: "Exhale", name_ar: "زفير", duration: 4, scale: 1.0, color: "var(--accent-green-light)" },
      { name_en: "Rest", name_ar: "استرح", duration: 4, scale: 1.0, color: "var(--bg-surface-hover)" }
    ],
    calm: [
      { name_en: "Inhale", name_ar: "شهيق", duration: 4, scale: 1.6, color: "var(--accent-blue-light)" },
      { name_en: "Hold", name_ar: "احبس النفس", duration: 7, scale: 1.6, color: "var(--accent-purple-light)" },
      { name_en: "Exhale", name_ar: "زفير ببطء", duration: 8, scale: 1.0, color: "var(--accent-green-light)" }
    ],
    gentle: [
      { name_en: "Inhale", name_ar: "شهيق هادئ", duration: 3, scale: 1.5, color: "var(--accent-blue-light)" },
      { name_en: "Exhale", name_ar: "زفير هادئ", duration: 3, scale: 1.0, color: "var(--accent-green-light)" }
    ]
  },

  init() {
    this.startBreathing();
    this.setupBreathingControls();
    this.setupSoundControls();
    this.setupZones();

    window.addEventListener('app-lang-changed', () => {
      this.updateBreathingUI();
    });
  },

  startBreathing() {
    if (this.breathingInterval) clearInterval(this.breathingInterval);
    const pattern = this.patterns[this.currentPattern];
    this.breathPhase = 0;
    this.breathCounter = pattern[0].duration;

    this.updateBreathingUI();

    this.breathingInterval = setInterval(() => {
      if (!this.isBreathingActive) return;

      this.breathCounter--;
      if (this.breathCounter <= 0) {
        // Next phase
        this.breathPhase = (this.breathPhase + 1) % pattern.length;
        this.breathCounter = pattern[this.breathPhase].duration;
        this.playGentleTick();
      }
      this.updateBreathingUI();
    }, 1000);
  },

  updateBreathingUI() {
    const circle = document.getElementById('breathing-circle-inner');
    const instruction = document.getElementById('breathing-instruction');
    const countdown = document.getElementById('breathing-countdown');
    if (!circle || !instruction || !countdown) return;

    const pattern = this.patterns[this.currentPattern];
    const current = pattern[this.breathPhase];
    const lang = i18n.currentLang;

    instruction.textContent = (lang === 'ar') ? current.name_ar : current.name_en;
    countdown.textContent = this.breathCounter;
    circle.style.transform = `scale(${current.scale})`;
    circle.style.transition = `transform ${current.duration}s ease-in-out`;
  },

  playGentleTick() {
    if (!speechEngine.audioCtx) return;
    try {
      const now = speechEngine.audioCtx.currentTime;
      const osc = speechEngine.audioCtx.createOscillator();
      const gain = speechEngine.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(speechEngine.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  },

  setupBreathingControls() {
    const btnToggle = document.getElementById('btn-toggle-breathing');
    const patternSelect = document.getElementById('select-breathing-pattern');

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        this.isBreathingActive = !this.isBreathingActive;
        const icon = document.getElementById('breathing-btn-icon');
        const text = document.getElementById('breathing-btn-text');
        if (this.isBreathingActive) {
          icon.textContent = '⏸️';
          text.textContent = i18n.t('pause_breathing');
        } else {
          icon.textContent = '▶️';
          text.textContent = i18n.t('resume_breathing');
        }
      });
    }

    if (patternSelect) {
      patternSelect.addEventListener('change', () => {
        this.currentPattern = patternSelect.value;
        this.startBreathing();
      });
    }
  },

  /**
   * Procedural Web Audio Sound Generator
   */
  ensureAudioCtx() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  /**
   * Brown Noise Generator (ADHD sensory calming)
   */
  getOrCreateBrownNoise() {
    this.ensureAudioCtx();
    if (!this.brownNoiseNode) {
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.brownGainNode = this.audioCtx.createGain();
      this.brownGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);

      whiteNoise.connect(this.brownGainNode);
      this.brownGainNode.connect(this.audioCtx.destination);
      whiteNoise.start(0);

      this.brownNoiseNode = whiteNoise;
    }
    return this.brownGainNode;
  },

  /**
   * Gentle Rain Procedural Sound Generator
   */
  getOrCreateRainNoise() {
    this.ensureAudioCtx();
    if (!this.rainNoiseNode) {
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

      this.rainGainNode = this.audioCtx.createGain();
      this.rainGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);

      source.connect(filter);
      filter.connect(this.rainGainNode);
      this.rainGainNode.connect(this.audioCtx.destination);
      source.start(0);

      this.rainNoiseNode = source;
    }
    return this.rainGainNode;
  },

  /**
   * Ocean Waves Procedural Synthesizer (LFO modulated)
   */
  getOrCreateOceanNoise() {
    this.ensureAudioCtx();
    if (!this.oceanNoiseNode) {
      const bufferSize = 3 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

      // LFO for wave ebb and flow
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.audioCtx.currentTime); // 8 second wave cycle
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(300, this.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(0);

      this.oceanGainNode = this.audioCtx.createGain();
      this.oceanGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);

      source.connect(filter);
      filter.connect(this.oceanGainNode);
      this.oceanGainNode.connect(this.audioCtx.destination);
      source.start(0);

      this.oceanNoiseNode = source;
    }
    return this.oceanGainNode;
  },

  /**
   * Zen Singing Bowl Chime (528 Hz Healing Harmonic)
   */
  playZenChime() {
    this.ensureAudioCtx();
    const now = this.audioCtx.currentTime;

    const freqs = [528, 528 * 1.5, 528 * 2.05];
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const peakGain = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 3.5);
    });
  },

  setupSoundControls() {
    const sliderBrown = document.getElementById('slider-brown');
    const labelBrown = document.getElementById('label-vol-brown');
    const sliderRain = document.getElementById('slider-rain');
    const labelRain = document.getElementById('label-vol-rain');
    const sliderOcean = document.getElementById('slider-ocean');
    const labelOcean = document.getElementById('label-vol-ocean');
    const btnChime = document.getElementById('btn-play-chime');

    if (sliderBrown) {
      sliderBrown.addEventListener('input', () => {
        const val = parseFloat(sliderBrown.value);
        labelBrown.textContent = `${Math.round(val * 100)}%`;
        const gain = this.getOrCreateBrownNoise();
        gain.gain.setValueAtTime(val * 0.4, this.audioCtx.currentTime);
      });
    }

    if (sliderRain) {
      sliderRain.addEventListener('input', () => {
        const val = parseFloat(sliderRain.value);
        labelRain.textContent = `${Math.round(val * 100)}%`;
        const gain = this.getOrCreateRainNoise();
        gain.gain.setValueAtTime(val * 0.5, this.audioCtx.currentTime);
      });
    }

    if (sliderOcean) {
      sliderOcean.addEventListener('input', () => {
        const val = parseFloat(sliderOcean.value);
        labelOcean.textContent = `${Math.round(val * 100)}%`;
        const gain = this.getOrCreateOceanNoise();
        gain.gain.setValueAtTime(val * 0.6, this.audioCtx.currentTime);
      });
    }

    if (btnChime) {
      btnChime.addEventListener('click', () => {
        this.playZenChime();
      });
    }
  },

  setupZones() {
    const zoneCards = document.querySelectorAll('.zone-card');
    zoneCards.forEach(card => {
      card.addEventListener('click', () => {
        const zone = card.getAttribute('data-zone');
        this.handleZoneSelection(zone);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const zone = card.getAttribute('data-zone');
          this.handleZoneSelection(zone);
        }
      });
    });
  },

  handleZoneSelection(zone) {
    const lang = i18n.currentLang;
    let message = "";
    let icon = "🌟";

    if (zone === 'blue') {
      icon = "🔵";
      message = (lang === 'ar')
        ? "أنت في المنطقة الزرقاء (متعب أو حزين). خذ رشفة ماء، وتمدد بلطف، أو استمع لصوت المطر الهادئ هنا."
        : "You are in the Blue Zone (tired or low energy). Drink some cool water, do a gentle stretch, or turn on the gentle rain sound.";
    } else if (zone === 'green') {
      icon = "🟢";
      message = (lang === 'ar')
        ? "رائع جداً! أنت في المنطقة الخضراء (هادئ ومستعد). استمر في التعلم والاستمتاع بيومك!"
        : "Awesome! You are in the Green Zone (calm, focused, ready). Keep up this fantastic focus!";
    } else if (zone === 'yellow') {
      icon = "🟡";
      message = (lang === 'ar')
        ? "أنت في المنطقة الصفراء (قلق أو متوتر). جرب تمرين التركيز: انظر حولك ولاحظ 3 أشياء يمكنك رؤيتها، وخذ 3 أنفاس مع الفقاعة."
        : "You are in the Yellow Zone (wiggly, worried, or frustrated). Try the 5-4-3-2-1 grounding exercise and breathe with the bubble.";
    } else if (zone === 'red') {
      icon = "🔴";
      message = (lang === 'ar')
        ? "أنت في المنطقة الحمراء (مشاعر شديدة وانفجار حسي). توقف تماماً، ضع يدك على صدرك، واعرض بطاقة المساعدة لمعلمك أو الشخص الموثوق."
        : "You are in the Red Zone (overwhelmed or very angry). Stop safely, take deep breaths, and show your Safe ID Card to a trusted adult.";
    }

    speechEngine.speak(message);
    schoolModule.presentFullscreen(icon, message);
  }
};
