
/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────
 * Page de connexion avec email + mot de passe.
 * Connexion rapide par avatar pour les démos.
 * ─────────────────────────────────────────────
 */

import React, { useState } from "react";
import { ACCOUNTS }        from "../../constants/accounts";
import { DEFAULT_USER_PROFILES, ROLES } from "../../constants/roles"; import { Btn, Input, Field } from "../UI/UI";

export function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const doLogin = async (account) => {
    if (account) { onLogin(account); return; }
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const found = ACCOUNTS.find(a =>
      a.email.toLowerCase() === email.toLowerCase().trim() &&
      a.password === password
    );
    found ? onLogin(found) : setError("Email ou mot de passe incorrect.");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F4F6F8",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeIn .4s ease" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "#1a1a1a",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 14, boxShadow: "0 8px 24px rgba(0,0,0,.15)",
            animation: "float 3s ease-in-out infinite",
          }}>🚀</div>
          <div style={{ fontWeight: 700, fontSize: 22, color: "#1a1a1a", letterSpacing: "-.5px" }}>
            ProjectFlow
          </div>
          <div style={{ fontSize: 13, color: "#868E96", marginTop: 4 }}>
            Connectez-vous à votre espace
          </div>
        </div>

        {/* Carte */}
        <div style={{
          background: "#fff", border: "1px solid #E8EAED",
          borderRadius: 16, padding: 28,
          boxShadow: "0 4px 24px rgba(0,0,0,.06)",
        }}>
          {/* Hint démo */}
          <div style={{
            background: "#F8F9FF", border: "1px solid #E0E7FF",
            borderRadius: 10, padding: "10px 14px", marginBottom: 22,
            fontSize: 12, color: "#666",
          }}>
            💡 <strong style={{ color: "#3B5BDB" }}>Démo :</strong> alice@projectflow.io / alice123
          </div>

          <Field label="Adresse e-mail">
            <Input
              type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="votre@email.com"
            />
          </Field>

          <Field label="Mot de passe">
            <div style={{ position: "relative" }}>
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
              />
              <button onClick={() => setShowPass(s => !s)} style={{
                position: "absolute", right: 10, top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", fontSize: 15, color: "#ADB5BD",
              }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </Field>

          {/* Erreur */}
          {error && (
            <div style={{
              background: "#FFF5F5", border: "1px solid #FFE3E3",
              borderRadius: 8, padding: "8px 12px", marginBottom: 12,
              fontSize: 12, color: "#E03131",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Bouton connexion */}
          <Btn
            onClick={() => doLogin()}
            disabled={loading || !email || !password}
            variant="primary" size="lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          >
            {loading
              ? <><span className="pf-animate-spin" style={{ display: "inline-block" }}>⟳</span> Connexion…</>
              : "Se connecter →"
            }
          </Btn>

          {/* Connexion rapide */}
          <div style={{ marginTop: 22, borderTop: "1px solid #F1F3F5", paddingTop: 18 }}>
            <div style={{
              fontSize: 11, color: "#ADB5BD", textAlign: "center",
              marginBottom: 12, fontWeight: 600, letterSpacing: ".5px",
            }}>
              CONNEXION RAPIDE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ACCOUNTS.map(account => (
                <button
                  key={account.id}
                  onClick={() => doLogin(account)}
                  style={{
                    background: "#F8F9FA", border: "1px solid #E8EAED",
                    borderRadius: 10, padding: "9px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "all .15s", fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = account.color; e.currentTarget.style.background = account.color + "11"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8EAED"; e.currentTarget.style.background = "#F8F9FA"; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: account.color + "22", border: `1.5px solid ${account.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                  }}>
                    {account.avatar}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#1a1a1a" }}>{account.name}</div>
                    <div style={{ fontSize: 9, color: "#ADB5BD" }}>
                      {(DEFAULT_USER_PROFILES[account.id]?.roles || []).map(r => ROLES[r]?.label).join(", ")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

