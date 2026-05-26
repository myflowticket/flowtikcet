/**
 * AlertModal.jsx
 * ─────────────────────────────────────────────
 * Modal d'alerte à la connexion.
 * Affiche les nouveaux tickets assignés depuis
 * la dernière connexion de l'utilisateur.
 * ─────────────────────────────────────────────
 */

import React from "react";
import { ACCOUNTS }    from "../../constants/accounts";
import { COL_CFG }     from "../../constants/config";
import { getPriority } from "../../utils/helpers"; import { Btn, Badge }  from "../UI/UI";

export function AlertModal({ currentUser, tickets, onViewTicket, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 20 }}>
      <div style={{ background: "#fff", border: "1px solid #E8EAED", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,.15)", animation: "popIn .25s ease" }}>

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 4 }}>
            Bonjour {currentUser.avatar} {currentUser.name} !
          </div>
          <div style={{ fontSize: 13, color: "#868E96" }}>
            {tickets.length === 1
              ? "Un nouveau ticket vous a été assigné depuis votre dernière connexion"
              : `${tickets.length} nouveaux tickets vous ont été assignés depuis votre dernière connexion`
            }
          </div>
        </div>

        {/* Liste des tickets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, maxHeight: 260, overflowY: "auto" }}>
          {tickets.map(t => {
            const prio = getPriority(t.priority);
            const from = ACCOUNTS.find(m =>
              m.id === t.history?.slice().reverse().find(h =>
                h.action.includes("créé") || h.action.includes("Transféré")
              )?.member
            );

            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid #E8EAED", borderRadius: 10, padding: "12px 14px", background: "#FAFAFA" }}>
                <div style={{ width: 4, minHeight: 40, background: prio.color, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#1a1a1a" }}>{t.title}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge color={prio.color} bg={prio.bg}>{prio.icon} {prio.label}</Badge>
                    <Badge color={COL_CFG[t.status]?.dot} bg={COL_CFG[t.status]?.bg}>{t.status}</Badge>
                    {from && <span style={{ fontSize: 11, color: "#ADB5BD" }}>de {from.avatar} {from.name}</span>}
                  </div>
                </div>
                <Btn onClick={() => onViewTicket(t)} variant="secondary" size="sm">Voir →</Btn>
              </div>
            );
          })}
        </div>

        {/* Bouton principal */}
        <Btn onClick={onClose} variant="primary" style={{ width: "100%", justifyContent: "center" }}>
          Accéder au tableau →
        </Btn>
      </div>
    </div>
  );
}

