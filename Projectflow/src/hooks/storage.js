/**
 * storage.js
 * ─────────────────────────────────────────────
 * Adaptateur de stockage universel.
 *
 * - Dans Claude       : utilise window.storage (API propriétaire)
 * - Sur Vercel/browser: utilise localStorage
 *
 * Grâce à cet adaptateur, le reste du code
 * n'a pas besoin de savoir où il tourne.
 * ─────────────────────────────────────────────
 */

export const storage = {
  /** Stockage partagé (visible par tous les utilisateurs) */
  get: async (key) => {
    if (window.storage) return window.storage.get(key, true);
    const value = localStorage.getItem(key);
    return value ? { value } : null;
  },

  set: async (key, value) => {
    if (window.storage) return window.storage.set(key, value, true);
    localStorage.setItem(key, value);
    return { value };
  },

  /** Stockage privé (propre à chaque utilisateur) */
  getPrivate: async (key) => {
    if (window.storage) return window.storage.get(key, false);
    const value = localStorage.getItem("pv_" + key);
    return value ? { value } : null;
  },

  setPrivate: async (key, value) => {
    if (window.storage) return window.storage.set(key, value, false);
    localStorage.setItem("pv_" + key, value);
    return { value };
  },
};

