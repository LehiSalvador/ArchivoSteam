"use client";

// Estado de cliente del prototipo: guardados, overlays (buscar/menú/tráiler),
// preferencia de cookies y toast. Persistencia local (localStorage), igual que
// el diseño aprobado. No hay backend conectado en la Fase 1.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface Store {
  saved: number[];
  isSaved: (n: number) => boolean;
  toggleSave: (n: number) => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  trailerOpen: boolean;
  openTrailer: () => void;
  closeTrailer: () => void;
  cookie: string | null;
  cookieOpen: boolean;
  openCookiePrefs: () => void;
  acceptCookies: () => void;
  rejectCookies: () => void;
  toast: string;
  showToast: (m: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<number[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [cookie, setCookie] = useState<string | null>(null);
  const [cookieOpen, setCookieOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const sv = JSON.parse(localStorage.getItem("as_saved") || "[]");
      if (Array.isArray(sv)) setSaved(sv);
    } catch {
      /* ignore */
    }
    let ck: string | null = null;
    try {
      ck = localStorage.getItem("as_cookie");
    } catch {
      /* ignore */
    }
    setCookie(ck);
    setCookieOpen(!ck);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setTrailerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isSaved = useCallback((n: number) => saved.includes(n), [saved]);

  const toggleSave = useCallback((n: number) => {
    setSaved((prev) => {
      const next = prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n];
      try {
        localStorage.setItem("as_saved", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const showToast = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const acceptCookies = useCallback(() => {
    try {
      localStorage.setItem("as_cookie", "accepted");
    } catch {
      /* ignore */
    }
    setCookie("accepted");
    setCookieOpen(false);
  }, []);

  const rejectCookies = useCallback(() => {
    try {
      localStorage.setItem("as_cookie", "rejected");
    } catch {
      /* ignore */
    }
    setCookie("rejected");
    setCookieOpen(false);
  }, []);

  const value: Store = {
    saved,
    isSaved,
    toggleSave,
    searchOpen,
    openSearch: useCallback(() => setSearchOpen(true), []),
    closeSearch: useCallback(() => setSearchOpen(false), []),
    menuOpen,
    openMenu: useCallback(() => setMenuOpen(true), []),
    closeMenu: useCallback(() => setMenuOpen(false), []),
    trailerOpen,
    openTrailer: useCallback(() => setTrailerOpen(true), []),
    closeTrailer: useCallback(() => setTrailerOpen(false), []),
    cookie,
    cookieOpen,
    openCookiePrefs: useCallback(() => setCookieOpen(true), []),
    acceptCookies,
    rejectCookies,
    toast,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
