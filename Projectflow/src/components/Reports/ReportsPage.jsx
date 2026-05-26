/**
 * ReportsPage.jsx
 * ─────────────────────────────────────────────
 * Page Rapports & KPI avec export Excel (CSV).
 * Filtres : période + membre.
 * ─────────────────────────────────────────────
 */

import React, { useState } from "react";
import { ACCOUNTS }        from "../../constants/accounts";
import { COLUMNS, COL_CFG, PRIORITIES } from "../../constants/config";
import { getPriority }     from "../../utils/helpers";
import { Btn, Badge }      from "../UI/UI";

export function ReportsPage({ tickets }) {
  const [period,     setPeriod]     = useState("all");
  const [filtMember, setFiltMember] = useState(null);
  const [exporting,  setExporting]  = useState(false);

  // ── Filtrage par période
  const getStartDate = () => {
    const now = Date.now();
    if (period === "week")  return now - 7  * 24 * 3600 * 1000;
    if (period === "month") return now - 30 * 24 * 3600 * 1000;
    return 0;
  };

  const filtered = tickets.filter(t =>
    (t.createdAt || 0) >= getStartDate() &&
    (!filtMember || t.assignee === filtMember)
  );

  // ── KPI globaux
  const total       = filtered.length;
  const done        = filtered.filter(t => t.status === "Terminé").length;
  const inProgress  = filtered.filter(t => t.status === "En cours").length;
  const toDo        = filtered.filter(t => t.status === "À faire").length;
  const inReview    = filtered.filter(t => t.status === "En révision").length;
  const closureRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const critical    = filtered.filter(t => t.priority === "Critique").length;

  // ── KPI par membre
  const memberStats = ACCOUNTS.map(m => {
    const mt      = filtered.filter(t => t.assignee === m.id);
    const mdone   = mt.filter(t => t.status === "Terminé").length;
    const mpending = mt.filter(t => t.status !== "Terminé").length;
    const mrate   = mt.length > 0 ? Math.round((mdone / mt.length) * 100) : 0;
    return { member: m, total: mt.length, done: mdone, pending: mpending, rate: mrate };
  });

  // ── KPI par priorité
  const prioStats = PRIORITIES.map(p => ({
    priority: p,
    count:    filtered.filter(t => t.priority === p.label).length,
    done:     filtered.filter(t => t.priority === p.label && t.status === "Terminé").length,
  }));

  // ── KPI par statut
  const statusStats = COLUMNS.map(col => ({
    col, count: filtered.filter(t => t.status === col).length, cfg: COL_CFG[col],
  }));

  // ── Export Excel (CSV compatible)
  const exportToExcel = () => {
    setExporting(true);
    const toCSV = rows => rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");

    const ticketRows = [
      ["ID","Titre","Description","Statut","Priorité","Assigné","Tags","Date création","Date début","Date échéance"],
      ...filtered.map(t => [
        `#${t.id}`, t.title, t.description || "", t.status, t.priority,
        ACCOUNTS.find(m => m.id === t.assignee)?.name || "Non assigné",
        (t.tags || []).join(", "),
        t.createdAt  ? new Date(t.createdAt).toLocaleDateString("fr-FR")  : "",
        t.startDate  ? new Date(t.startDate).toLocaleDateString("fr-FR")  : "",
        t.dueDate    ? new Date(t.dueDate).toLocaleDateString("fr-FR")    : "",
      ])
    ];

    const memberRows = [
      ["Membre","Total","Terminés","En attente","Taux clôture"],
      ...memberStats.map(s => [s.member.name, s.total, s.done, s.pending, `${s.rate}%`])
    ];

    const prioRows = [
      ["Priorité","Total","Terminés","En cours"],
      ...prioStats.map(s => [s.priority.label, s.count, s.done, s.count - s.done])
    ];

    const globalRows = [
      ["Indicateur","Valeur"],
      ["Total tickets",     total],
      ["Terminés",          done],
      ["En cours",          inProgress],
      ["À faire",           toDo],
      ["En révision",       inReview],
      ["Taux de clôture",   `${closureRate}%`],
      ["Critiques",         critical],
      ["Période",           period === "week" ? "7 jours" : period === "month" ? "30 jours" : "Tout"],
      ["Exporté le",        new Date().toLocaleDateString("fr-FR")],
    ];

    const csv = "SEP=;\n" +
      "=== RAPPORT GLOBAL ===\n"  + toCSV(globalRows) +
      "\n\n=== TICKETS ===\n"     + toCSV(ticketRows) +
      "\n\n=== PAR MEMBRE ===\n"  + toCSV(memberRows) +
      "\n\n=== PAR PRIORITÉ ===\n"+ toCSV(prioRows);

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ProjectFlow_Rapport_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 1000);
  };

  // ── Styles helpers
  const card = (extra = {}) => ({ background: "#fff", border: "1px solid #E8EAED", borderRadius: 12, padding: "18px 20px", ...extra });

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>

      {/* Topbar filtres + export */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

          {/* Filtre période */}
          <div style={{ display: "flex", background: "#fff", border: "1px solid #E8EAED", borderRadius: 8, overflow: "hidden" }}>
            {[{ id: "all", label: "Tout" }, { id: "week", label: "7 jours" }, { id: "month", label: "30 jours" }].map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                style={{ padding: "7px 14px", border: "none", background: period === p.id ? "#1a1a1a" : "transparent", color: period === p.id ? "#fff" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Filtre membre */}
          <select value={filtMember || ""} onChange={e => setFiltMember(e.target.value ? parseInt(e.target.value) : null)}
            style={{ background: "#fff", border: "1px solid #E8EAED", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#666", outline: "none", cursor: "pointer" }}>
            <option value="">Tous les membres</option>
            {ACCOUNTS.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
          </select>

          <span style={{ fontSize: 12, color: "#ADB5BD" }}>{filtered.length} ticket{filtered.length > 1 ? "s" : ""}</span>
        </div>

        {/* Export Excel */}
        <button onClick={exportToExcel} disabled={exporting}
          style={{ display: "flex", alignItems: "center", gap: 8, background: exporting ? "#F8F9FA" : "#1a1a1a", color: exporting ? "#ADB5BD" : "#fff", border: `1px solid ${exporting ? "#E8EAED" : "#1a1a1a"}`, borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {exporting ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Export…</> : <>📥 Exporter en Excel</>}
        </button>
      </div>

      {/* KPI globaux */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total",        val: total,         color: "#1a1a1a", icon: "🎫" },
          { label: "Terminés",     val: done,          color: "#2F9E44", icon: "✅" },
          { label: "En cours",     val: inProgress,    color: "#E67E22", icon: "⚙️"  },
          { label: "À faire",      val: toDo,          color: "#3B5BDB", icon: "📋" },
          { label: "En révision",  val: inReview,      color: "#00BCD4", icon: "🔍" },
          { label: "Taux clôture", val: `${closureRate}%`, color: "#2F9E44", icon: "📈" },
          { label: "Critiques",    val: critical,      color: "#E03131", icon: "🔥" },
        ].map((kpi, i) => (
          <div key={i} style={card()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ADB5BD", letterSpacing: ".5px", textTransform: "uppercase" }}>{kpi.label}</div>
              <span style={{ fontSize: 16 }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: kpi.color }}>{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Graphique statuts */}
      <div style={{ ...card(), marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 16 }}>Répartition par statut</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 120 }}>
          {statusStats.map(({ col, count, cfg }) => {
            const maxCount = Math.max(...statusStats.map(s => s.count), 1);
            const height   = total > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 8 : 0) : 0;
            return (
              <div key={col} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: cfg.dot }}>{count}</div>
                <div style={{ width: "100%", height: `${height}%`, minHeight: count > 0 ? 8 : 0, background: cfg.dot, borderRadius: "6px 6px 0 0", transition: "height .4s ease", opacity: .85 }} />
                <div style={{ fontSize: 10, color: "#ADB5BD", fontWeight: 600, textAlign: "center" }}>{col}</div>
              </div>
            );
          })}
        </div>
        {total === 0 && <div style={{ textAlign: "center", color: "#ADB5BD", fontSize: 13, padding: "20px 0" }}>Aucun ticket dans la période</div>}
      </div>

      {/* KPI par membre */}
      <div style={{ ...card(), marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 16 }}>Performance par membre</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, padding: "8px 12px", background: "#F8F9FA", borderRadius: 8, marginBottom: 8 }}>
          {["Membre", "Total", "Terminés", "En attente", "Taux"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#ADB5BD", letterSpacing: ".5px" }}>{h}</div>
          ))}
        </div>
        {memberStats.map(({ member: m, total: mt, done: md, pending: mp, rate: mr }) => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, padding: "12px", borderBottom: "1px solid #F8F9FA", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.color + "22", border: `1.5px solid ${m.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{m.avatar}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: "#ADB5BD" }}>{m.email}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{mt}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2F9E44" }}>{md}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#E67E22" }}>{mp}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 6, background: "#F1F3F5", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${mr}%`, height: "100%", background: mr > 66 ? "#2F9E44" : mr > 33 ? "#E67E22" : "#E03131", borderRadius: 3, transition: "width .4s ease" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: mr > 66 ? "#2F9E44" : mr > 33 ? "#E67E22" : "#E03131", minWidth: 32 }}>{mr}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* KPI par priorité */}
      <div style={{ ...card(), marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 16 }}>Répartition par priorité</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {prioStats.map(({ priority: p, count, done: d }) => (
            <div key={p.label} style={{ background: p.bg, border: `1px solid ${p.color}33`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: p.color }}>{p.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{count}</div>
              <div style={{ fontSize: 11, color: "#868E96" }}>{d} terminé{d > 1 ? "s" : ""} · {count - d} en cours</div>
              {count > 0 && (
                <div style={{ marginTop: 8, height: 4, background: "rgba(0,0,0,.08)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${Math.round((d / count) * 100)}%`, height: "100%", background: p.color, borderRadius: 2, transition: "width .4s ease" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Liste détaillée */}
      <div style={card()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>Liste détaillée</div>
          <span style={{ fontSize: 12, color: "#ADB5BD" }}>{filtered.length} ticket{filtered.length > 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1fr 1fr", gap: 12, padding: "8px 12px", background: "#F8F9FA", borderRadius: 8, marginBottom: 4 }}>
          {["ID", "Titre", "Statut", "Priorité", "Assigné", "Créé le"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#ADB5BD", letterSpacing: ".4px" }}>{h}</div>
          ))}
        </div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {filtered.length === 0
            ? <div style={{ textAlign: "center", color: "#ADB5BD", fontSize: 13, padding: "24px 0" }}>Aucun ticket dans la sélection</div>
            : filtered.map(t => {
              const prio   = getPriority(t.priority);
              const member = ACCOUNTS.find(m => m.id === t.assignee);
              return (
                <div key={t.id} style={{ display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1fr 1fr", gap: 12, padding: "10px 12px", borderBottom: "1px solid #F8F9FA", alignItems: "center", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 11, color: "#ADB5BD", fontFamily: "monospace" }}>#{t.id}</div>
                  <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  <Badge color={COL_CFG[t.status]?.dot} bg={COL_CFG[t.status]?.bg}>{t.status}</Badge>
                  <Badge color={prio.color} bg={prio.bg}>{prio.icon} {prio.label}</Badge>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {member ? <><span>{member.avatar}</span><span style={{ fontSize: 12 }}>{member.name}</span></> : <span style={{ fontSize: 12, color: "#ADB5BD" }}>—</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#ADB5BD" }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString("fr-FR") : "—"}</div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

