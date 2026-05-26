/**
 * roles.js
 * ─────────────────────────────────────────────
 * Définition des rôles, écrans, actions et profils
 * par défaut du système de droits utilisateurs.
 * ─────────────────────────────────────────────
 */

// ── Les 5 rôles disponibles (combinables sur un même profil)
export const ROLES = {
  admin:     { id: "admin",     label: "Admin",      icon: "👑", color: "#1a1a1a", desc: "Accès total à toutes les fonctionnalités" },
  editor:    { id: "editor",    label: "Éditeur",    icon: "✏️",  color: "#3B5BDB", desc: "Créer et modifier des tickets" },
  validator: { id: "validator", label: "Validateur", icon: "✅", color: "#2F9E44", desc: "Valider et clôturer des tickets" },
  operator:  { id: "operator",  label: "Opérateur",  icon: "⚙️",  color: "#E67E22", desc: "Traiter uniquement ses tickets assignés" },
  reader:    { id: "reader",    label: "Lecteur",    icon: "👁️",  color: "#868E96", desc: "Consulter sans modifier" },
};

// ── Écrans accessibles (restrictibles par profil)
export const SCREENS = {
  kanban:    { id: "kanban",    label: "Tableau Kanban",       icon: "📋" },
  mytickets: { id: "mytickets", label: "Mes tickets",          icon: "🎫" },
  reports:   { id: "reports",   label: "Rapports & KPI",       icon: "📊" },
  chat:      { id: "chat",      label: "Chat",                 icon: "💬" },
  settings:  { id: "settings",  label: "Paramètres",           icon: "⚙️"  },
  admin:     { id: "admin",     label: "Page Admin",           icon: "👤" },
  users:     { id: "users",     label: "Gestion utilisateurs", icon: "👥" },
};

// ── Actions restrictibles
export const ACTIONS = {
  create_ticket:   { id: "create_ticket",   label: "Créer un ticket",      icon: "➕" },
  edit_ticket:     { id: "edit_ticket",     label: "Modifier un ticket",   icon: "✏️"  },
  delete_ticket:   { id: "delete_ticket",   label: "Supprimer un ticket",  icon: "🗑️" },
  validate_ticket: { id: "validate_ticket", label: "Valider un ticket",    icon: "✅" },
  transfer_ticket: { id: "transfer_ticket", label: "Transférer un ticket", icon: "🔄" },
  view_reports:    { id: "view_reports",    label: "Voir les rapports",    icon: "📊" },
  manage_members:  { id: "manage_members",  label: "Gérer les membres",    icon: "👥" },
};

// ── Permissions attribuées automatiquement par rôle
export const DEFAULT_PERMISSIONS = {
  admin:     { screens: Object.keys(SCREENS), actions: Object.keys(ACTIONS) },
  editor:    { screens: ["kanban", "mytickets", "chat"],  actions: ["create_ticket", "edit_ticket", "transfer_ticket"] },
  validator: { screens: ["kanban", "mytickets", "chat"],  actions: ["validate_ticket", "transfer_ticket"] },
  operator:  { screens: ["mytickets", "chat"],             actions: ["edit_ticket", "transfer_ticket"] },
  reader:    { screens: ["kanban", "mytickets"],           actions: [] },
};

// ── Profils utilisateurs par défaut (Alice = admin)
export const DEFAULT_USER_PROFILES = {
  1: { roles: ["admin"],              screens: Object.keys(SCREENS), actions: Object.keys(ACTIONS) },
  2: { roles: ["editor"],             screens: ["kanban", "mytickets", "chat"], actions: ["create_ticket", "edit_ticket", "transfer_ticket"] },
  3: { roles: ["editor","validator"], screens: ["kanban", "mytickets", "chat"], actions: ["create_ticket", "edit_ticket", "validate_ticket", "transfer_ticket"] },
  4: { roles: ["operator"],           screens: ["mytickets", "chat"],           actions: ["edit_ticket", "transfer_ticket"] },
};

// ── Options d'avatars disponibles à la création
export const AVATAR_OPTIONS = [
  "🦊","🐻","🦋","🐬","🐯","🦁","🐸","🦅","🐙","🦄",
  "🐺","🐧","🦉","🐝","🐲","🦈","🐻‍❄️","🦩","🐨","🦚",
  "🐞","🦜","🐳","🐮","🦒","🐘","🦔",
];

// ── Couleurs disponibles pour les profils
export const MEMBER_COLORS = [
  "#FF6B6B","#4ECDC4","#F59E0B","#8B5CF6","#3B5BDB",
  "#2F9E44","#E67E22","#E03131","#00B5D8","#D6336C",
];