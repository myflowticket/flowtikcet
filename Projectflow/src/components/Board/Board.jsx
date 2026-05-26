
/**
 * Board.jsx
 * ─────────────────────────────────────────────
 * Composant principal du tableau Kanban.
 * Orchestre les colonnes, les modals et la sidebar.
 * ─────────────────────────────────────────────
 */

import React, { useState, useRef } from "react";
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

export function Board({ currentUser, onLogout }) {
  const { tickets, nextId, loading, syncing, lastSync, persist } = useTicketStorage();
  const { profiles, saveProfiles, canDo, canSee }                = useProfiles();
  const { alertModal, setAlertModal, newTickets, isNewForMe }    = useNotifications(currentUser, tickets, loading);

  const [activePage, setActivePage] = useState("kanban");
  const [modal,      setModal]      = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver,   setDragOver]   = useState(null);
  const [search,     setSearch]     = useState("");
  const [filtPrio,   setFiltPrio]   = useState(null);
  const [filtMember, setFiltMember] = useState(null);

  const dragRef = useRef(null);

  const filtered  = tickets.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return ms && (!filtPrio || t.priority === filtPrio) && (!filtMember || t.assignee === filtMember);
  });
  const myTickets = tickets.filter(t => t.assignee === currentUser.id && t.status !== "Terminé");
  const newCount  = myTickets.filter(t => isNewForMe(t)).length;

  // ── Modals
  const openCreate   = () => setModal({ type: "ticket", data: { title: "", description: "", status: "À faire", priority: "Moyenne", assignee: currentUser.id, tags: [], attachments: [], history: [], createdAt: Date.now(), assignedAt: Date.now(), startDate: null, dueDate: null } });
  const openEdit     = t  => setModal({ type: "ticket",   data: t });
  const openWorkflow = t  => setModal({ type: "workflow",  data: t });
  const openShare    = t  => setModal({ type: "share",     data: t });
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

  // ── Sidebar items
  const NAV_ITEMS = [
    { id: "kanban",    icon: "📋", label: "Tableau",         screen: "kanban",    badge: null },
    { id: "mytickets", icon: "🎫", label: "Mes tickets",     screen: "mytickets", badge: myTickets.length || null, badgeNew: newCount > 0 },
    { id: "reports",   icon: "📊", label: "Rapports",        screen: "reports",   badge: null },
    { id: "chat",      icon: "💬", label: "Chat",            screen: "chat",      badge: null, soon: true },
  ];
  const SETTINGS_ITEMS = [
    { id: "settings",   icon: "⚙️",  label: "Paramètres",         screen: "settings", soon: true },
    { id: "rights",     icon: "🔐", label: "Droits utilisateurs", screen: "admin"  },
    { id: "adminpanel", icon: "👤", label: "Admin",               screen: "admin",    soon: true },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F4F6F8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 40, animation: "spin 1s linear infinite" }}>🚀</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a" }}>Chargement…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F8", display: "flex" }}>

      {/* Alert modal */}
      {alertModal && newTickets.length > 0 && (
        <AlertModal
          currentUser={currentUser}
          tickets={newTickets}
          onViewTicket={t => { setAlertModal(false); openEdit(t); }}
          onClose={() => setAlertModal(false)}
        />
      )}

      {/* ══ SIDEBAR ══ */}
      <div className="pf-sidebar">
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #F1F3F5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚀</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", letterSpacing: "-.3px" }}>ProjectFlow</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, paddingLeft: 2 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: syncing ? "#E67E22" : "#2F9E44", animation: syncing ? "pulse 1s infinite" : "none" }} />
            <span style={{ fontSize: 10, color: "#ADB5BD" }}>
              {syncing ? "Synchro…" : lastSync ? lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "En direct"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: "8px 8px", flex: 1, overflowY: "auto" }}>
          <div className="pf-section-label">Navigation</div>
          {NAV_ITEMS.map(item => {
            if (!canSee(currentUser.id, item.screen)) return null;
            const active = activePage === item.id;
            return (
              <div key={item.id} onClick={() => !item.soon && setActivePage(item.id)} className="pf-sidebar-item"
                style={{ padding: "8px 10px", borderRadius: 8, cursor: item.soon ? "default" : "pointer", display: "flex", alignItems: "center", gap: 10, background: active ? "#F0F4FF" : "transparent", color: active ? "#3B5BDB" : "#495057", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all .15s", marginBottom: 2, opacity: item.soon ? .5 : 1 }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.soon && <span style={{ fontSize: 9, color: "#ADB5BD", background: "#F1F3F5", padding: "1px 6px", borderRadius: 4 }}>bientôt</span>}
                {item.badge && <span style={{ background: item.badgeNew ? "#E03131" : "#E8EAED", color: item.badgeNew ? "#fff" : "#666", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100 }}>{item.badge}</span>}
              </div>
            );
          })}

          <div className="pf-section-label">Configuration</div>
          {SETTINGS_ITEMS.map(item => {
            if (!canSee(currentUser.id, item.screen)) return null;
            const active = activePage === item.id;
            return (
              <div key={item.id} onClick={() => !item.soon && setActivePage(item.id)} className="pf-sidebar-item"
                style={{ padding: "8px 10px", borderRadius: 8, cursor: item.soon ? "default" : "pointer", display: "flex", alignItems: "center", gap: 10, background: active ? "#F0F4FF" : "transparent", color: active ? "#3B5BDB" : "#495057", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all .15s", marginBottom: 2, opacity: item.soon ? .5 : 1 }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.soon && <span style={{ fontSize: 9, color: "#ADB5BD", background: "#F1F3F5", padding: "1px 6px", borderRadius: 4 }}>bientôt</span>}
              </div>
            );
          })}
        </div>

        {/* User card */}
        <div style={{ padding: "12px", borderTop: "1px solid #F1F3F5" }}>
          <div style={{ background: "#F8F9FA", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: currentUser.color + "22", border: `1.5px solid ${currentUser.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{currentUser.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#1a1a1a" }}>{currentUser.name}</div>
              <div style={{ fontSize: 10, color: "#ADB5BD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {(profiles[currentUser.id]?.roles || []).map(r => ROLES[r]?.label).join(", ") || "Aucun rôle"}
              </div>
            </div>
            <button onClick={onLogout} title="Déconnexion"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ADB5BD", padding: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = "#E03131"}
              onMouseLeave={e => e.currentTarget.style.color = "#ADB5BD"}>
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div className="pf-main">

        {/* Topbar */}
        <div className="pf-topbar">
          <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>
            {{ kanban: "Tableau Kanban", mytickets: "Mes tickets", reports: "Rapports & KPI", rights: "Droits utilisateurs", chat: "Chat", settings: "Paramètres", adminpanel: "Administration" }[activePage]}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {(activePage === "kanban" || activePage === "mytickets") && (<>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#ADB5BD" }}>🔎</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                  style={{ background: "#F8F9FA", border: "1px solid #E8EAED", borderRadius: 8, padding: "7px 12px 7px 28px", fontSize: 12, color: "#1a1a1a", outline: "none", width: 180 }} />
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
              {canDo(currentUser.id, "create_ticket") && (
                <Btn onClick={openCreate} variant="primary" size="sm">＋ Nouveau ticket</Btn>
              )}
            </>)}
          </div>
        </div>

        {/* Bannière mes tickets */}
        {myTickets.length > 0 && (activePage === "kanban" || activePage === "mytickets") && (
          <div style={{ background: `linear-gradient(90deg,${currentUser.color}10,transparent)`, borderBottom: `1px solid ${currentUser.color}22`, padding: "8px 28px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
        <div style={{ background: "#fff", borderBottom: "1px solid #F1F3F5", padding: "7px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#ADB5BD" }}>👥 <strong style={{ color: "#3B5BDB" }}>Tableau partagé</strong> — Synchronisation automatique toutes les 3 s</span>
          <button onClick={handleReset} style={{ background: "none", border: "1px solid #E8EAED", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#ADB5BD", cursor: "pointer" }}>♻️ Réinitialiser</button>
        </div>

        {/* ══ PAGES ══ */}
        <div style={{ flex: 1, padding: "20px 28px", overflowY: "auto" }}>

          {/* Kanban */}
          {activePage === "kanban" && (
            <div>
              {/* Stats */}
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

              {/* Colonnes */}
              <div style={{ display: "flex", gap: 14, overflowX: "auto", alignItems: "flex-start", paddingBottom: 16 }}>
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col}
                    column={col}
                    tickets={filtered.filter(t => t.status === col)}
                    currentUser={currentUser}
                    draggingId={draggingId}
                    isOver={dragOver === col}
                    isNewForMe={isNewForMe}
                    onEdit={openEdit}
                    onWorkflow={openWorkflow}
                    onShare={openShare}
                    onTransfer={handleQuickTransfer}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={e => { e.preventDefault(); setDragOver(col); }}
                    onDrop={() => onDrop(col)}
                    onDragLeave={() => setDragOver(null)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mes tickets */}
          {activePage === "mytickets" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myTickets.length === 0
                ? <div style={{ textAlign: "center", padding: "60px 0", color: "#ADB5BD" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Aucun ticket en attente !</div>
                  </div>
                : myTickets.map(ticket => {
                    const prio   = ticket.priority;
                    const isNew  = isNewForMe(ticket);
                    const p      = ["Critique","Haute","Moyenne","Basse"].find(l => l === prio);
                    const colors = { Critique: "#E03131", Haute: "#E67E22", Moyenne: "#3B5BDB", Basse: "#2F9E44" };
                    const bgs    = { Critique: "#FFF5F5", Haute: "#FFF8F0", Moyenne: "#EEF2FF", Basse: "#EBFBEE" };
                    return (
                      <div key={ticket.id} onClick={() => openEdit(ticket)}
                        style={{ background: "#fff", border: `1px solid ${isNew ? "#FFE3E3" : "#E8EAED"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = "#D0D5DD"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = isNew ? "#FFE3E3" : "#E8EAED"; }}>
                        <div style={{ width: 4, height: 40, background: colors[prio] || "#ADB5BD", borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            {isNew && <span style={{ background: "#E03131", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>NEW</span>}
                            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{ticket.title}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <Badge color={colors[prio]} bg={bgs[prio]}>{prio}</Badge>
                            <Badge color={COL_CFG[ticket.status]?.dot} bg={COL_CFG[ticket.status]?.bg}>{ticket.status}</Badge>
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

          {/* Rapports */}
          {activePage === "reports" && <ReportsPage tickets={tickets} />}

          {/* Droits utilisateurs */}
          {activePage === "rights" && (
            <div style={{ background: "#fff", border: "1px solid #E8EAED", borderRadius: 12, overflow: "hidden", height: "calc(100vh - 160px)" }}>
              <UserRightsPanel profiles={profiles} onSave={saveProfiles} />
            </div>
          )}

          {/* Coming soon */}
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

