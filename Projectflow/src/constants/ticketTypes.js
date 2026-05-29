/**
 * ticketTypes.js
 * ─────────────────────────────────────────────
 * Types de tickets disponibles dans l'application.
 * Pour ajouter un type → ajoutez une entrée ici.
 * ─────────────────────────────────────────────
 */

export const TICKET_TYPES = [
  { id: "anomalie",  label: "Anomalie",  icon: "🐛", color: "#E03131", bg: "#FFF5F5" },
  { id: "evolution", label: "Évolution", icon: "✨", color: "#3B5BDB", bg: "#EEF2FF" },
  { id: "tache",     label: "Tâche",     icon: "📋", color: "#E67E22", bg: "#FFF8F0" },
  { id: "question",  label: "Question",  icon: "❓", color: "#2F9E44", bg: "#EBFBEE" },
];

/**
 * Retourne un type par son ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export const getTicketType = (id) => TICKET_TYPES.find(t => t.id === id) || TICKET_TYPES[2];
