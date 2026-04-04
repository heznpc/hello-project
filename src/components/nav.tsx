"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { LocaleSwitcher } from "./locale-switcher";

export function Nav() {
  const { t } = useLocale();

  return (
    <nav className="ribbon-nav px-6 py-3 flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-xl">&#x2661;</span>
        <span className="font-bold text-lg tracking-tight sparkle-text">
          {t("nav.title") as string}
        </span>
        <span className="text-xl">&#x2661;</span>
      </Link>
      <div
        className="flex gap-4 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <Link
          href="/timeline"
          className="hover:opacity-70 transition flex items-center gap-1"
        >
          <span className="text-xs">&#x2729;</span>
          {t("nav.timeline") as string}
        </Link>
        <Link
          href="/distribution"
          className="hover:opacity-70 transition flex items-center gap-1"
        >
          <span className="text-xs">&#x2729;</span>
          {t("nav.distribution") as string}
        </Link>
      </div>
      <LocaleSwitcher />
    </nav>
  );
}
