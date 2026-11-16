/**
 * Sanad - Internationalization & Dual Language Engine (English & Arabic)
 * Provides comprehensive translations and RTL/LTR layout handling.
 * Week 2 patch: added keys for feature detection, timetable modal, persistence.
 */

const i18n = {
  currentLang: 'en',

  translations: {
    en: {
      skip_to_content: "Skip to main content",
      brand_subtitle: "Determination Companion inside School & Real Life",
      font_dyslexic: "Dyslexia Font",
      voice_reader: "Voice Assist",
      emergency_sos: "SOS Help",
      nav_school: "In School",
      nav_life: "Real Life",
      nav_aac: "Talk & AAC",
      nav_calm: "Calm Zone",
      nav_safe: "Safe ID Card",
      nav_audit: "A11y Auditor",

      // School
      school_title: "School Companion",
      school_subtitle: "Your daily classroom schedule, discreet teacher cards, step-by-step homework chunker, and speech reader.",
      add_period_btn: "Add Class",
      discreet_cards_title: "Discreet Teacher Cards",
      discreet_cards_hint: "Tap to speak or show full-screen to teacher",
      timetable_title: "Today's Visual Schedule",
      chunking_title: "Task Chunking (Step-by-Step)",
      reset_tasks: "Reset",
      chunking_desc: "Big assignments are easier when done in small pieces. Check off each step!",
      reader_title: "Smart Reader & Voice Dictation Pad",
      reader_hint: "Reads aloud with word tracking, or speech-to-text dictation",
      reader_label: "Text for reading aloud or dictation",
      btn_read_aloud: "Read Aloud",
      btn_stop_reading: "Stop",
      btn_dictate: "Voice Dictate",
      btn_clear_text: "Clear",
      speed_label: "Speed:",

      // Real Life
      life_title: "Real Life & Community Skills",
      life_subtitle: "Practical social stories, interactive shopping & money calculator, and independent living routines.",
      social_stories_title: "Interactive Life Guides & Social Stories",
      money_title: "Visual Money Helper",
      reset_money: "Reset",
      money_desc: "Calculate your money: enter item price, tap the coins & bills you have, and see if you can buy it!",
      price_label: "Item Price:",
      money_you_have: "You Have In Hand:",
      tap_to_add_money: "Tap bills & coins to add:",
      hydration_title: "Daily Hydration & Wellbeing",
      hydration_desc: "Drinking water keeps your brain sharp and helps you stay calm. Tap to drink a glass!",
      backpack_routine_title: "🎒 Evening Backpack Checklist",

      // AAC
      aac_title: "Talk & AAC Communication Board",
      aac_subtitle: "Express your thoughts, needs, and feelings with tap-to-speak symbols or build complete sentences.",
      add_custom_tile: "Add Custom Tile",
      sentence_empty_hint: "Tap cards below to build your sentence...",
      btn_speak_all: "Speak Sentence",
      cat_all: "All Symbols",
      cat_urgent: "🚨 Urgent",
      cat_needs: "🥤 Needs",
      cat_feelings: "😊 Feelings",
      cat_social: "👋 Social",
      cat_actions: "🏃 Actions",

      // Calm
      calm_title: "Sensory Calm Sanctuary",
      calm_subtitle: "Reset your nervous system with guided visual breathing, soothing procedural soundscapes, and the Zones of Regulation.",
      breathing_title: "🌬️ Guided Rhythm Breathing",
      pause_breathing: "Pause",
      resume_breathing: "Resume",
      sounds_title: "Procedural Sound Generator",
      sounds_hint: "100% Offline Web Audio",
      sounds_desc: "Mask harsh school hallway noises or outside traffic. Adjust volumes to create your perfect sensory cushion.",
      sound_brown: "Brown Noise",
      sound_rain: "Gentle Rain",
      sound_ocean: "Ocean Waves",
      sound_bowl: "Zen Chime",
      btn_ring_chime: "Ring Once",
      zones_title: "How Are You Feeling Right Now? (Zones of Regulation)",
      zones_hint: "Tap your zone to see helpful tools",
      zone_blue_title: "Blue Zone",
      zone_blue_desc: "Sad, Tired, Sick, Slow moving",
      zone_blue_action: "👉 Stretch & Sip Water",
      zone_green_title: "Green Zone",
      zone_green_desc: "Calm, Happy, Focused, Ready to learn",
      zone_green_action: "👉 You are doing awesome!",
      zone_yellow_title: "Yellow Zone",
      zone_yellow_desc: "Frustrated, Worried, Silly, Excited",
      zone_yellow_action: "👉 5-4-3-2-1 Grounding Break",
      zone_red_title: "Red Zone",
      zone_red_desc: "Overwhelmed, Very Angry, Out of control",
      zone_red_action: "👉 Stop & Seek Safe Adult",

      // Safe Card
      safe_title: "Safe Passage & Personal ID Card",
      safe_subtitle: "High-visibility identification card for non-verbal or stressful moments. Show directly to teachers, bus drivers, or helpers.",
      btn_edit_card: "Edit Card",
      btn_present_fullscreen: "Show Fullscreen",
      badge_student_determination: "Student of Determination",
      how_to_help_me_title: "🤝 How to Communicate & Help Me:",
      medical_notes_title: "📋 Medical / Sensory Notes:",
      emergency_contacts_title: "📞 Emergency Contacts (Tap to Call):",
      btn_sound_alert: "Sound Assistance Chime",
      father_label: "Father",
      mother_label: "Mother",
      btn_call: "Call",
      section_father_details: "Father's Contact Details",
      section_mother_details: "Mother's Contact Details",
      label_father_name: "Father's Full Name:",
      label_father_phone: "Father's Phone Number:",
      label_mother_name: "Mother's Full Name:",
      label_mother_phone: "Mother's Phone Number:",

      // Privacy
      privacy_title: "🔒 Your data stays on this device.",
      privacy_desc: "Name, contacts, medical notes, and custom AAC tiles are stored only in this browser's local storage. They are never sent to a server.",
      privacy_wipe: "🗑️ Wipe my data",

      // Auditor
      audit_title: "Chrome DevTools & WCAG 2.2 Live Auditor",
      audit_subtitle: "Integrated accessibility engine that validates contrast ratios, tap targets (48x48px), heading structures, and ARIA landmarks live on this page.",
      btn_run_audit: "Run Full Audit",
      audit_overall_score: "WCAG Compliance Score",
      audit_tap_target: "Tap Targets (≥48px)",
      audit_contrast: "Color Contrast (AA / AAA modes)",
      audit_aria_labels: "Labels & ARIA Names",
      audit_checklist_title: "DevTools Verification Checklist",
      audit_updated_just_now: "Tested Live in DOM",

      // Modals
      btn_speak_again: "Speak Out Loud",
      btn_understood: "Understood / Thank You",
      modal_edit_card_title: "Edit Safe ID Card",
      label_student_name: "Student Name:",
      label_school_grade: "School & Grade:",
      label_how_to_help: "How to Help & Communicate:",
      label_medical_notes: "Medical / Allergy Notes:",
      label_contact1: "Contact 1 (Phone):",
      label_contact2: "Contact 2 (Phone):",
      btn_cancel: "Cancel",
      btn_save: "Save Changes",
      modal_add_tile_title: "Add Custom Communication Tile",
      label_icon_emoji: "Icon or Emoji:",
      label_tile_phrase: "Tile Phrase (Spoken Text):",
      label_tile_category: "Category:",
      btn_create_tile: "Add Tile",

      // Week 2: Speech feature-detection + timetable modal + persistence
      stt_unsupported: "Voice dictation isn't available in this browser. You can type instead.",
      tts_no_voices: "Text-to-speech isn't available on this device.",
      modal_add_period_title: "➕ Add Class Period",
      label_period_name: "Class name:",
      label_period_start: "Start time:",
      label_period_end: "End time:",
      btn_add_period_submit: "Add to Timetable",
      error_period_overlap: "This time overlaps with an existing period.",
      error_period_order: "End time must be after start time.",
      error_period_name: "Please enter a class name.",
      error_period_times: "Please set both start and end times.",
      auditor_features_ok: "All browser features available.",
      auditor_features_deg: "Some features unavailable in this browser (see details)."
    },

    ar: {
      skip_to_content: "انتقل إلى المحتوى الرئيسي",
      brand_subtitle: "الرفيق التمكيني لأصحاب الهمم داخل المدرسة وفي الحياة اليومية",
      font_dyslexic: "خط عسر القراءة",
      voice_reader: "المساعد الصوتي",
      emergency_sos: "طوارئ SOS",
      nav_school: "في المدرسة",
      nav_life: "الحياة الواقعية",
      nav_aac: "التواصل والنطق",
      nav_calm: "واحة الهدوء",
      nav_safe: "بطاقة الهوية الآمنة",
      nav_audit: "مدقق سهولة الوصول",

      // School
      school_title: "رفيق المدرسة",
      school_subtitle: "جدولك الصفي البصري، بطاقات المعلم الذكية، تفكيك الواجبات خطوة بخطوة، وقارئ النصوص الصوتي.",
      add_period_btn: "إضافة حصة",
      discreet_cards_title: "بطاقات المعلم السريعة والسرية",
      discreet_cards_hint: "انقر للنطق أو العرض بملء الشاشة للمعلم",
      timetable_title: "الجدول البصري لليوم",
      chunking_title: "تجزئة المهام (خطوة بخطوة)",
      reset_tasks: "إعادة ضبط",
      chunking_desc: "الواجبات الكبيرة تصبح أسهل حين نقسمها لخطوات صغيرة. ضع علامة بعد كل خطوة!",
      reader_title: "القارئ الذكي ولوحة الإملاء الصوتي",
      reader_hint: "قراءة النصوص بصوت واضح وتتبع الكلمات، أو الكتابة بصوتك",
      reader_label: "نص للقراءة أو الإملاء الصوتي",
      btn_read_aloud: "اقرأ بصوت عالٍ",
      btn_stop_reading: "إيقاف",
      btn_dictate: "إملاء صوتي",
      btn_clear_text: "مسح",
      speed_label: "السرعة:",

      // Real Life
      life_title: "المهارات الحياتية والاستقلالية",
      life_subtitle: "قصص اجتماعية إرشادية تفاعلية، حاسبة النقود والتسوق، وروتين الحياة اليومية.",
      social_stories_title: "القصص الاجتماعية والأدلة التفاعلية",
      money_title: "مساعد النقود البصري",
      reset_money: "إعادة ضبط",
      money_desc: "احسب نقودك: أدخل سعر الغرض، وانقر على العملات التي معك لتعرف هل تكفي!",
      price_label: "سعر السلعة:",
      money_you_have: "النقود بيدك:",
      tap_to_add_money: "انقر على العملات لإضافتها:",
      hydration_title: "شرب الماء وصحة الجسم",
      hydration_desc: "شرب الماء ينشط ذهنك ويساعدك على الهدوء. انقر لشرب كوب!",
      backpack_routine_title: "🎒 قائمة تجهيز الحقيبة المسائية",

      // AAC
      aac_title: "لوحة التواصل البديل والمعزز (AAC)",
      aac_subtitle: "عبر عن أفكارك واحتياجاتك ومشاعرك بلمسة واحدة أو ركّب جملاً كاملة.",
      add_custom_tile: "إضافة رمز مخصص",
      sentence_empty_hint: "انقر على البطاقات أدناه لتكوين جملتك...",
      btn_speak_all: "نطق الجملة",
      cat_all: "جميع الرموز",
      cat_urgent: "🚨 عاجل",
      cat_needs: "🥤 احتياجات",
      cat_feelings: "😊 مشاعر",
      cat_social: "👋 اجتماعي",
      cat_actions: "🏃 أفعال",

      // Calm
      calm_title: "واحة الهدوء الحسي والاسترخاء",
      calm_subtitle: "أعد ضبط جهازك العصبي عبر التنفس الإيقاعي البصري، والأصوات المهدئة، ومقياس المشاعر.",
      breathing_title: "🌬️ تمرين التنفس الإيقاعي الموجه",
      pause_breathing: "إيقاف مؤقت",
      resume_breathing: "استئناف",
      sounds_title: "مولد الأصوات الطبيعية الهادئة",
      sounds_hint: "تعمل بدون إنترنت 100%",
      sounds_desc: "اعزل ضجيج الممرات الصاخبة أو الشارع. اضبط مستويات الصوت لصنع مساحتك الآمنة.",
      sound_brown: "الضجيج البني (لتهدئة التشتت)",
      sound_rain: "صوت المطر الهادئ",
      sound_ocean: "أمواج المحيط",
      sound_bowl: "رنين التأمل",
      btn_ring_chime: "رن مرة واحدة",
      zones_title: "كيف تشعر في هذه اللحظة؟ (مناطق تنظيم المشاعر)",
      zones_hint: "انقر على منطقتك لاكتشاف أفضل أدوات المساعدة",
      zone_blue_title: "المنطقة الزرقاء",
      zone_blue_desc: "حزين، متعب، مريض، حركة بطيئة",
      zone_blue_action: "👉 تمدد واشرب القليل من الماء",
      zone_green_title: "المنطقة الخضراء",
      zone_green_desc: "هادئ، سعيد، مركز، مستعد للتعلم",
      zone_green_action: "👉 رائع جداً! استمر بهذا التركيز",
      zone_yellow_title: "المنطقة الصفراء",
      zone_yellow_desc: "متوتر، قلق، حركي جداً، متشتت",
      zone_yellow_action: "👉 تمرين التركيز الحسي 5-4-3-2-1",
      zone_red_title: "المنطقة الحمراء",
      zone_red_desc: "غاضب جداً، فاقد السيطرة، انفجار حسي",
      zone_red_action: "👉 توقف واطلب مساعدة شخص موثوق",

      // Safe Card
      safe_title: "بطاقة الهوية والعبور الآمن",
      safe_subtitle: "بطاقة تعريفية واضحة جداً للحظات التوتر أو عدم القدرة على الكلام. اعرضها للمعلم أو السائق.",
      btn_edit_card: "تعديل بيانات البطاقة",
      btn_present_fullscreen: "عرض بملء الشاشة",
      badge_student_determination: "طالب من أصحاب الهمم",
      how_to_help_me_title: "🤝 كيف تتواصل معي وتساعدني:",
      medical_notes_title: "📋 ملاحظات طبية وحسية:",
      emergency_contacts_title: "📞 أرقام الطوارئ (انقر للاتصال):",
      btn_sound_alert: "إطلاق نغمة طلب المساعدة",
      father_label: "الأب",
      mother_label: "الأم",
      btn_call: "اتصال",
      section_father_details: "بيانات الأب (الاتصال)",
      section_mother_details: "بيانات الأم (الاتصال)",
      label_father_name: "اسم الأب الكامل:",
      label_father_phone: "رقم هاتف الأب:",
      label_mother_name: "اسم الأم الكامل:",
      label_mother_phone: "رقم هاتف الأم:",

      // Privacy
      privacy_title: "🔒 بياناتك تبقى على هذا الجهاز فقط.",
      privacy_desc: "الاسم وجهات الاتصال والملاحظات الطبية والرموز المخصصة محفوظة فقط في ذاكرة المتصفح المحلية. لا يتم إرسالها إلى أي خادم.",
      privacy_wipe: "🗑️ حذف بياناتي",

      // Auditor
      audit_title: "مدقق سهولة الوصول ومعايير ديف تولز WCAG 2.2",
      audit_subtitle: "محرك فحص مباشر يتحقق من تباين الألوان، أبعاد أزرار اللمس (≥48px)، هيكلية العناوين وتسميات ARIA.",
      btn_run_audit: "بدء الفحص الشامل",
      audit_overall_score: "درجة التوافق مع WCAG",
      audit_tap_target: "أهداف اللمس (≥48px)",
      audit_contrast: "تباين الألوان (AA / أوضاع AAA)",
      audit_aria_labels: "التسميات ومساعدات القراءة",
      audit_checklist_title: "قائمة التحقق المباشرة",
      audit_updated_just_now: "تم الفحص مباشرة في المتصفح",

      // Modals
      btn_speak_again: "نطق بصوت عالٍ",
      btn_understood: "تم الفهم / شكراً لك",
      modal_edit_card_title: "تعديل بطاقة الهوية الآمنة",
      label_student_name: "اسم الطالب:",
      label_school_grade: "المدرسة والصف:",
      label_how_to_help: "طريقة المساعدة والتواصل:",
      label_medical_notes: "ملاحظات طبية وحساسية:",
      label_contact1: "جهة اتصال 1 (الهاتف):",
      label_contact2: "جهة اتصال 2 (الهاتف):",
      btn_cancel: "إلغاء",
      btn_save: "حفظ التغييرات",
      modal_add_tile_title: "إضافة رمز تواصل مخصص",
      label_icon_emoji: "الأيقونة أو الرمز:",
      label_tile_phrase: "العبارة المنطوقة:",
      label_tile_category: "التصنيف:",
      btn_create_tile: "إضافة الرمز",

      // Week 2: Speech feature-detection + timetable modal + persistence
      stt_unsupported: "الإملاء الصوتي غير متاح في هذا المتصفح. يمكنك الكتابة بدلاً من ذلك.",
      tts_no_voices: "تحويل النص إلى كلام غير متاح على هذا الجهاز.",
      modal_add_period_title: "➕ إضافة حصة جديدة",
      label_period_name: "اسم الحصة:",
      label_period_start: "وقت البداية:",
      label_period_end: "وقت النهاية:",
      btn_add_period_submit: "إضافة إلى الجدول",
      error_period_overlap: "هذا الوقت يتعارض مع حصة أخرى.",
      error_period_order: "وقت النهاية يجب أن يكون بعد وقت البداية.",
      error_period_name: "الرجاء إدخال اسم الحصة.",
      error_period_times: "الرجاء تحديد وقت البداية والنهاية.",
      auditor_features_ok: "جميع ميزات المتصفح متاحة.",
      auditor_features_deg: "بعض الميزات غير متاحة في هذا المتصفح (انظر التفاصيل)."
    }
  },

  setLanguage(lang) {
    if (!this.translations[lang]) return;
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[lang][key]) {
        el.textContent = this.translations[lang][key];
      }
    });

    const langIndicator = document.getElementById('lang-indicator');
    if (langIndicator) {
      langIndicator.textContent = (lang === 'ar') ? 'English' : 'العربية';
    }

    window.dispatchEvent(new CustomEvent('app-lang-changed', { detail: { lang } }));
  },

  t(key) {
    return this.translations[this.currentLang][key] || key;
  }
};