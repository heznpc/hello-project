"use client";

import { useLocale } from "@/lib/locale-context";
import { LOCALES } from "@/lib/i18n";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex gap-1 ml-auto">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className="px-2 py-0.5 text-xs rounded-full transition-all"
          style={{
            background:
              locale === l.code
                ? "linear-gradient(135deg, #fbcfe8, #f9a8d4)"
                : "transparent",
            color: locale === l.code ? "var(--text-primary)" : "var(--text-muted)",
            border:
              locale === l.code
                ? "1.5px solid var(--accent-pink)"
                : "1.5px solid transparent",
            fontWeight: locale === l.code ? 700 : 400,
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
