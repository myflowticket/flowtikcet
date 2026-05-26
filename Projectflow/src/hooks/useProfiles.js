
/**
 * useProfiles.js
 * ─────────────────────────────────────────────
 * Hook de gestion des droits utilisateurs.
 * Charge, sauvegarde les profils et expose
 * les fonctions canDo() et canSee().
 * ─────────────────────────────────────────────
 */

import { useState, useEffect } from "react"; import { PROFILES_STORAGE_KEY } from "../constants/config"; import { DEFAULT_USER_PROFILES } from "../constants/roles"; import { storage } from "./storage";

export function useProfiles() {
  const [profiles, setProfiles] = useState(DEFAULT_USER_PROFILES);

  // ── Chargement des profils au démarrage
  useEffect(() => {
    storage.get(PROFILES_STORAGE_KEY).then(r => {
      if (r?.value) setProfiles(JSON.parse(r.value));
    }).catch(() => {});
  }, []);

  // ── Sauvegarde les profils dans le stockage
  const saveProfiles = async (updated) => {
    setProfiles(updated);
    await storage.set(PROFILES_STORAGE_KEY, JSON.stringify(updated));
  };

  /**
   * Vérifie si un utilisateur peut effectuer une action.
   * @param {number} userId
   * @param {string} action  — ex: "create_ticket", "delete_ticket"
   * @returns {boolean}
   */
  const canDo = (userId, action) => {
    const p = profiles[userId];
    if (!p) return false;
    if (p.roles?.includes("admin")) return true;
    return p.actions?.includes(action) || false;
  };

  /**
   * Vérifie si un utilisateur peut voir un écran.
   * @param {number} userId
   * @param {string} screen — ex: "kanban", "reports", "admin"
   * @returns {boolean}
   */
  const canSee = (userId, screen) => {
    const p = profiles[userId];
    if (!p) return false;
    if (p.roles?.includes("admin")) return true;
    return p.screens?.includes(screen) || false;
  };

  return { profiles, saveProfiles, canDo, canSee }; }

