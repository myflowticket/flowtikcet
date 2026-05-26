/**
 * WorkflowModal.jsx
 * ─────────────────────────────────────────────
 * Modal de workflow — transfert, validation,
 * révision et clôture d'un ticket en 3 étapes.
 * ─────────────────────────────────────────────
 */

import React, { useState } from "react";
import { ACCOUNTS }         from "../../constants/accounts";
import { WF_ACTIONS, COL_CFG } from "../../constants/config";
import { Overlay, Btn }     from "../UI/UI";

export function WorkflowModal({ ticket, currentUser, onApply, onClose }) {
  const [action, setAction] = useState(null);
  const [target, setTarget] = useState(ticket.assignee);
  const [note,   setNote]   = useState("");

  const handleApply = () => {
    if (!action) return;
    onApply({ ticket, action, targetMemberId: target, note });
  };

  const member = ACCOUNTS.find(m => m.id === ticket.assignee);

  return (
    <Overlay onClose={onClose} maxWidth={460}>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 4 }}>🔄 Workflow</div>
      <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 18 }}>#{ticket.id} · {ticket.title}</div>

      {/* État actuel */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, background: "#F8F9FA", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#ADB5BD", marginBottom: 2, fontWeight: 600, letterSpacing: ".5px" }}>STATUT</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{COL_CFG[ticket.status]?.icon} {ticket.status}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#ADB5BD", marginBottom: 2, fontWeight: 600, letterSpacing: ".5px" }}>ASSIGNÉ</div>
          {member
            ? <div style={{ fontSize: 13, fontWeight: 600 }}>{member.avatar} {member.name}</div>
            : <div style={{ fontSize: 13, color: "#ADB5BD" }}>Non assigné</div>
          }
        </div>
      </div>

      {/* Étape 1 : Action */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 8 }}>1 — Action</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {WF_ACTIONS.map(a => (
            <div key={a.type} onClick={() => setAction(a)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: `1.5px solid ${action?.type === a.type ? a.color : "#E8EAED"}`, borderRadius: 10, cursor: "pointer", background: action?.type === a.type ? a.color + "08" : "#fff", transition: "all .15s" }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: action?.type === a.type ? a.color : "#1a1a1a" }}>{a.label}</div>
                {a.targetStatus && <div style={{ fontSize: 11, color: "#ADB5BD", marginTop: 1 }}>→ {a.targetStatus}</div>}
              </div>
              {action?.type === a.type && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: a.color }} />}
            </div>
          ))}
        </div>
      </div>

      {action && (<>
        {/* Étape 2 : Assigner à */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 8 }}>2 — Assigner à</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ACCOUNTS.map(m => (
              <button key={m.id} onClick={() => setTarget(m.id)}
                style={{ background: target === m.id ? m.color + "22" : "#F8F9FA", border: `1.5px solid ${target === m.id ? m.color : "#E8EAED"}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 500, color: target === m.id ? m.color : "#495057" }}>
                <span>{m.avatar}</span>{m.name}{m.id === currentUser.id ? " (moi)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Étape 3 : Message */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>3 — Message (optionnel)</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ex : Merci de revoir les tests…" rows={2}
            style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", background: "#fff" }} />
        </div>

        {/* Aperçu */}
        <div style={{ background: "#F8F9FF", border: "1px solid #E0E7FF", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#495057" }}>
          <strong style={{ color: "#3B5BDB" }}>Aperçu :</strong>{" "}
          {action.icon} {action.label}
          {target ? ` → ${ACCOUNTS.find(m => m.id === target)?.avatar} ${ACCOUNTS.find(m => m.id === target)?.name}` : ""}
          {action.targetStatus ? ` · → ${action.targetStatus}` : ""}
          {note ? ` · 💬 "${note}"` : ""}
        </div>
      </>)}

      {/* Footer */}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onClose} variant="secondary" style={{ flex: 1, justifyContent: "center" }}>Annuler</Btn>
        <Btn onClick={handleApply} onTouchEnd={e => { e.stopPropagation(); handleApply(); }} disabled={!action} variant="blue" style={{ flex: 2, justifyContent: "center" }}>
          {action ? `${action.icon} Appliquer` : "Choisir une action"}
        </Btn>
      </div>
    </Overlay>
  );
}

