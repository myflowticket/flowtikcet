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

/**
 * Crée un nouvel utilisateur et l'ajoute à ACCOUNTS.
 * @param {object} data - { name, avatar, color, email, password }
 * @returns {object} - Le nouvel utilisateur créé
 */
export const createMember = (data) => {
  // Vérifier si l'email existe déjà
  const exists = ACCOUNTS.some(m => m.email === data.email);
  if (exists) {
    throw new Error("Un utilisateur avec cet email existe déjà.");
  }

  // Générer un nouvel ID
  const newId = ACCOUNTS.length > 0
    ? Math.max(...ACCOUNTS.map(m => m.id)) + 1
    : 1;

  const newMember = {
    id: newId,
    name: data.name,
    avatar: data.avatar || "🙂",
    color: data.color || "#999999",
    email: data.email,
    password: data.password,
  };

  ACCOUNTS.push(newMember);
  return newMember;
};

/**
 * Met à jour un utilisateur existant.
 * @param {number} id - ID du membre à modifier
 * @param {object} updates - Champs à mettre à jour
 * @returns {object} - Le membre mis à jour
 */
export const updateMember = (id, updates) => {
  const index = ACCOUNTS.findIndex(m => m.id === id);

  if (index === -1) {
    throw new Error("Utilisateur introuvable.");
  }

  // Empêcher un email déjà utilisé par un autre membre
  if (updates.email) {
    const exists = ACCOUNTS.some(m => m.email === updates.email && m.id !== id);
    if (exists) {
      throw new Error("Cet email est déjà utilisé par un autre utilisateur.");
    }
  }

  ACCOUNTS[index] = {
    ...ACCOUNTS[index],
    ...updates,
  };

  return ACCOUNTS[index];
};

/**
 * Supprime un utilisateur par son ID.
 * @param {number} id
 * @returns {boolean} - true si supprimé, false sinon
 */
export const deleteMember = (id) => {
  const index = ACCOUNTS.findIndex(m => m.id === id);

  if (index === -1) {
    return false;
  }

  ACCOUNTS.splice(index, 1);
  return true;
};
