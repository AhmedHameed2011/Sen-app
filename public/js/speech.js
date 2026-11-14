/**
 * Sanad - Speech & Audio Accessibility Engine
 * Web Speech Synthesis (TTS), Web Speech Recognition (STT), & UI Audio Feedback.
 */

const speechEngine = {
  synth: window.speechSynthesis,
  recognition: null,
  isRecognizing: false,
  hoverReadEnabled: false,
  speechRate: 1.0,
  audioCtx: null,

  init() {
    this.initAudioContext();
    this.initRecognition();
    this.setupHoverReader();
  },

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  },

  /**
   * Speak text out loud in the appropriate voice (English or Arabic)
   */
  speak(text, onEnd) {
    if (!this.synth) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    // Cancel current speaking
    this.synth.cancel();

    if (!text || text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.speechRate;

    // Detect Arabic characters to assign Arabic voice
    const isArabic = /[\u0600-\u06FF]/.test(text);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';

    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      const targetVoice = voices.find(v => isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en'));
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  },

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  },

  /**
   * Speech-to-Text Voice Dictation
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

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

  toggleDictation(lang = 'en') {
    if (!this.recognition) {
      alert(i18n.currentLang === 'ar' 
        ? "متصفحك الحالي لا يدعم الإملاء الصوتي المباشر. يرجى تجربة Chrome أو Edge."
        : "Your browser does not support voice recognition. Please try Google Chrome or Edge.");
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
   * Hover-to-Read: Reads out button or card title when student hovers or focuses it
   */
  setupHoverReader() {
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
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

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
