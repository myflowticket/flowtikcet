/**
 * TicketModal.jsx
 * ─────────────────────────────────────────────
 * Modal de création et modification d'un ticket.
 * 3 onglets : Détails, Pièces jointes, Historique
 * ─────────────────────────────────────────────
 */

import React, { useState, useRef } from "react";
import { ACCOUNTS }                from "../../constants/accounts";
import { COLUMNS, COL_CFG }        from "../../constants/config";
import { PRIORITIES }              from "../../constants/config";
import { getPriority, getFileIcon, formatFileSize } from "../../utils/helpers"; import { Overlay, Btn, Input, TabBar, Field, selectStyle } from "../UI/UI";
import { TICKET_TYPES } from "../../constants/ticketTypes";

export function TicketModal({
  ticket, currentUser,
  onSave, onDelete, onClose,
  onOpenWorkflow, onOpenShare,
  canDo,
}) {
  const isCreate = !ticket.id;

  const [form,     setForm]     = useState({
    ...ticket,
    tags:        [...(ticket.tags        || [])],
    attachments: [...(ticket.attachments || [])],
    history:     [...(ticket.history     || [])],
  });
  const [tab,      setTab]      = useState("details");
  const [tagInput, setTagInput] = useState("");
  const fileRef = useRef(null);

  // ── Mise à jour d'un champ du formulaire
  const upd = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // ── Tags
  const addTag    = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) upd("tags", [...form.tags, t]);
    setTagInput("");
  };
  const removeTag = (t) => upd("tags", form.tags.filter(x => x !== t));

  // ── Pièces jointes
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) return; // Max 5 Mo
      const reader = new FileReader();
      reader.onload = (ev) => setForm(f => ({
        ...f,
        attachments: [...f.attachments, {
          id:      Date.now() + Math.random(),
          name:    file.name,
          size:    file.size,
          type:    file.type,
          dataUrl: ev.target.result,
          addedAt: Date.now(),
        }],
      }));
      reader.readAsDataURL(file);
    });
  };

  const removeAtt   = (id)  => upd("attachments", form.attachments.filter(a => a.id !== id));
  const downloadAtt = (att) => {
    const a = document.createElement("a");
    a.href = att.dataUrl; a.download = att.name; a.click();
  };

  const TABS = [
    { id: "details",     label: "Détails" },
    { id: "attachments", label: `Pièces jointes${form.attachments?.length ? ` (${form.attachments.length})` : ""}` },
    { id: "history",     label: "Historique" },
  ];

  return (
    <Overlay onClose={onClose}>

      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>
          {isCreate ? "Nouveau ticket" : "Modifier le ticket"}
          {!isCreate && <span style={{ fontSize: 12, color: "#ADB5BD", fontWeight: 400, marginLeft: 8 }}>#{ticket.id}</span>}
        </div>
        <button onClick={onClose} style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Onglet Détails */}
      {tab === "details" && (
        <>
          <Field label="Titre *">
            <Input
              value={form.title}
              onChange={e => upd("title", e.target.value)}
              placeholder="Ex : Corriger le bug de login"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description || ""}
              onChange={e => upd("description", e.target.value)}
              placeholder="Décrivez le ticket…"
              rows={3}
              className="pf-input"
              style={{ width: "100%", border: "1px solid #E8EAED", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1a1a1a", outline: "none", background: "#fff", resize: "vertical", fontFamily: "inherit" }}
            />
          </Field>
return (
  <div className="modal-content">

    <h2>Nouveau ticket</h2>

    <div className="form-group">
      <label>Type de ticket</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {TICKET_TYPES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </div>

    {/* autres champs */}
  </div>
);

          {/* Statut + Priorité */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="Statut">
              <select value={form.status || "À faire"} onChange={e => upd("status", e.target.value)} style={selectStyle}>
                {COLUMNS.map(c => <option key={c} value={c}>{COL_CFG[c].icon} {c}</option>)}
              </select>
            </Field>
            <Field label="Priorité">
              <select value={form.priority || "Moyenne"} onChange={e => upd("priority", e.target.value)} style={selectStyle}>
                {PRIORITIES.map(p => <option key={p.label} value={p.label}>{p.icon} {p.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Date de début + Date d'échéance */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="📅 Date de début">
              <input
                type="date"
                value={form.startDate || ""}
                onChange={e => upd("startDate", e.target.value)}
                style={{ ...selectStyle, color: form.startDate ? "#1a1a1a" : "#ADB5BD" }}
              />
            </Field>
            <Field label="⏳ Date d'échéance">
              <input
                type="date"
                value={form.dueDate || ""}
                onChange={e => upd("dueDate", e.target.value)}
                min={form.startDate || ""}
                style={{ ...selectStyle, color: form.dueDate ? (new Date(form.dueDate) < new Date() && form.status !== "Terminé" ? "#E03131" : "#1a1a1a") : "#ADB5BD" }}
              />
              {form.dueDate && new Date(form.dueDate) < new Date() && form.status !== "Terminé" && (
                <div style={{ fontSize: 11, color: "#E03131", marginTop: 4 }}>⚠️ Date dépassée</div>
              )}
            </Field>
          </div>

          {/* Assignation */}
          <Field label="Assigné à">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => { upd("assignee", null); upd("assignedAt", null); }}
                style={{ background: !form.assignee ? "#1a1a1a" : "#F8F9FA", color: !form.assignee ? "#fff" : "#495057", border: "1px solid #E8EAED", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
              >
                Non assigné
              </button>
              {ACCOUNTS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { upd("assignee", m.id); upd("assignedAt", Date.now()); }}
                  style={{ background: form.assignee === m.id ? m.color + "22" : "#F8F9FA", border: `1.5px solid ${form.assignee === m.id ? m.color : "#E8EAED"}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 500, color: form.assignee === m.id ? m.color : "#495057" }}
                >
                  <span>{m.avatar}</span>{m.name}{m.id === currentUser.id ? " (moi)" : ""}
                </button>
              ))}
            </div>
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {form.tags.map(tag => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#ADB5BD", padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Ajouter un tag…" style={{ fontSize: 12 }} />
              <Btn onClick={addTag} variant="secondary" size="sm">+ Tag</Btn>
            </div>
          </Field>
        </>
      )}

      {/* ── Onglet Pièces jointes */}
      {tab === "attachments" && (
        <div>
          <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />

          {/* Zone de drop */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#3B5BDB"; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = "#E8EAED"; }}
            onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#E8EAED"; handleFiles(e.dataTransfer.files); }}
            style={{ border: "2px dashed #E8EAED", borderRadius: 12, padding: "24px", textAlign: "center", cursor: "pointer", background: "#FAFAFA", marginBottom: 14, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3B5BDB"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E8EAED"}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#495057", marginBottom: 2 }}>Glissez vos fichiers ici</div>
            <div style={{ fontSize: 11, color: "#ADB5BD" }}>ou cliquez pour parcourir · Max 5 Mo</div>
          </div>

          {/* Liste des fichiers */}
          {form.attachments.length === 0
            ? <div style={{ textAlign: "center", color: "#ADB5BD", fontSize: 13, padding: "12px 0" }}>Aucune pièce jointe</div>
            : form.attachments.map(att => (
              <div key={att.id} style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #E8EAED", borderRadius: 10, padding: "9px 12px", marginBottom: 8, background: "#FAFAFA" }}>
                {att.type?.startsWith("image/") && att.dataUrl
                  ? <img src={att.dataUrl} alt={att.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                  : <div style={{ width: 32, height: 32, borderRadius: 6, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{getFileIcon(att.type)}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</div>
                  <div style={{ fontSize: 10, color: "#ADB5BD" }}>{formatFileSize(att.size)}</div>
                </div>
                <Btn onClick={() => downloadAtt(att)} variant="ghost" size="sm">⬇️</Btn>
                <Btn onClick={() => removeAtt(att.id)} variant="danger" size="sm">×</Btn>
              </div>
            ))
          }
        </div>
      )}

      {/* ── Onglet Historique */}
      {tab === "history" && (
        <div>
          {form.history.length === 0
            ? <div style={{ textAlign: "center", color: "#ADB5BD", fontSize: 13, padding: "28px 0" }}>Aucun historique</div>
            : [...form.history].reverse().map((entry, i) => {
              const m = ACCOUNTS.find(a => a.id === entry.member);
              return (
                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 14, position: "relative" }}>
                  {i < form.history.length - 1 && (
                    <div style={{ position: "absolute", left: 13, top: 27, width: 1, height: "calc(100% - 10px)", background: "#F1F3F5" }} />
                  )}
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: m ? m.color + "22" : "#F8F9FA", border: `1.5px solid ${m ? m.color : "#E8EAED"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                    {m ? m.avatar : "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{entry.action}</div>
                    {entry.note && <div style={{ fontSize: 11, color: "#868E96", marginTop: 2, fontStyle: "italic" }}>💬 "{entry.note}"</div>}
                    <div style={{ fontSize: 10, color: "#ADB5BD", marginTop: 2 }}>
                      {m?.name || "Système"} · {new Date(entry.date).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ── Footer */}
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F3F5" }}>
        {!isCreate && canDo("delete_ticket") && (
          <Btn onClick={() => onDelete(form.id)} variant="danger" size="sm">🗑 Supprimer</Btn>
        )}
        <div style={{ display: "flex", gap: 7, marginLeft: "auto" }}>
          {!isCreate && (
            <>
              <Btn onClick={() => { onClose(); onOpenWorkflow(form); }} variant="secondary" size="sm">🔄 Workflow</Btn>
              <Btn onClick={() => { onClose(); onOpenShare(form); }}    variant="secondary" size="sm">🔗 Partager</Btn>
            </>
          )}
          <Btn onClick={onClose} variant="secondary" size="sm">Annuler</Btn>
          <Btn
            onClick={() => form.title.trim() && onSave(form)}
            disabled={!form.title.trim()}
            variant="blue" size="sm"
          >
            {isCreate ? "Créer le ticket" : "Sauvegarder"}
          </Btn>
        </div>
      </div>
    </Overlay>
  );
}

