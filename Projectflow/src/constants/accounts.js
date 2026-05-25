/**
 * accounts.js
 * ─────────────────────────────────────────────
 * Liste des membres de l'équipe.
 * Pour ajouter un membre → ajoutez une entrée ici.
 * À terme : récupéré depuis une API / base de données.
 * ─────────────────────────────────────────────
 */

export const ACCOUNTS = [
  {
    id:       1,
    name:     "Alice",
    avatar:   "🦊",
    color:    "#FF6B6B",
    email:    "alice@projectflow.io",
    password: "alice123",
  },
  {
    id:       2,
    name:     "Bruno",
    avatar:   "🐻",
    color:    "#4ECDC4",
    email:    "bruno@projectflow.io",
    password: "bruno123",
  },
  {
    id:       3,
    name:     "Carla",
    avatar:   "🦋",
    color:    "#F59E0B",
    email:    "carla@projectflow.io",
    password: "carla123",
  },
  {
    id:       4,
    name:     "David",
    avatar:   "🐬",
    color:    "#8B5CF6",
    email:    "david@projectflow.io",
    password: "david123",
  },
];

/**
 * Retourne un membre par son ID.
 * @param {number} id
 * @returns {object|undefined}
 */
export const getMember = (id) => ACCOUNTS.find(m => m.id === id);
