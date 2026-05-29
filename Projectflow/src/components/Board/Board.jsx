/**
 * Board.jsx
 * ─────────────────────────────────────────────
 * Composant principal — sidebar remplacée par
 * un menu burger coulissant (drawer).
 * ─────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from "react";
import { ACCOUNTS }                from "../../constants/accounts";
import { COLUMNS, COL_CFG }        from "../../constants/config";
import { ROLES }                   from "../../constants/roles";
import { useTicketStorage }        from "../../hooks/useTicketStorage";
import { useNotifications }        from "../../hooks/useNotifications";
import { useProfiles }             from "../../hooks/useProfiles";
import { KanbanColumn }            from "./KanbanColumn";
import { TicketModal }             from "../Modals/TicketModal";
import { WorkflowModal }           from "../Modals/WorkflowModal";
import { ShareModal }              from "../Modals/ShareModal";
import { AlertModal }              from "../Modals/AlertModal";
import { UserRightsPanel }         from "../Rights/UserRightsPanel";
import { ReportsPage }             from "../Reports/ReportsPage";
import { Btn, Badge }              from "../UI/UI";

// ── Logique échéance
const getDueInfo = (ticket) => {
  if (!ticket.dueDate || ticket.status === "Terminé") return null;
  const now      = new Date(); now.setHours(0,0,0,0);
  const due      = new Date(ticket.dueDate); due.setHours(0,0,0,0);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: `Dépassée de ${Math.abs(diffDays)}j`, color: "#E03131", bg: "#FFF5F5", icon: "🔴" };
  if (diffDays <= 5)  return { label: `${diffDays}j restant${diffDays > 1 ? "s" : ""}`, color: "#E67E22", bg: "#FFF8F0", icon: "🟡" };
  if (diffDays <= 10) return { label: `${diffDays}j restants`, color: "#2F9E44", bg: "#EBFBEE", icon: "🟢" };
  return { label: `${diffDays}j restants`, color: "#ADB5BD", bg: "#F8F9FA", icon: "📅" };
};

const TICKET_TYPES_MAP = {
  anomalie:  { label: "Anomalie",  icon: "🐛", color: "#E03131", bg: "#FFF5F5" },
  evolution: { label: "Évolution", icon: "✨", color: "#3B5BDB", bg: "#EEF2FF" },
  tache:     { label: "Tâche",     icon: "📋", color: "#E67E22", bg: "#FFF8F0" },
  question:  { label: "Question",  icon: "❓", color: "#2F9E44", bg: "#EBFBEE" },
};

export function Board({ currentUser, onLogout }) {
  const { tickets, nextId, loading, syncing, lastSync, persist } = useTicketStorage();
  const { profiles, saveProfiles, canDo, canSee }                = useProfiles();
  const { alertModal, setAlertModal, newTickets, isNewForMe }    = useNotifications(currentUser, tickets, loading);

  const [activePage,  setActivePage]  = useState("kanban");
  const [modal,       setModal]       = useState(null);
  const [draggingId,  setDraggingId]  = useState(null);
  const [dragOver,    setDragOver]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [filtPrio,    setFiltPrio]    = useState(null);
  const [filtMember,  setFiltMember]  = useState(null);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  const dragRef = useRef(null);

  // Ferme le drawer si on clique en dehors
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => {
      if (!e.target.closest("#pf-drawer") && !e.target.closest("#pf-burger")) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  const filtered  = tickets.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return ms && (!filtPrio || t.priority === filtPrio) && (!filtMember || t.assignee === filtMember);
  });
  const myTickets = tickets.filter(t => t.assignee === currentUser.id && t.status !== "Terminé");
  const newCount  = myTickets.filter(t => isNewForMe(t)).length;

  // ── Modals
  const openCreate   = () => setModal({ type: "ticket", data: { title: "", description: "", status: "À faire", priority: "Moyenne", assignee: currentUser.id, tags: [], attachments: [], history: [], createdAt: Date.now(), assignedAt: Date.now(), startDate: null, dueDate: null } });
  const openEdit     = t  => setModal({ type: "ticket",  data: t });
  const openWorkflow = t  => setModal({ type: "workflow", data: t });
  const openShare    = t  => setModal({ type: "share",    data: t });
  const closeModal   = () => setModal(null);

  // ── CRUD
  const handleSave = async form => {
    const isCreate = !form.id;
    let list, nid;
    if (isCreate) {
      list = [...tickets, { ...form, id: nextId, history: [{ date: Date.now(), member: currentUser.id, action: "Ticket créé" }] }];
      nid  = nextId + 1;
    } else {
      list = tickets.map(t => t.id === form.id ? { ...form } : t);
      nid  = nextId;
    }
    closeModal();
    await persist(list, nid);
  };

  const handleDelete = async id => {
    closeModal();
    await persist(tickets.filter(t => t.id !== id), nextId);
  };

  const handleQuickTransfer = async (ticket, targetId) => {
    const target = ACCOUNTS.find(m => m.id === targetId);
    const hist   = { date: Date.now(), member: currentUser.id, action: `Transféré à ${target?.avatar} ${target?.name}` };
    await persist(tickets.map(t => t.id !== ticket.id ? t : { ...t, assignee: targetId, assignedAt: Date.now(), history: [...(t.history || []), hist] }), nextId);
  };

  const handleApplyWorkflow = async ({ ticket, action, targetMemberId, note }) => {
    const target = ACCOUNTS.find(m => m.id === targetMemberId);
    const label  = action.label + (target ? ` → ${target.avatar} ${target.name}` : "");
    const hist   = { date: Date.now(), member: currentUser.id, action: label, note: note || null };
    closeModal();
    await persist(tickets.map(t => t.id !== ticket.id ? t : { ...t, assignee: targetMemberId, assignedAt: Date.now(), status: action.targetStatus || t.status, history: [...(t.history || []), hist] }), nextId);
  };

  // ── Drag & Drop
  const onDragStart = (e, t) => { dragRef.current = t; setDraggingId(t.id); };
  const onDragEnd   = ()     => { dragRef.current = null; setDraggingId(null); setDragOver(null); };
  const onDrop = async col   => {
    if (dragRef.current && dragRef.current.status !== col) {
      const hist = { date: Date.now(), member: currentUser.id, action: `Déplacé vers « ${col} »` };
      await persist(tickets.map(t => t.id !== dragRef.current.id ? t : { ...t, status: col, history: [...(t.history || []), hist] }), nextId);
    }
    setDragOver(null);
  };

  const handleReset = async () => {
    if (!confirm("Réinitialiser le tableau ?")) return;
    const { DEFAULT_TICKETS } = await import("../../constants/config");
    await persist(DEFAULT_TICKETS, 6);
  };

  // ── Navigation items
  const NAV_ITEMS = [
    { id: "kanban",    icon: "📋", label: "Tableau Kanban",  screen: "kanban" },
    { id: "mytickets", icon: "🎫", label: "Mes tickets",     screen: "mytickets", badge: myTickets.length || null, badgeNew: newCount > 0 },
    { id: "reports",   icon: "📊", label: "Rapports",        screen: "reports" },
    { id: "chat",      icon: "💬", label: "Chat",            screen: "chat",   soon: true },
  ];
  const SETTINGS_ITEMS = [
    { id: "settings",   icon: "⚙️",  label: "Paramètres",         screen: "settings", soon: true },
    { id: "rights",     icon: "🔐", label: "Droits utilisateurs", screen: "admin" },
    { id: "adminpanel", icon: "👤", label: "Admin",               screen: "admin",    soon: true },
  ];

  const navigateTo = (id) => {
    setActivePage(id);
    setDrawerOpen(false);
  };

  const PAGE_TITLES = {
    kanban: "Tableau Kanban", mytickets: "Mes tickets", reports: "Rapports & KPI",
    rights: "Droits utilisateurs", chat: "Chat", settings: "Paramètres", adminpanel: "Administration",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F4F6F8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 40, animation: "spin 1s linear infinite" }}>🚀</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Chargement…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F8", display: "flex", flexDirection: "column" }}>

      {/* Alert modal */}
      {alertModal && newTickets.length > 0 && (
        <AlertModal currentUser={currentUser} tickets={newTickets}
          onViewTicket={t => { setAlertModal(false); openEdit(t); }}
          onClose={() => setAlertModal(false)} />
      )}

      {/* ══ OVERLAY DRAWER ══ */}
      {drawerOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 90, backdropFilter: "blur(2px)" }} onClick={() => setDrawerOpen(false)} />
      )}

      {/* ══ DRAWER ══ */}
      <div id="pf-drawer" style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
        background: "#fff", borderRight: "1px solid #F1F3F5",
        zIndex: 100, display: "flex", flexDirection: "column",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .25s cubic-bezier(.4,0,.2,1)",
        boxShadow: drawerOpen ? "4px 0 24px rgba(0,0,0,.12)" : "none",
      }}>
        {/* Header drawer */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #F1F3F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚀</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", letterSpacing: "-.3px" }}>ProjectFlow</div>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#ADB5BD", padding: 4, lineHeight: 1 }}>×</button>
        </div>

        {/* Statut sync */}
        <div style={{ padding: "8px 18px", borderBottom: "1px solid #F1F3F5", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: syncing ? "#E67E22" : "#2F9E44", animation: syncing ? "pulse 1s infinite" : "none" }} />
          <span style={{ fontSize: 11, color: "#ADB5BD" }}>
            {syncing ? "Synchro…" : lastSync ? lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "En direct"}
          </span>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#ADB5BD", letterSpacing: ".8px", textTransform: "uppercase", padding: "12px 8px 4px" }}>Navigation</div>
          {NAV_ITEMS.map(item => {
            if (!canSee(currentUser.id, item.screen)) return null;
            const active = activePage === item.id;
            return (
              <div key={item.id} onClick={() => !item.soon && navigateTo(item.id)}
                style={{ padding: "10px 12px", borderRadius: 8, cursor: item.soon ? "default" : "pointer", display: "flex", alignItems: "center", gap: 10, background: active ? "#F0F4FF" : "transparent", color: active ? "#3B5BDB" : "#495057", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all .15s", marginBottom: 2, opacity: item.soon ? .5 : 1 }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.soon && <span style={{ fontSize: 9, color: "#ADB5BD", background: "#F1F3F5", padding: "1px 6px", borderRadius: 4 }}>bientôt</span>}
                {item.badge && <span style={{ background: item.badgeNew ? "#E03131" : "#E8EAED", color: item.badgeNew ? "#fff" : "#666", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100 }}>{item.badge}</span>}
              </div>
            );
          })}

          <div style={{ fontSize: 10, fontWeight: 700, color: "#ADB5BD", letterSpacing: ".8px", textTransform: "uppercase", padding: "12px 8px 4px" }}>Configuration</div>
          {SETTINGS_ITEMS.map(item => {
            if (!canSee(currentUser.id, item.screen)) return null;
            const active = activePage === item.id;
            return (
              <div key={item.id} onClick={() => !item.soon && navigateTo(item.id)}
                style={{ padding: "10px 12px", borderRadius: 8, cursor: item.soon ? "default" : "pointer", display: "flex", alignItems: "center", gap: 10, background: active ? "#F0F4FF" : "transparent", color: active ? "#3B5BDB" : "#495057", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all .15s", marginBottom: 2, opacity: item.soon ? .5 : 1 }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.soon && <span style={{ fontSize: 9, color: "#ADB5BD", background: "#F1F3F5", padding: "1px 6px", borderRadius: 4 }}>bientôt</span>}
              </div>
            );
          })}
        </div>

        {/* User card */}
        <div style={{ padding: "12px", borderTop: "1px solid #F1F3F5" }}>
          <div style={{ background: "#F8F9FA", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: currentUser.color + "22", border: `1.5px solid ${currentUser.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{currentUser.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: "#ADB5BD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(profiles[currentUser.id]?.roles || []).map(r => ROLES[r]?.label).join(", ") || "Aucun rôle"}
              </div>
            </div>
            <button onClick={onLogout} title="Déconnexion"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ADB5BD", padding: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = "#E03131"}
              onMouseLeave={e => e.currentTarget.style.color = "#ADB5BD"}>
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* ══ TOPBAR ══ */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F3F5", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, zIndex: 40, height: 56 }}>

        {/* Gauche : burger + logo + titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Bouton burger */}
          <button id="pf-burger" onClick={() => setDrawerOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 4px", display: "flex", flexDirection: "column", gap: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = "#F4F6F8"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 20, height: 2, borderRadius: 2,
                background: "#1a1a1a",
                transition: "all .2s",
                transform: drawerOpen
                  ? i === 0 ? "rotate(45deg) translate(4px, 4px)"
                  : i === 1 ? "scaleX(0)"
                  : "rotate(-45deg) translate(4px, -4px)"
                  : "none",
                opacity: drawerOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚀</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", letterSpacing: "-.3px" }}>ProjectFlow</span>
          </div>

          {/* Séparateur */}
          <div style={{ width: 1, height: 20, background: "#E8EAED" }} />

          {/* Titre page courante */}
          <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{PAGE_TITLES[activePage]}</span>
        </div>

        {/* Droite : filtres + actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(activePage === "kanban" || activePage === "mytickets") && (<>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#ADB5BD" }}>🔎</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 8, padding: "7px 12px 7px 28px", fontSize: 12, color: "#1a1a1a", outline: "none", width: 160 }} />
            </div>
            <select value={filtPrio || ""} onChange={e => setFiltPrio(e.target.value || null)}
              style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#666", outline: "none", cursor: "pointer" }}>
              <option value="">Toutes priorités</option>
              {["Critique","Haute","Moyenne","Basse"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filtMember || ""} onChange={e => setFiltMember(e.target.value ? parseInt(e.target.value) : null)}
              style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#666", outline: "none", cursor: "pointer" }}>
              <option value="">Tous les membres</option>
              {ACCOUNTS.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
            </select>
            {(canDo(currentUser.id, "create_ticket") || !profiles[currentUser.id]) && (
              <Btn onClick={openCreate} variant="primary" size="sm">＋ Nouveau ticket</Btn>
            )}
          </>)}

          {/* Avatar utilisateur */}
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: currentUser.color + "22", border: `1.5px solid ${currentUser.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer", flexShrink: 0 }}
            title={currentUser.name}>
            {currentUser.avatar}
          </div>
        </div>
      </div>

      {/* Bannière mes tickets */}
      {myTickets.length > 0 && (activePage === "kanban" || activePage === "mytickets") && (
        <div style={{ background: `linear-gradient(90deg,${currentUser.color}10,transparent)`, borderBottom: `1px solid ${currentUser.color}22`, padding: "7px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>{currentUser.avatar}</span>
          <span style={{ fontSize: 12, color: "#495057" }}>
            <strong style={{ color: currentUser.color }}>À vous de jouer !</strong> — {myTickets.length} ticket{myTickets.length > 1 ? "s" : ""} en attente
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {myTickets.slice(0, 3).map(t => (
              <button key={t.id} onClick={() => openEdit(t)}
                style={{ background: isNewForMe(t) ? "#FFF5F5" : currentUser.color + "15", border: `1px solid ${isNewForMe(t) ? "#FFE3E3" : currentUser.color + "44"}`, borderRadius: 6, padding: "2px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600, color: isNewForMe(t) ? "#E03131" : currentUser.color, display: "flex", alignItems: "center", gap: 4 }}>
                {isNewForMe(t) && <span style={{ fontSize: 8, background: "#E03131", color: "#fff", padding: "0 4px", borderRadius: 3 }}>NEW</span>}
                #{t.id} {t.title.slice(0, 16)}{t.title.length > 16 ? "…" : ""}
              </button>
            ))}
          </div>
          <button onClick={() => setAlertModal(true)}
            style={{ marginLeft: "auto", background: "none", border: "1px solid #E8EAED", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", color: "#868E96" }}>
            🔔 Alertes
          </button>
        </div>
      )}

      {/* Bannière partagé */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F1F3F5", padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#ADB5BD" }}>👥 <strong style={{ color: "#3B5BDB" }}>Tableau partagé</strong> — Synchronisation automatique toutes les 3s</span>
        <button onClick={handleReset} style={{ background: "none", border: "1px solid #E8EAED", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#ADB5BD", cursor: "pointer" }}>♻️ Réinitialiser</button>
      </div>

      {/* ══ CONTENU ══ */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>

        {/* ── Kanban */}
        {activePage === "kanban" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {COLUMNS.map(col => {
                const cfg = COL_CFG[col];
                const cnt = filtered.filter(t => t.status === col).length;
                return (
                  <div key={col} style={{ flex: 1, background: "#fff", border: "1px solid #E8EAED", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot }} />
                    <div>
                      <div style={{ fontSize: 10, color: "#ADB5BD", fontWeight: 600, letterSpacing: ".3px", textTransform: "uppercase" }}>{col}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginTop: 1 }}>{cnt}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", alignItems: "flex-start", paddingBottom: 16 }}>
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col} column={col}
                  tickets={filtered.filter(t => t.status === col)}
                  currentUser={currentUser}
                  draggingId={draggingId} isOver={dragOver === col}
                  isNewForMe={isNewForMe}
                  onEdit={openEdit} onWorkflow={openWorkflow} onShare={openShare}
                  onTransfer={handleQuickTransfer}
                  onDragStart={onDragStart} onDragEnd={onDragEnd}
                  onDragOver={e => { e.preventDefault(); setDragOver(col); }}
                  onDrop={() => onDrop(col)}
                  onDragLeave={() => setDragOver(null)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Mes tickets */}
        {activePage === "mytickets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myTickets.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 0", color: "#ADB5BD" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Aucun ticket en attente !</div>
                </div>
              : myTickets.map(ticket => {
                  const prio    = ticket.priority;
                  const isNew   = isNewForMe(ticket);
                  const colors  = { Critique: "#E03131", Haute: "#E67E22", Moyenne: "#3B5BDB", Basse: "#2F9E44" };
                  const bgs     = { Critique: "#FFF5F5", Haute: "#FFF8F0", Moyenne: "#EEF2FF", Basse: "#EBFBEE" };
                  const ticketType = ticket.type ? TICKET_TYPES_MAP[ticket.type] : null;
                  const dueInfo    = getDueInfo(ticket);
                  return (
                    <div key={ticket.id} onClick={() => openEdit(ticket)}
                      style={{ background: "#fff", border: `1px solid ${isNew ? "#FFE3E3" : "#E8EAED"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = "#D0D5DD"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = isNew ? "#FFE3E3" : "#E8EAED"; }}>
                      <div style={{ width: 4, height: 48, background: colors[prio] || "#ADB5BD", borderRadius: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          {isNew && <span style={{ background: "#E03131", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>NEW</span>}
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{ticket.title}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <Badge color={colors[prio]} bg={bgs[prio]}>{prio}</Badge>
                          <Badge color={COL_CFG[ticket.status]?.dot} bg={COL_CFG[ticket.status]?.bg}>{ticket.status}</Badge>
                          {ticketType && (
                            <span style={{ background: ticketType.bg, color: ticketType.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, border: `1px solid ${ticketType.color}22`, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              {ticketType.icon} {ticketType.label}
                            </span>
                          )}
                          {dueInfo && (
                            <span style={{ background: dueInfo.bg, color: dueInfo.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, border: `1px solid ${dueInfo.color}33`, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              {dueInfo.icon} {dueInfo.label}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: "#ADB5BD", fontFamily: "monospace" }}>#{ticket.id}</span>
                        </div>
                      </div>
                      <Btn onClick={e => { e.stopPropagation(); openWorkflow(ticket); }} variant="secondary" size="sm">🔄 Transférer</Btn>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── Rapports */}
        {activePage === "reports" && <ReportsPage tickets={tickets} />}

        {/* ── Droits utilisateurs */}
        {activePage === "rights" && (
          <div style={{ background: "#fff", border: "1px solid #E8EAED", borderRadius: 12, overflow: "hidden", height: "calc(100vh - 160px)" }}>
            <UserRightsPanel profiles={profiles} onSave={saveProfiles} currentUser={currentUser} />
          </div>
        )}

        {/* ── Coming soon */}
        {["chat", "settings", "adminpanel"].includes(activePage) && (
          <div style={{ textAlign: "center", padding: "80px 0", animation: "fadeIn .3s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {{ chat: "💬", settings: "⚙️", adminpanel: "👤" }[activePage]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#1a1a1a", marginBottom: 8 }}>
              {{ chat: "Chat d'équipe", settings: "Paramètres", adminpanel: "Administration" }[activePage]}
            </div>
            <div style={{ fontSize: 14, color: "#868E96", marginBottom: 20 }}>Cette fonctionnalité est en cours de développement.</div>
            <Badge color="#3B5BDB" bg="#EEF2FF">🚀 Bientôt disponible</Badge>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}
      {modal?.type === "ticket" && (
        <TicketModal ticket={modal.data} currentUser={currentUser} onSave={handleSave} onDelete={handleDelete} onClose={closeModal} onOpenWorkflow={openWorkflow} onOpenShare={openShare} canDo={action => canDo(currentUser.id, action)} />
      )}
      {modal?.type === "workflow" && (
        <WorkflowModal ticket={modal.data} currentUser={currentUser} onApply={handleApplyWorkflow} onClose={closeModal} />
      )}
      {modal?.type === "share" && (
        <ShareModal ticket={modal.data} onClose={closeModal} />
      )}
    </div>
  );
}
