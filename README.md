# Sanad | سند - Determination Companion Web App
> **Empowering students with determination inside school and in real life.**

[![Live Demo](https://img.shields.io/badge/Production-Live%20on%20Vercel-success)](https://sanad-determination-app.vercel.app)
[![WCAG 2.2 AAA](https://img.shields.io/badge/WCAG%202.2-AAA%20Compliant-success)](#)
[![A11y Verified](https://img.shields.io/badge/Accessibility-Chrome%20DevTools%20Audited-blue)](#)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20العربية-purple)](#)
[![Offline Ready](https://img.shields.io/badge/PWA-100%25%20Offline-green)](#)

---

## 🌐 Live Production URL
Access the live web app anywhere on tablet, phone, or desktop:
👉 **[https://sanad-determination-app.vercel.app](https://sanad-determination-app.vercel.app)**

---

## 🌟 Overview

**Sanad (سند)** is an accessible, comprehensive web companion designed specifically for **Students with Determination** (learners who are neurodivergent, have autism, ADHD, speech/language barriers, dyslexia, sensory sensitivities, or physical differences).

The application bridges the gap between **academic classroom life** and **real-world independence**, empowering students with intuitive tools that support communication, regulation, learning, and daily life navigation.

---

## 🚀 Key Modules & Capabilities

### 🏫 1. Inside School Companion
* **Discreet Teacher Communication Cards**: Quick-action cards for students who experience situational mutism or anxiety. Tap to speak or present full-screen to teachers:
  - *"I need a 3-minute sensory break"*
  - *"Please repeat the last instruction slower"*
  - *"The room is too loud. May I wear my headphones?"*
  - *"May I use the quiet restroom?"*
  - *"I need assistance with this question"*
* **Visual Timetable & Class Schedule**: Interactive period schedule with active period indicator, countdown times, and celebratory chimes upon completion.
* **Step-by-Step Task Chunking**: Breaks down large school assignments into manageable bite-sized steps with visual progress bars and celebratory feedback.
* **Smart Reader & Dictation Pad**:
  - Text-to-Speech (TTS) with adjustable speed.
  - Speech-to-Text (STT) voice dictation for students with motor/dysgraphia challenges.

### 🌍 2. Real Life & Community Independence
* **Interactive Social Stories & Life Guides**: Step-by-step illustrated guides with audio read-aloud:
  1. *Ordering food at a cafeteria / restaurant*
  2. *Crossing the street safely at pedestrian crossings*
  3. *Riding the school bus safely*
  4. *What to do if separated or lost*
  5. *Packing school bag the night before*
* **Visual Money & Shopping Helper**: Calculate whether you have enough money in hand: enter item price, tap bills/coins, and calculate change.
* **Daily Hydration Tracker**: 8 interactive glasses with touch-to-drink visual feedback.
* **Evening Backpack Routine**: Checklist to ensure peace of mind for the next day.

### 🗣️ 3. Talk & AAC (Augmentative and Alternative Communication)
* **Symbol & Voice Board**: Categorized PCS tiles (*Urgent*, *Needs*, *Feelings*, *Social*, *Actions*).
* **Sentence Strip Builder**: Tap cards to construct complete sentences and speak them out loud via Web Speech API.
* **Custom Tile Creator**: Students and caregivers can add custom words, emojis, and categories saved locally.

### 🧘 4. Sensory Calm Sanctuary (Decompression Zone)
* **Visual Guided Breathing Bubble**: Box breathing (4-4-4-4), 4-7-8 relaxation, and gentle flow breathing.
* **Procedural Ambient Sound Generator (Web Audio API)**:
  - *Brown Noise*: Proven to soothe ADHD nervous systems and filter background sensory noise.
  - *Gentle Rain*: Lowpass filtered rain texture.
  - *Ocean Waves*: LFO-modulated wave synth.
  - *Zen Singing Bowl*: 528 Hz harmonic chime.
  - *100% offline procedural audio with zero external audio assets.*
* **Zones of Regulation Check-in**: Blue, Green, Yellow, and Red zones with actionable coping exercises (e.g., 5-4-3-2-1 grounding break).

### 🪪 5. Safe Passage & Personal Emergency Card
* **High-Visibility Emergency ID**: Fast one-tap view for bus drivers, emergency helpers, or police.
* **Caregiver Speed Dial**: Direct one-tap phone links.
* **Emergency Alert Chime**: Noticeable non-scary chime for seeking attention.
* **Full-Screen Presenter Mode**: Hold up the tablet/phone screen to communicate critical details.

### 🔍 6. Chrome DevTools & WCAG 2.2 Live Auditor
* Built-in accessibility auditing engine inspired by Chrome DevTools and Lighthouse:
  - Validates interactive touch targets (minimum 48x48px).
  - Checks for orphaned form inputs missing `<label>` tags.
  - Verifies logical heading hierarchies (`h1`, `h2`, `h3` without skipped levels).
  - Checks ARIA labels and discernible button names.
  - Validates document landmark structures (`<header>`, `<nav>`, `<main>`).

---

## ♿ Accessibility First Features

* **Multi-Theme Support**:
  1. *Calm Modern* (Default soft aesthetic)
  2. *High-Contrast Dark* (OLED pure black)
  3. *High-Contrast Light* (True black and white >= 21:1)
  4. *Yellow on Black* (Classic optometry low-vision mode)
  5. *Sensory Pastel* (Low-saturation, muted anti-fatigue mode)
* **Dyslexia-Optimized Typography Toggle**: Enhances letter spacing, word spacing, and line height.
* **Text Scaler**: Scale font size seamlessly from 14px to 28px without breaking layouts.
* **Hover-to-Read (Voice Assist)**: Automatically speaks buttons and cards out loud when hovered or focused.
* **Bilingual Support (English & العربية)**: Complete interface and speech localization with seamless RTL layout switching.
* **Touch-Friendly Tap Targets**: All buttons are strictly >= 48x48px per WCAG / web.dev standards.
* **Keyboard Navigation**: Skip links, logical tab order, and prominent focus indicators.

---

## 💻 How to Run

### Method 1: Open Directly in Any Browser
Simply double-click or open `index.html` in your browser (Google Chrome, Microsoft Edge, Safari, or Firefox):
```bash
# Path to open:
C:\Users\METJAR TAQNI\.gemini\antigravity\scratch\sanad-determination-app\index.html
```

### Method 2: Run via Node.js Server
From the project folder:
```bash
npm start
# or
node server.js
```
Then visit `http://localhost:3300` in your web browser.

---

## 📁 File Structure

```
sanad-determination-app/
├── index.html          # Semantic HTML5 with ARIA landmarks & modal dialogs
├── manifest.json       # PWA manifest for offline installation
├── sw.js               # Service Worker for 100% offline asset caching
├── package.json        # Project metadata and run scripts
├── server.js           # Lightweight zero-dependency HTTP server with auto-port fallback
├── README.md           # Documentation and guide
├── css/
│   └── styles.css      # WCAG AAA styles, responsive grids, & themes
└── js/
    ├── app.js          # Master orchestrator & navigation manager
    ├── i18n.js         # English & Arabic bilingual dictionary
    ├── speech.js       # Web Speech (TTS & STT) & procedural chimes
    ├── school.js       # Timetable, discreet cards, & task chunker
    ├── life.js         # Social stories, money helper, & hydration tracker
    ├── aac.js          # Communication symbol board & sentence builder
    ├── calm.js         # Breathing bubble, brown noise synth, & mood zones
    ├── safecard.js     # Personal emergency ID card & alert chime
    └── auditor.js      # Chrome DevTools & WCAG 2.2 live DOM auditing engine
```
