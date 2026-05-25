
/**
 * useNotifications.js
 * ─────────────────────────────────────────────
 * Hook de notifications.
 * Détecte les nouveaux tickets assignés depuis
 * la dernière connexion de l'utilisateur.
 * ─────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react"; import { storage } from "./storage";

export function useNotifications(currentUser, tickets, loading) {
  const [alertModal,  setAlertModal]  = useState(false);
  const [newTickets,  setNewTickets]  = useState([]);
  const [lastLoginAt, setLastLoginAt] = useState(0);
  const checkedRef = useRef(false);

  useEffect(() => {
    // Attendre que les tickets soient chargés
    if (loading || tickets.length === 0 || checkedRef.current) return;
    checkedRef.current = true;

    const key = `lastlogin-${currentUser.id}`;

    const check = async () => {
      // Récupère la date de dernière connexion
      let last = 0;
      try {
        const r = await storage.getPrivate(key);
        if (r?.value) last = parseInt(r.value) || 0;
      } catch (_) {}

      setLastLoginAt(last);

      // Enregistre la connexion actuelle
      try { await storage.setPrivate(key, String(Date.now())); } catch (_) {}

      // Filtre les tickets nouveaux depuis la dernière connexion
      const fresh = tickets.filter(t =>
        t.assignee === currentUser.id &&
        t.status !== "Terminé" &&
        (t.assignedAt || t.createdAt || 0) > (last > 0 ? last : Date.now() - 30000)
      );

      if (fresh.length > 0) {
        setNewTickets(fresh);
        setAlertModal(true);
      }
    };

    check();
  }, [loading, tickets, currentUser.id]);

  // ── Détermine si un ticket est nouveau pour l'utilisateur courant
  const isNewForMe = useCallback((ticket) =>
    ticket.assignee === currentUser.id &&
    ticket.status !== "Terminé" &&
    lastLoginAt > 0 &&
    (ticket.assignedAt || ticket.createdAt || 0) > lastLoginAt,
  [currentUser.id, lastLoginAt]);

  return { alertModal, setAlertModal, newTickets, isNewForMe }; }

