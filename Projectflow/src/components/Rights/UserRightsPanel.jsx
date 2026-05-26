/**
 * UserRightsPanel.jsx
 * ─────────────────────────────────────────────
 * Panneau de gestion des droits utilisateurs.
 * - Liste des membres avec leurs rôles
 * - Création / modification / suppression (Admin only)
 * - Attribution des rôles, écrans et actions
 * ─────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import { ROLES, SCREENS, ACTIONS, DEFAULT_PERMISSIONS } from "../../constants/roles";
import { Btn, Badge, Input, Field } from "../UI/UI";

// ── Emojis disponibles pour les avatars
const AVATAR_LIST = [
  "🦊","🐻","🦋","🐬","🦁","🐯","🦊","🐺","🦝","🐸",
  "🦄","🐧","🦅","🦜","🐙","🦈","🌟","🚀","⚡","🎯",
  "🔥","💎","🌈","🎨","🎭","🏆","💡","🎸","🌙","☀️",
];

// ── Couleurs disponibles
const COLOR_LIST = [
  "#FF6B6B","#4ECDC4","#F59E0B","#8B5CF6",
  "#3B5BDB","#2F9E44","#E03131","#E67E22",
  "#0EA5E9","#EC4899","#14B8A6","#F97316",
];

// ── Clé de stockage local des utilisateurs dynamiques
const USERS_KEY = "projectflow-users-v1";

const loadUsers = () => {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [
    { id: 1, name: "Alice", avatar: "🦊", color: "#FF6B6B", email: "alice@projectflow.io", password: "alice123" },
    { id: 2, name: "Bruno", avatar: "🐻", color: "#4ECDC4", email: "bruno@projectflow.io", password: "bruno123" },
    { id: 3, name: "Carla", avatar: "🦋", color: "#F59E0B", email: "carla@projectflow.io", password: "carla123" },
    { id: 4, name: "David", avatar: "🐬", color: "#8B5CF6", email: "david@projectflow.io", password: "david123" },
  ];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export function UserRightsPanel({ profiles, onSave, currentUser }) {
  const [users,         setUsers]         = useState(loadUsers);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [draft,         setDraft]         = useState(null);
  const [saved,         setSaved]         = useState(false);
  const [showCreate,    setShowCreate]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyForm = { name: "", email: "", password: "", avatar: "🦊", color: "#FF6B6B" };
  const [userForm,  setUserForm]  = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // ── Sélectionne le premier utilisateur par défaut
  useEffect(() => {
    if (users.length > 0 && !selectedUser) setSelectedUser(users[0].id);
  }, [users]);

  // ── Charge le profil du membre sélectionné
  useEffect(() => {
    if (!selectedUser) return;
    const p = profiles[selectedUser] || { roles: [], screens: [], actions: [] };
    setDraft({
      ...p,
      roles:   [...(p.roles   || [])],
      screens: [...(p.screens || [])],
      actions: [...(p.actions || [])],
    });
  }, [selectedUser, profiles]);

  const isAdmin    = currentUser && (profiles[currentUser.id]?.roles?.includes("admin"));
  const member     = users.find(m => m.id === selectedUser);
  const isAdminSel = draft?.roles?.includes("admin");

  // ── Toggle rôle
  const toggleRole = (roleId) => {
    setDraft(d => {
      const has   = d.roles.includes(roleId);
      const roles = has ? d.roles.filter(r => r !== roleId) : [...d.roles, roleId];
      if (!has) {
        const def     = DEFAULT_PERMISSIONS[roleId];
        const screens = [...new Set([...d.screens, ...def.screens])];
        const actions = [...new Set([...d.actions, ...def.actions])];
        return { ...d, roles, screens, actions };
      }
      return { ...d, roles };
    });
  };

  const toggleScreen = (id) => setDraft(d => ({
    ...d,
    screens: d.screens.includes(id) ? d.screens.filter(s => s !== id) : [...d.screens, id],
  }));

  const toggleAction = (id) => setDraft(d => ({
    ...d,
    actions: d.actions.includes(id) ? d.actions.filter(a => a !== id) : [...d.actions, id],
  }));

  // ── Sauvegarder les droits
  const handleSaveRights = async () => {
    await onSave({ ...profiles, [selectedUser]: draft });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Créer un utilisateur
  const handleCreateUser = () => {
    setFormError("");
    if (!userForm.name.trim())     return setFormError("Le nom est obligatoire.");
    if (!userForm.email.trim())    return setFormError("L'email est obligatoire.");
    if (!userForm.password.trim()) return setFormError("Le mot de passe est obligatoire.");
    if (users.find(u => u.email.toLowerCase() === userForm.email.toLowerCase()))
      return setFormError("Cet email existe déjà.");

    const newId   = Math.max(...users.map(u => u.id), 0) + 1;
    const newUser = {
      id:       newId,
      name:     userForm.name.trim(),
      email:    userForm.email.trim(),
      password: userForm.password.trim(),
      avatar:   userForm.avatar,
      color:    userForm.color,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);

    // Profil par défaut : lecteur
    onSave({ ...profiles, [newId]: { roles: ["reader"], screens: ["kanban", "mytickets"], actions: [] } });

    setShowCreate(false);
    setUserForm(emptyForm);
    setSelectedUser(newId);
  };

  // ── Supprimer un utilisateur
  const handleDeleteUser = (userId) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveUsers(updated);
    const newProfiles = { ...profiles };
    delete newProfiles[userId];
    onSave(newProfiles);
    setSelectedUser(updated[0]?.id || null);
    setDeleteConfirm(null);
  };

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "inherit" }}>

      {/* ── Liste membres (gauche) */}
      <div style={{ width: 240, borderRight: "1px solid #F1F3F5", flexShrink: 0, display: "flex", flexDirection: "column" }}>

        {/* En-tête + bouton créer */}
        <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #F1F3F5" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Utilisateurs</div>
            {isAdmin && (
              <button
                onClick={() => { setShowCreate(true); setUserForm(emptyForm); setFormError(""); }}
                style={{ background: "#1a1a1a", border: "none", borderRadius: 7, padding: "4px 10px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                ＋ Nouveau
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#ADB5BD" }}>{users.length} membre{users.length > 1 ? "s" : ""}</div>
        </div>

        {/* Liste des membres */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {users.map(acc => {
            const p          = profiles[acc.id] || { roles: [] };
            const isSelected = selectedUser === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => setSelectedUser(acc.id)}
                style={{ padding: "11px 16px", cursor: "pointer", background: isSelected ? "#F0F4FF" : "transparent", borderLeft: `3px solid ${isSelected ? "#3B5BDB" : "transparent"}`, transition: "all .15s", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: acc.color + "22", border: `1.5px solid ${acc.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {acc.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>{acc.name}</div>
                  <div style={{ fontSize: 10, color: "#ADB5BD", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(p.roles || []).map(r => ROLES[r]?.label).join(", ") || "Aucun rôle"}
                  </div>
                </div>
                {acc.id === currentUser?.id && (
                  <span style={{ fontSize: 9, background: "#EEF2FF", color: "#3B5BDB", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>moi</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Partie droite */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Formulaire création */}
        {showCreate && isAdmin && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F3F5", background: "#FAFAFA" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 16 }}>➕ Nouvel utilisateur</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Field label="Nom *">
                <Input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex : Sophie" />
              </Field>
              <Field label="Email *">
                <Input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} placeholder="sophie@company.io" />
              </Field>
            </div>

            <Field label="Mot de passe *">
              <Input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </Field>

            {/* Choix avatar */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#495057", display: "block", marginBottom: 8 }}>Avatar</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {AVATAR_LIST.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setUserForm(f => ({ ...f, avatar: emoji }))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${userForm.avatar === emoji ? "#3B5BDB" : "#E8EAED"}`, background: userForm.avatar === emoji ? "#EEF2FF" : "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Choix couleur */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#495057", display: "block", marginBottom: 8 }}>Couleur</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {COLOR_LIST.map(color => (
                  <button
                    key={color}
                    onClick={() => setUserForm(f => ({ ...f, color }))}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: color, border: `3px solid ${userForm.color === color ? "#1a1a1a" : "transparent"}`, cursor: "pointer", transition: "all .15s" }} />
                ))}
              </div>
            </div>

            {/* Aperçu */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", border: "1px solid #E8EAED", borderRadius: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: userForm.color + "22", border: `2px solid ${userForm.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {userForm.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{userForm.name || "Prénom"}</div>
                <div style={{ fontSize: 12, color: "#ADB5BD" }}>{userForm.email || "email@example.com"}</div>
              </div>
            </div>

            {formError && (
              <div style={{ background: "#FFF5F5", border: "1px solid #FFE3E3", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#E03131" }}>
                ⚠️ {formError}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => { setShowCreate(false); setFormError(""); }} variant="secondary">Annuler</Btn>
              <Btn onClick={handleCreateUser} variant="blue">✅ Créer l'utilisateur</Btn>
            </div>
          </div>
        )}

        {/* ── Éditeur droits du membre sélectionné */}
        {draft && member && !showCreate && (
          <div style={{ padding: "20px 24px" }}>

            {/* En-tête membre */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #F1F3F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: member.color + "22", border: `2px solid ${member.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {member.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: "#ADB5BD" }}>{member.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {isAdmin && member.id !== currentUser?.id && (
                  deleteConfirm === member.id
                    ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#E03131" }}>Confirmer ?</span>
                        <Btn onClick={() => handleDeleteUser(member.id)} variant="danger" size="sm">Oui, supprimer</Btn>
                        <Btn onClick={() => setDeleteConfirm(null)} variant="secondary" size="sm">Non</Btn>
                      </div>
                    ) : (
                      <Btn onClick={() => setDeleteConfirm(member.id)} variant="danger" size="sm">🗑 Supprimer</Btn>
                    )
                )}
                <Btn onClick={handleSaveRights} variant="blue" size="sm">
                  {saved ? "✅ Sauvegardé !" : "💾 Sauvegarder"}
                </Btn>
              </div>
            </div>

            {/* Rôles */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 4 }}>Rôles attribués</div>
              <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 12 }}>Plusieurs rôles peuvent être combinés sur un même profil</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.values(ROLES).map(role => {
                  const active = draft.roles.includes(role.id);
                  return (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: `1.5px solid ${active ? role.color + "66" : "#E8EAED"}`, borderRadius: 10, cursor: "pointer", background: active ? role.color + "08" : "#fff", transition: "all .15s" }}>
                      <input type="checkbox" checked={active} onChange={() => {}} className="pf-checkbox" />
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? role.color + "22" : "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {role.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: active ? role.color : "#1a1a1a" }}>{role.label}</div>
                        <div style={{ fontSize: 11, color: "#ADB5BD", marginTop: 1 }}>{role.desc}</div>
                      </div>
                      {active && <Badge color={role.color} bg={role.color + "15"}>Actif</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Écrans */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 4 }}>Accès aux écrans</div>
              <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 12 }}>
                {isAdminSel ? "L'Admin a accès à tous les écrans automatiquement" : "Choisissez les écrans visibles pour ce profil"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.values(SCREENS).map(screen => {
                  const active = isAdminSel || draft.screens.includes(screen.id);
                  return (
                    <div
                      key={screen.id}
                      onClick={() => !isAdminSel && toggleScreen(screen.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1px solid ${active ? "#3B5BDB44" : "#E8EAED"}`, borderRadius: 8, cursor: isAdminSel ? "default" : "pointer", background: active ? "#F0F4FF" : "#fff", transition: "all .15s" }}>
                      <input type="checkbox" checked={active} onChange={() => {}} className="pf-checkbox" disabled={isAdminSel} />
                      <span style={{ fontSize: 15 }}>{screen.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: active ? "#3B5BDB" : "#495057" }}>{screen.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 4 }}>Permissions d'actions</div>
              <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 12 }}>
                {isAdminSel ? "L'Admin peut effectuer toutes les actions" : "Définissez ce que ce profil peut faire"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.values(ACTIONS).map(action => {
                  const active = isAdminSel || draft.actions.includes(action.id);
                  return (
                    <div
                      key={action.id}
                      onClick={() => !isAdminSel && toggleAction(action.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", border: `1px solid ${active ? "#2F9E4444" : "#E8EAED"}`, borderRadius: 8, cursor: isAdminSel ? "default" : "pointer", background: active ? "#F3FBF4" : "#fff", transition: "all .15s" }}>
                      <input type="checkbox" checked={active} onChange={() => {}} className="pf-checkbox" disabled={isAdminSel} />
                      <span style={{ fontSize: 14 }}>{action.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: active ? "#2F9E44" : "#495057" }}>{action.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
