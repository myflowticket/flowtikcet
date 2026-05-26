
/**
 * App.jsx
 * ─────────────────────────────────────────────
 * Point d'entrée de l'application.
 * Gère uniquement la session utilisateur.
 * ─────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react"; import { ACCOUNTS }  from "./constants/accounts"; import { LoginPage } from "./components/Auth/LoginPage";
import { Board }     from "./components/Board/Board";
import "./styles/global.css";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("pf-user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (ACCOUNTS.find(a => a.id === user.id)) setCurrentUser(user);
      } catch (_) {}
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (account) => {
    const safeUser = { id: account.id, name: account.name, avatar: account.avatar, color: account.color, email: account.email };
    sessionStorage.setItem("pf-user", JSON.stringify(safeUser));
    setCurrentUser(safeUser);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("pf-user");
    setCurrentUser(null);
  };

  if (!authChecked) return null;
  if (!currentUser)  return <LoginPage onLogin={handleLogin} />;
  return <Board currentUser={currentUser} onLogout={handleLogout} />; }
