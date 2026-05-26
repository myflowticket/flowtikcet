/**
 * config.js
 * ─────────────────────────────────────────────
 * Toutes les constantes de configuration de l'app.
 * Pour modifier une colonne, une priorité ou une
 * action workflow → c'est ici et nulle part ailleurs.
 * ─────────────────────────────────────────────
 */

// ── Colonnes du tableau Kanban
export const COLUMNS = ["À faire", "En cours", "En révision", "Terminé"];

// ── Configuration visuelle de chaque colonne export const COL_CFG = {
  "À faire":     { icon: "○", color: "#868E96", bg: "#F8F9FA", dot: "#ADB5BD" },
  "En cours":    { icon: "◐", color: "#E67E22", bg: "#FFF8F0", dot: "#E67E22" },
  "En révision": { icon: "◑", color: "#3B5BDB", bg: "#EEF2FF", dot: "#3B5BDB" },
  "Terminé":     { icon: "●", color: "#2F9E44", bg: "#EBFBEE", dot: "#2F9E44" },
};

// ── Niveaux de priorité
export const PRIORITIES = [
  { label: "Critique", color: "#E03131", bg: "#FFF5F5", icon: "🔥" },
  { label: "Haute",    color: "#E67E22", bg: "#FFF8F0", icon: "⚡" },
  { label: "Moyenne",  color: "#3B5BDB", bg: "#EEF2FF", icon: "💧" },
  { label: "Basse",    color: "#2F9E44", bg: "#EBFBEE", icon: "🌿" },
];

// ── Actions disponibles dans le workflow export const WF_ACTIONS = [
  { label: "Assigner à",             icon: "📨", color: "#3B5BDB", type: "assign" },
  { label: "Renvoyer pour révision", icon: "🔄", color: "#E67E22", type: "review",     targetStatus: "En révision" },
  { label: "Demander correction",    icon: "✏️",  color: "#E03131", type: "correction", targetStatus: "À faire" },
  { label: "Valider & clôturer",     icon: "✅", color: "#2F9E44", type: "close",      targetStatus: "Terminé" },
];

// ── Icônes des pièces jointes par type MIME export const FILE_ICONS = {
  "image/":          "🖼️",
  "application/pdf": "📄",
  "text/":           "📝",
  "video/":          "🎬",
  "audio/":          "🎵",
  default:           "📎",
};

// ── Clés de stockage (shared storage)
export const STORAGE_KEY          = "projectflow-v6";
export const PROFILES_STORAGE_KEY = "projectflow-profiles-v1";

// ── Intervalle de polling en millisecondes (synchro temps réel) export const POLL_MS = 3000;

// ── Tickets de démonstration (chargés au premier lancement) export const DEFAULT_TICKETS = [
  {
    id: 1, title: "Refonte de la homepage",
    description: "Moderniser l'interface utilisateur",
    status: "En cours", priority: "Haute", assignee: 1,
    tags: ["Design"], attachments: [],
    history:    [{ date: Date.now() - 86400000, member: 1, action: "Ticket créé" }],
    createdAt:  Date.now() - 86400000,
    assignedAt: Date.now() - 86400000,
    startDate:  null, dueDate: null,
  },
  {
    id: 2, title: "Corriger bug de connexion",
    description: "Déconnexion après 5 min d'inactivité",
    status: "À faire", priority: "Critique", assignee: 2,
    tags: ["Bug"], attachments: [],
    history:    [{ date: Date.now() - 43200000, member: 2, action: "Ticket créé" }],
    createdAt:  Date.now() - 43200000,
    assignedAt: Date.now() - 43200000,
    startDate:  null, dueDate: null,
  },
  {
    id: 3, title: "Intégration API paiement",
    description: "Connecter Stripe pour les abonnements",
    status: "En révision", priority: "Haute", assignee: 3,
    tags: ["Backend"], attachments: [],
    history: [
      { date: Date.now() - 7200000,  member: 3, action: "Ticket créé" },
      { date: Date.now() - 3600000,  member: 1, action: "Renvoyé pour révision", note: "Vérifier les webhooks" },
    ],
    createdAt:  Date.now() - 7200000,
    assignedAt: Date.now() - 3600000,
    startDate:  null, dueDate: null,
  },
  {
    id: 4, title: "Documentation technique",
    description: "Rédiger les guides développeurs",
    status: "Terminé", priority: "Basse", assignee: 4,
    tags: ["Docs"], attachments: [],
    history: [
      { date: Date.now() - 172800000, member: 4, action: "Ticket créé" },
      { date: Date.now() - 86400000,  member: 2, action: "Validé & clôturé" },
    ],
    createdAt:  Date.now() - 172800000,
    assignedAt: Date.now() - 172800000,
    startDate:  null, dueDate: null,
  },
  {
    id: 5, title: "Tests automatisés",
    description: "Couverture > 80% sur les modules critiques",
    status: "À faire", priority: "Moyenne", assignee: null,
    tags: ["Tests"], attachments: [],
    history:    [{ date: Date.now() - 3600000, member: null, action: "Ticket créé" }],
    createdAt:  Date.now() - 3600000,
    assignedAt: null,
    startDate:  null, dueDate: null,
  },
];

