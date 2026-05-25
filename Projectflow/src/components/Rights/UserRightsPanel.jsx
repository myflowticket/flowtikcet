
/**
 * UserRightsPanel.jsx
 * ─────────────────────────────────────────────
 * Panneau de gestion des droits utilisateurs.
 * ─────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import { ACCOUNTS }           from "../../constants/accounts";
import { ROLES, SCREENS, ACTIONS, DEFAULT_PERMISSIONS } from "../../constants/roles";
import { Btn, Badge }         from "../UI/UI";

export function UserRightsPanel({ profiles, onSave }) {
  const [selectedUser, setSelectedUser] = useState(ACCOUNTS[0].id);
  const [draft,        setDraft]        = useState(null);
  const [saved,        setSaved]        = useState(false);

  useEffect(() => {
    const p = profiles[selectedUser] || { roles: [], screens: [], actions: [] };
    setDraft({ ...p, roles: [...(p.roles||[])], screens: [...(p.screens||[])], actions: [...(p.actions||[])] });
  }, [selectedUser, profiles]);

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

  const toggleScreen = (id) => setDraft(d => ({ ...d, screens: d.screens.includes(id) ? d.screens.filter(s => s !== id) : [...d.screens, id] }));
  const toggleAction = (id) => setDraft(d => ({ ...d, actions: d.actions.includes(id) ? d.actions.filter(a => a !== id) : [...d.actions, id] }));

  const handleSave = async () => {
    await onSave({ ...profiles, [selectedUser]: draft });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const member  = ACCOUNTS.find(m => m.id === selectedUser);
  const isAdmin = draft?.roles?.includes("admin");

  return (
    <div style={{ display: "flex", height: "100%" }}>

      {/* Liste membres */}
      <div style={{ width: 220, borderRight: "1px solid #F1F3F5", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #F1F3F5" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Membres</div>
          <div style={{ fontSize: 11, color: "#ADB5BD", marginTop: 2 }}>Cliquez pour modifier les droits</div>
        </div>
        {/* Liste membres */}
<div style={{ width: 220, borderRight: "1px solid #F1F3F5", flexShrink: 0 }}>
  <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #F1F3F5" }}>
    <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Membres</div>
    <div style={{ fontSize: 11, color: "#ADB5BD", marginTop: 2 }}>Cliquez pour modifier les droits</div>
  </div>

  {/* ⭐ AJOUTER LE BOUTON ICI ⭐ */}
  <button
    onClick={() => alert("Formulaire de création à intégrer")}
    style={{
      width: "100%",
      padding: "10px 16px",
      background: "#3B5BDB",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600
    }}
  >
    ➕ Créer un utilisateur
  </button>

  {/* Liste des comptes */}
  {ACCOUNTS.map(acc => {
  })}
</div>
        {ACCOUNTS.map(acc => {
          const p          = profiles[acc.id] || { roles: [] };
          const isSelected = selectedUser === acc.id;
          return (
            <div key={acc.id} onClick={() => setSelectedUser(acc.id)}
              style={{ padding: "12px 16px", cursor: "pointer", background: isSelected ? "#F0F4FF" : "transparent", borderLeft: `3px solid ${isSelected ? "#3B5BDB" : "transparent"}`, transition: "all .15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: acc.color + "22", border: `1.5px solid ${acc.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{acc.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>{acc.name}</div>
                  <div style={{ fontSize: 10, color: "#ADB5BD", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(p.roles || []).map(r => ROLES[r]?.label).join(", ") || "Aucun rôle"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Éditeur droits */}
      {draft && (
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>

          {/* En-tête membre */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #F1F3F5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: member.color + "22", border: `2px solid ${member.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{member.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>{member.name}</div>
                <div style={{ fontSize: 12, color: "#ADB5BD" }}>{member.email}</div>
              </div>
            </div>
            <Btn onClick={handleSave} variant="blue" size="sm">{saved ? "✅ Sauvegardé !" : "💾 Sauvegarder"}</Btn>
          </div>

          {/* Rôles */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a", marginBottom: 4 }}>Rôles attribués</div>
            <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 12 }}>Plusieurs rôles peuvent être combinés sur un même profil</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.values(ROLES).map(role => {
                const active = draft.roles.includes(role.id);
                return (
                  <div key={role.id} onClick={() => toggleRole(role.id)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: `1.5px solid ${active ? role.color + "66" : "#E8EAED"}`, borderRadius: 10, cursor: "pointer", background: active ? role.color + "08" : "#fff", transition: "all .15s" }}>
                    <input type="checkbox" checked={active} onChange={() => {}} className="pf-checkbox" />
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? role.color + "22" : "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{role.icon}</div>
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
            <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 12 }}>{isAdmin ? "L'Admin a accès à tous les écrans automatiquement" : "Choisissez les écrans visibles pour ce profil"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.values(SCREENS).map(screen => {
                const active = isAdmin || draft.screens.includes(screen.id);
                return (
                  <div key={screen.id} onClick={() => !isAdmin && toggleScreen(screen.id)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1px solid ${active ? "#3B5BDB44" : "#E8EAED"}`, borderRadius: 8, cursor: isAdmin ? "default" : "pointer", background: active ? "#F0F4FF" : "#fff", transition: "all .15s" }}>
                    <input type="checkbox" checked={active} onChange={() => {}} className="pf-checkbox" disabled={isAdmin} />
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
            <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 12 }}>{isAdmin ? "L'Admin peut effectuer toutes les actions" : "Définissez ce que ce profil peut faire"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.values(ACTIONS).map(action => {
                const active = isAdmin || draft.actions.includes(action.id);
                return (
                  <div key={action.id} onClick={() => !isAdmin && toggleAction(action.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", border: `1px solid ${active ? "#2F9E4444" : "#E8EAED"}`, borderRadius: 8, cursor: isAdmin ? "default" : "pointer", background: active ? "#F3FBF4" : "#fff", transition: "all .15s" }}>
                    <input type="checkbox" checked={active} onChange={() => {}} className="pf-checkbox" disabled={isAdmin} />
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
  );
}

