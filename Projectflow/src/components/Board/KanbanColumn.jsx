/**
 * KanbanColumn.jsx
 * ─────────────────────────────────────────────
 * Une colonne du tableau Kanban.
 * Gère le drop zone et affiche les TicketCards.
 * ─────────────────────────────────────────────
 */

import React    from "react";
import { COL_CFG } from "../../constants/config"; import { TicketCard } from "./TicketCard";

export function KanbanColumn({
  column, tickets, currentUser,
  draggingId, isOver, isNewForMe,
  onEdit, onWorkflow, onShare, onTransfer,
  onDragStart, onDragEnd,
  onDragOver, onDrop, onDragLeave,
}) {
  const cfg = COL_CFG[column];

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      style={{
        minWidth: 260, flex: "1 1 260px", maxWidth: 310,
        background: isOver ? cfg.bg : "#F8F9FA",
        border: `1.5px solid ${isOver ? cfg.dot : "#E8EAED"}`,
        borderRadius: 12, padding: 12, transition: "all .2s",
      }}
    >
      {/* En-tête colonne */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot }} />
          <span style={{ fontWeight: 600, fontSize: 12, color: "#495057" }}>{column}</span>
        </div>
        <span style={{
          background: "#fff", border: "1px solid #E8EAED",
          borderRadius: 100, padding: "1px 8px",
          fontSize: 11, fontWeight: 600, color: "#868E96",
        }}>
          {tickets.length}
        </span>
      </div>

      {/* Cartes */}
      {tickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          currentUser={currentUser}
          isDragging={draggingId === ticket.id}
          isNew={isNewForMe(ticket)}
          onEdit={onEdit}
          onWorkflow={onWorkflow}
          onShare={onShare}
          onTransfer={onTransfer}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}

      {/* Zone vide */}
      {tickets.length === 0 && (
        <div style={{
          padding: "20px 0", textAlign: "center",
          color: "#CED4DA", fontSize: 12,
          borderRadius: 8, border: "1.5px dashed #E8EAED",
          background: "#fff",
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>📭</div>
          Glissez un ticket ici
        </div>
      )}
    </div>
  );
}

