/**
 * UI.jsx
 * ─────────────────────────────────────────────
 * Composants UI réutilisables dans toute l'app.
 * Btn, Badge, Overlay, Input, Toggle, TabBar, Field
 * ─────────────────────────────────────────────
 */

import React from "react";

// ── Bouton générique
export function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style = {} }) {
  const base = {
    border: "none", borderRadius: 8, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .15s", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 6,
    ...style,
  };
  const sizes = {
    sm: { padding: "5px 12px",  fontSize: 12 },
    md: { padding: "8px 16px",  fontSize: 13 },
    lg: { padding: "10px 20px", fontSize: 14 },
  };
  const variants = {
    primary:   { background: disabled ? "#E8EAED" : "#1a1a1a", color: disabled ? "#AAA" : "#fff" },
    secondary: { background: "#fff",   color: "#1a1a1a", border: "1px solid #E8EAED" },
    blue:      { background: disabled ? "#E8EAED" : "#3B5BDB", color: disabled ? "#AAA" : "#fff" },
    danger:    { background: "#FFF5F5", color: "#E03131", border: "1px solid #FFE3E3" },
    ghost:     { background: "transparent", color: "#666", padding: "6px 10px" },
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      className="pf-btn"
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ── Badge coloré
export function Badge({ children, color = "#3B5BDB", bg = "#EEF2FF" }) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 100,
      border: `1px solid ${color}22`,
    }}>
      {children}
    </span>
  );
}

// ── Overlay (fond sombre + conteneur modal)
export function Overlay({ children, onClose, maxWidth = 560 }) {
  return (
    <div
      className="pf-overlay"
      onClick={e => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="pf-modal"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Input stylisé
export function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="pf-input"
      style={{
        width: "100%",
        border: "1px solid #E8EAED",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        color: "#1a1a1a",
        outline: "none",
        background: "#fff",
        transition: "all .2s",
        ...style,
      }}
    />
  );
}

// ── Toggle on/off
export function Toggle({ on = true, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? "linear-gradient(135deg,#3B5BDB,#8B5CF6)" : "rgba(0,0,0,.15)",
        flexShrink: 0, position: "relative", cursor: "pointer",
        transition: "background .2s",
      }}
    >
      <div style={{
        position: "absolute",
        right: on ? 3 : undefined,
        left: on ? undefined : 3,
        top: 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,.3)",
        transition: "all .2s",
      }} />
    </div>
  );
}

// ── Barre d'onglets
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: "flex", gap: 0, marginBottom: 20,
      borderBottom: "1px solid #F1F3F5",
    }}>
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            padding: "8px 16px", background: "none", border: "none",
            borderBottom: `2px solid ${active === id ? "#3B5BDB" : "transparent"}`,
            color: active === id ? "#3B5BDB" : "#868E96",
            fontSize: 13, fontWeight: active === id ? 600 : 400,
            cursor: "pointer", transition: "all .15s", fontFamily: "inherit",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Champ formulaire avec label
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: "#495057",
        display: "block", marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Style select réutilisable
export const selectStyle = {
  width: "100%",
  border: "1px solid #E8EAED",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  color: "#1a1a1a",
  outline: "none",
  background: "#fff",
};
