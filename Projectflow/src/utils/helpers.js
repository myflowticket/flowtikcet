/**
 * helpers.js
 * ─────────────────────────────────────────────
 * Fonctions utilitaires pures (sans effet de bord).
 * ─────────────────────────────────────────────
 */

import { PRIORITIES } from "../constants/config"; import { FILE_ICONS }  from "../constants/config";

/** Retourne la config d'une priorité par son libellé */ export const getPriority = (label) =>
  PRIORITIES.find(p => p.label === label) || PRIORITIES[2];

/** Retourne l'icône d'un fichier selon son type MIME */ export const getFileIcon = (type = "") => {
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key) || type === key) return icon;
  }
  return FILE_ICONS.default;
};

/** Formate une taille en octets en Ko/Mo lisible */ export const formatFileSize = (bytes) => {
  if (bytes < 1024)    return bytes + " o";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1048576).toFixed(1) + " Mo"; };

