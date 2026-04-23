"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  type Locale,
  type TranslationKey,
  getTranslation,
  detectLocale,
} from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => unknown;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "ko",
  setLocale: () => {},
  t: (key: TranslationKey) => getTranslation(key, "ko"),
});

// External locale store synced with localStorage + navigator preference.
// Using useSyncExternalStore instead of useState+useEffect avoids
// React 19's set-state-in-effect lint and gives a deterministic
// server/client snapshot split that hydrates cleanly.
const listeners = new Set<() => void>();
let cached: Locale | null = null;

function notify() {
  cached = null;
  for (const cb of listeners) cb();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "hp-locale") notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getClientSnapshot(): Locale {
  if (cached !== null) return cached;
  cached = detectLocale();
  return cached;
}

function getServerSnapshot(): Locale {
  return "ko";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const setLocale = (l: Locale) => {
    cached = l;
    localStorage.setItem("hp-locale", l);
    document.documentElement.lang = l;
    for (const cb of listeners) cb();
  };

  const t = (key: TranslationKey) => getTranslation(key, locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
