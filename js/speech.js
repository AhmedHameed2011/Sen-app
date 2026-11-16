/**
 * Sanad - Speech & Audio Accessibility Engine
 * Web Speech Synthesis (TTS), Web Speech Recognition (STT), & UI Audio Feedback.
 * Week 2 patch: feature detection, graceful STT/TTS degradation,
 * hover-to-read scoped to hover-capable devices, voice warm-up.
 */

// Feature detection run once at module load
const SPEECH_SUPPORT = (function detectSupport() {
  if (typeof window === 'undefined') {
    return { tts: false, stt: false, audio: false, canHover: false };
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const canHover = (typeof window.matchMedia === 'function')
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : false;
  return {
    tts: 'speechSynthesis' in window,
    stt: !!SR,
    audio: !!AudioCtx,
    canHover
  };
})();

const speechEngine = {
  support: SPEECH_SUPPORT,
  synth: (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null,
  recognition: null,
  isRecognizing: false,
  hoverReadEnabled: false,
  speechRate: 1.0,
  audioCtx: null,
  _voicesLoaded: false,
  _pendingSpeak: null,

  init() {
    this.initAudioContext();
    this.initVoices();
    this.initRecognition();
    this.setupHoverReader();
  },

  initAudioContext() {
    if (!this.support.audio) {
      console.info('[speechEngine] Web Audio unavailable — chimes disabled.');
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn('[speechEngine] AudioContext creation failed', e);
      this.audioCtx = null;
    }
  },

  /**
   * Voices are loaded asynchronously in most browsers (especially Chrome).
   * We warm the cache and, if a speak() call arrives before voices are ready,
   * we queue it and replay when they land.
   */
  initVoices() {
    if (!this.synth) return;

    const tryLoad = () => {
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        this._voicesLoaded = true;
        if (this._pendingSpeak) {
          const { text, onEnd } = this._pendingSpeak;
          this._pendingSpeak = null;
          this.speak(text, onEnd);
        }
      }
    };

    tryLoad();
    if (typeof this.synth.addEventListener === 'function') {
      this.synth.addEventListener('voiceschanged', tryLoad);
    } else {
      this.synth.onvoiceschanged = tryLoad;
    }
  },

  /**
   * Speak text out loud. Silently no-ops if TTS is unavailable
   * (rather than alerting — better for AAC context).
   */
  speak(text, onEnd) {
    if (!this.support.tts || !this.synth) {
      // Graceful no-op — announce to screen reader only
      this._announce('Text to speech is unavailable on this device.');
      return;
    }

    // Cancel current speaking
    this.synth.cancel();

    if (!text || text.trim() === '') return;

    // If voices haven't loaded yet, queue and retry after voiceschanged fires.
    const voices = this.synth.getVoices();
    if ((!voices || voices.length === 0) && !this._voicesLoaded) {
      this._pendingSpeak = { text, onEnd };
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;

    // Detect Arabic characters to assign Arabic voice
    const isArabic = /[\u0600-\u06FF]/.test(text);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';

    if (voices && voices.length > 0) {
      const targetVoice = voices.find(v =>
        isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en')
      );
      if (targetVoice) utterance.voice = targetVoice;
    }

    if (onEnd) utterance.onend = onEnd;

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('[speechEngine] speak() failed', e);
    }
  },

  stopSpeaking() {
    if (this.synth) this.synth.cancel();
  },

  _announce(msg) {
    const sr = document.getElementById('sr-alert');
    if (sr) sr.textContent = msg;
  },

  /**
   * Speech-to-Text Voice Dictation
   */
  initRecognition() {
    if (!this.support.stt) {
      console.info('[speechEngine] Speech Recognition unavailable in this browser.');
      // Disable the dictate button up-front so users see the reason
      this._disableDictateButton();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      window.dispatchEvent(new CustomEvent('speech-dictation-result', {
        detail: { final: finalTranscript, interim: interimTranscript }
      }));
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech Recognition error", event.error);
      this.isRecognizing = false;
      window.dispatchEvent(new CustomEvent('speech-dictation-ended'));
    };

    this.recognition.onend = () => {
      this.isRecognizing = false;
      window.dispatchEvent(new CustomEvent('speech-dictation-ended'));
    };
  },

  _disableDictateButton() {
    // We defer this to DOMContentLoaded because init() may run before the button exists
    const applyDisabled = () => {
      const btn = document.getElementById('btn-stt-record');
      if (!btn) return;
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('title', 'Voice dictation is not available in this browser');
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      const hint = document.getElementById('stt-unsupported-hint');
      if (hint) hint.hidden = false;
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyDisabled, { once: true });
    } else {
      applyDisabled();
    }
  },

  toggleDictation(lang = 'en') {
    if (!this.recognition) {
      // Should rarely hit because we disable the button, but guard anyway.
      const msg = (typeof i18n !== 'undefined' && i18n.currentLang === 'ar')
        ? "الإملاء الصوتي غير متاح في هذا المتصفح. يمكنك الكتابة بدلاً من ذلك."
        : "Voice dictation is not available in this browser. You can type instead.";
      this._announce(msg);
      return;
    }

    if (this.isRecognizing) {
      this.recognition.stop();
      this.isRecognizing = false;
      window.dispatchEvent(new CustomEvent('speech-dictation-ended'));
    } else {
      this.recognition.lang = (lang === 'ar') ? 'ar-SA' : 'en-US';
      try {
        this.recognition.start();
        this.isRecognizing = true;
        window.dispatchEvent(new CustomEvent('speech-dictation-started'));
      } catch (err) {
        console.warn("Dictation start error", err);
      }
    }
  },

  /**
   * Hover-to-Read: only attached on devices with real hover capability
   * (mouse/trackpad). Touch devices skip entirely — no accidental speaking.
   */
  setupHoverReader() {
    if (!this.support.canHover) {
      console.info('[speechEngine] Hover-to-read disabled (no hover-capable pointer).');
      return;
    }

    let hoverTimeout = null;

    document.addEventListener('mouseover', (e) => {
      if (!this.hoverReadEnabled) return;

      const target = e.target.closest('button, [role="button"], .aac-tile, .discreet-btn, .zone-card');
      if (!target) return;

      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        const textToRead = target.getAttribute('aria-label') || target.innerText || target.getAttribute('title');
        if (textToRead && textToRead.trim().length > 0) {
          this.speak(textToRead.trim());
        }
      }, 350);
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  },

  /**
   * Plays a pleasant celebratory chime using Web Audio API
   */
  playSuccessChime() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn("Chime error", e);
    }
  },

  /**
   * Loud noticeable emergency assistance alert chime
   */
  playEmergencyChime() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.25);
      osc.frequency.linearRampToValueAtTime(880, now + 0.5);
      osc.frequency.linearRampToValueAtTime(440, now + 0.75);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn("Emergency chime error", e);
    }
  }
};