/**
 * ShareModal.jsx
 * ─────────────────────────────────────────────
 * Modal de partage d'un ticket.
 * Copie le résumé ou envoie par e-mail.
 * ─────────────────────────────────────────────
 */

import React from "react";
import { ACCOUNTS }      from "../../constants/accounts";
import { COL_CFG }       from "../../constants/config";
import { getPriority }   from "../../utils/helpers";
import { Overlay, Btn, Badge } from "../UI/UI";

export function ShareModal({ ticket, onClose }) {
  const member = ACCOUNTS.find(m => m.id === ticket.assignee);
  const prio   = getPriority(ticket.priority);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `Ticket #${ticket.id} — ${ticket.title}\n` +
      `Statut : ${ticket.status} | Priorité : ${ticket.priority}\n` +
      `${ticket.description || ""}`
    );
    onClose();
  };

  const sendByEmail = () => {
    const subject = encodeURIComponent(`[ProjectFlow] Ticket #${ticket.id} : ${ticket.title}`);
    const body    = encodeURIComponent(
      `Bonjour${member ? " " + member.name : ""},\n\n` +
      `Ticket à traiter :\n` +
      `📌 ${ticket.title}\n` +
      `📋 ${ticket.status}\n` +
      `⚡ ${ticket.priority}\n` +
      `${ticket.description || ""}\n\n` +
      `Cordialement`
    );
    window.open(`mailto:${member?.email || ""}?subject=${subject}&body=${body}`);
  };

  return (
    <Overlay onClose={onClose} maxWidth={400}>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 4 }}>🔗 Partager le ticket</div>
      <div style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 18 }}>#{ticket.id} · {ticket.title}</div>

      {/* Résumé du ticket */}
      <div style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 10, padding: "14px", marginBottom: 16 }}>
        {[
          ["📌", ticket.title],
          ["📋", `${COL_CFG[ticket.status]?.icon} ${ticket.status}`],
          ["⚡", `${prio.icon} ${prio.label}`],
          ["👤", member?.name || "Non assigné"],
          ticket.startDate ? ["📅", `Début : ${new Date(ticket.startDate).toLocaleDateString("fr-FR")}`] : null,
          ticket.dueDate   ? ["⏳", `Échéance : ${new Date(ticket.dueDate).toLocaleDateString("fr-FR")}`] : null,
          ticket.tags?.length ? ["🏷️", ticket.tags.join(", ")] : null,
          ticket.attachments?.length ? ["📎", `${ticket.attachments.length} fichier(s)`] : null,
        ].filter(Boolean).map(([icon, value]) => (
          <div key={icon} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#ADB5BD", minWidth: 20 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn onClick={copyToClipboard} variant="primary" style={{ justifyContent: "center" }}>
          📋 Copier le résumé
        </Btn>
        <Btn onClick={sendByEmail} variant="secondary" style={{ justifyContent: "center" }}>
          ✉️ Envoyer par e-mail
        </Btn>
      </div>

      <Btn onClick={onClose} variant="ghost" style={{ width: "100%", justifyContent: "center", marginTop: 10, color: "#ADB5BD" }}>
        Fermer
      </Btn>
    </Overlay>
  );
}

