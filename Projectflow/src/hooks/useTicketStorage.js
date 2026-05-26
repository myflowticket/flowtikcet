
/**
 * useTicketStorage.js
 * ─────────────────────────────────────────────
 * Hook de persistance des tickets.
 * Gère le chargement, la sauvegarde et le polling
 * toutes les 3 secondes pour la synchro temps réel.
 *
 * À terme : remplacer par Supabase avec subscriptions
 * temps réel pour éviter le polling.
 * ─────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react"; import { STORAGE_KEY, POLL_MS, DEFAULT_TICKETS } from "../constants/config"; import { storage } from "./storage";

export function useTicketStorage() {
  const [tickets,  setTickets]  = useState([]);
  const [nextId,   setNextId]   = useState(6);
  const [loading,  setLoading]  = useState(true);
  const [syncing,  setSyncing]  = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const versionRef = useRef(null);

  // ── Sauvegarde les tickets dans le stockage partagé
  const save = useCallback(async (list, nid) => {
    setSyncing(true);
    const version = Date.now();
    versionRef.current = version;
    await storage.set(STORAGE_KEY, JSON.stringify({ tickets: list, nextId: nid, version }));
    setLastSync(new Date());
    setSyncing(false);
  }, []);

  // ── Charge les tickets (silent = sans MAJ lastSync)
  const load = useCallback(async (silent = false) => {
    try {
      const result = await storage.get(STORAGE_KEY);
      if (result?.value) {
        const data = JSON.parse(result.value);
        // Mise à jour uniquement si la version a changé
        if (data.version !== versionRef.current) {
          versionRef.current = data.version;
          setTickets(data.tickets);
          setNextId(data.nextId || data.tickets.length + 1);
          if (!silent) setLastSync(new Date());
        }
      } else {
        // Premier lancement : charger les données de démo
        await save(DEFAULT_TICKETS, 6);
        setTickets(DEFAULT_TICKETS);
      }
    } catch {
      try {
        await save(DEFAULT_TICKETS, 6);
        setTickets(DEFAULT_TICKETS);
      } catch (_) {}
    }
    setLoading(false);
  }, [save]);

  // ── Chargement initial
  useEffect(() => { load(false); }, [load]);

  // ── Polling toutes les POLL_MS ms
  useEffect(() => {
    const interval = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  // ── Persiste une liste de tickets et met à jour l'état
  const persist = useCallback(async (list, nid) => {
    setTickets(list);
    if (nid !== undefined) setNextId(nid);
    await save(list, nid ?? nextId);
  }, [save, nextId]);

  return { tickets, nextId, loading, syncing, lastSync, persist }; }

