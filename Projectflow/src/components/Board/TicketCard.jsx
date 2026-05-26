/**
 * TicketCard.jsx
 * ─────────────────────────────────────────────
 * Carte individuelle d'un ticket dans le Kanban.
 * ─────────────────────────────────────────────
 */

import React from "react";
import { ACCOUNTS }    from "../../constants/accounts";
import { getPriority } from "../../utils/helpers";
import { Badge }       from "../UI/UI";

export function TicketCard({
  ticket, currentUser, isDragging, isNew,
  onEdit, onWorkflow, onShare, onTransfer,
  onDragStart, onDragEnd,
}) {
  const prio   = getPriority(ticket.priority);
  const member = ACCOUNTS.find(m => m.id === ticket.assignee);
  const ismine = ticket.assignee === currentUser.id;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, ticket)}
      onDragEnd={onDragEnd}
      className="pf-card-hover"
      style={{
        background:   isNew ? "#FFF5F5" : ismine ? `${currentUser.color}10` : "#fff",
        border:       `1px solid ${isNew ? "#FFE3E3" : isDragging ? "#3B5BDB" : "#E8EAED"}`,
        borderRadius: 10, padding: "12px 14px",
        cursor: "grab", opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "rotate(1.5deg)" : "none",
        transition: "all .15s", position: "relative",
        marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      }}
    >
      {/* Barre priorité à gauche */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: 3, height: "100%", background: prio.color,
        borderRadius: "10px 0 0 10px",
      }} />

      {/* Badge NEW */}
      {isNew && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "#E03131", color: "#fff",
          fontSize: 9, fontWeight: 700, padding: "1px 6px",
          borderRadius: 4, letterSpacing: ".3px",
        }}>NEW</div>
      )}

      <div style={{ paddingLeft: 8 }}>
        {/* Titre + ID */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a", lineHeight: 1.3, flex: 1, paddingRight: isNew ? 32 : 0 }}>
            {ticket.title}
          </div>
          <div style={{ fontSize: 10, color: "#CED4DA", marginLeft: 6, fontFamily: "monospace" }}>
            #{ticket.id}
          </div>
        </div>

        {/* Description courte */}
        {ticket.description && (
          <div style={{ fontSize: 11, color: "#868E96", marginBottom: 8, lineHeight: 1.5 }}>
            {ticket.description.length > 60 ? ticket.description.slice(0, 60) + "…" : ticket.description}
          </div>
        )}

        {/* Dates */}
        {(ticket.startDate || ticket.dueDate) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            {ticket.startDate && (
              <span style={{ fontSize: 10, color: "#868E96" }}>
                📅 {new Date(ticket.startDate).toLocaleDateString("fr-FR")}
              </span>
            )}
            {ticket.dueDate && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: new Date(ticket.dueDate) < new Date() && ticket.status !== "Terminé" ? "#E03131" : "#868E96",
              }}>
                ⏳ {new Date(ticket.dueDate).toLocaleDateString("fr-FR")}
                {new Date(ticket.dueDate) < new Date() && ticket.status !== "Terminé" && " ⚠️"}
              </span>
            )}
          </div>
        )}

        {/* Pièces jointes */}
        {ticket.attachments?.length > 0 && (
          <div style={{ fontSize: 10, color: "#3B5BDB", marginBottom: 6 }}>
            📎 {ticket.attachments.length} fichier{ticket.attachments.length > 1 ? "s" : ""}
          </div>
        )}

        {/* Tags */}
        {ticket.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {ticket.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
          </div>
        )}

        {/* Footer : priorité + actions + avatar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Badge color={prio.color} bg={prio.bg}>{prio.icon} {prio.label}</Badge>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={e => { e.stopPropagation(); onWorkflow(ticket); }}
              style={{ background: "#F8F9FF", border: "1px solid #E0E7FF", borderRadius: 6, padding: "3px 7px", fontSize: 10, color: "#3B5BDB", cursor: "pointer" }}>🔄</button>
            <button onClick={e => { e.stopPropagation(); onShare(ticket); }}
              style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 6, padding: "3px 7px", fontSize: 10, cursor: "pointer" }}>🔗</button>
            <button onClick={e => { e.stopPropagation(); onEdit(ticket); }}
              style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 6, padding: "3px 7px", fontSize: 10, cursor: "pointer" }}>✏️</button>
            {member
              ? <div title={member.name} style={{ width: 22, height: 22, borderRadius: "50%", background: member.color + "22", border: `1.5px solid ${member.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{member.avatar}</div>
              : <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#F8F9FA", border: "1px solid #E8EAED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#CED4DA" }}>—</div>
            }
          </div>
        </div>

        {/* Transfert rapide (si ticket assigné à moi) */}
        {ismine && ticket.status !== "Terminé" && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #F1F3F5" }}>
            <div style={{ fontSize: 9, color: "#ADB5BD", marginBottom: 5, fontWeight: 700, letterSpacing: ".5px" }}>
              TRANSFÉRER À
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {ACCOUNTS.filter(m => m.id !== currentUser.id).map(m => (
                <button key={m.id}
                  onClick={e => { e.stopPropagation(); onTransfer(ticket, m.id); }}
                  style={{ background: m.color + "15", border: `1px solid ${m.color}44`, borderRadius: 20, padding: "3px 9px", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: m.color, fontWeight: 500, transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = m.color + "30"}
                  onMouseLeave={e => e.currentTarget.style.background = m.color + "15"}
                >
                  {m.avatar} {m.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


