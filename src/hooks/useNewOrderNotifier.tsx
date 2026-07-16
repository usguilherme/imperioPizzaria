"use client";

import { useEffect, useRef, useState } from "react";

interface MinimalOrder {
  id: string;
}

const POLL_INTERVAL_MS = 8000;

export function useNewOrderNotifier() {
  const [pendingCount, setPendingCount] = useState(0);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  const playSound = () => {
    if (!soundUnlocked || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const checkForNewOrders = async () => {
    try {
      const res = await fetch("/api/orders/pending", { cache: "no-store" });
      const data: MinimalOrder[] = await res.json();

      const currentIds = new Set(data.map((o) => o.id));
      const previousIds = knownIdsRef.current;
      const freshIds = data.map((o) => o.id).filter((id) => !previousIds.has(id));

      if (!isFirstFetchRef.current && freshIds.length > 0) {
        setHasNewOrder(true);
        playSound();
        setTimeout(() => setHasNewOrder(false), 10000);
      }

      knownIdsRef.current = currentIds;
      isFirstFetchRef.current = false;
      setPendingCount(data.length);
    } catch {
      // falha de rede silenciosa; tenta de novo no próximo ciclo
    }
  };

  // Libera o áudio na primeira interação do usuário (autoplay policy dos navegadores)
  useEffect(() => {
    const unlock = () => {
      setSoundUnlocked(true);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    checkForNewOrders();
    const interval = setInterval(checkForNewOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // 🆕 Faz o título da aba piscar quando há pedido novo, útil se o
  // atendente estiver em outra aba do navegador
  useEffect(() => {
    if (!hasNewOrder) {
      document.title = "Império - Admin";
      return;
    }
    const originalTitle = document.title;
    let toggled = false;
    const blinkInterval = setInterval(() => {
      document.title = toggled ? originalTitle : "🔔 Novo Pedido!";
      toggled = !toggled;
    }, 1000);
    return () => {
      clearInterval(blinkInterval);
      document.title = "Império - Admin";
    };
  }, [hasNewOrder]);

  return { pendingCount, hasNewOrder, soundUnlocked, audioRef };
}