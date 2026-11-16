/**
 * Sanad - Privacy helpers
 * Central list of what we persist, plus wipe utilities.
 * Update STORAGE_KEYS when modules add new keys.
 */
const SanadPrivacy = {
  STORAGE_KEYS: [
    'sanad_safe_profile',
    'sanad_custom_aac_tiles',
    'sanad_hydration_count',
    'sanad_theme',
    'sanad_font_scale',
    'sanad_dyslexic',
    'sanad_lang'
  ],

  wipeAll() {
    let removed = 0;
    for (const k of this.STORAGE_KEYS) {
      if (localStorage.getItem(k) !== null) {
        localStorage.removeItem(k);
        removed++;
      }
    }
    return removed;
  },

  hasAnyData() {
    return this.STORAGE_KEYS.some(k => localStorage.getItem(k) !== null);
  }
};