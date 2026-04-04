"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import membersData from "@/data/members.json";
import groupsData from "@/data/groups.json";
import membershipsData from "@/data/memberships.json";
import type { Group } from "@/lib/types";

export default function Home() {
  const { t } = useLocale();
  const activeGroups = (groupsData as Group[]).filter((g) => !g.dissolved);
  const totalMembers = membersData.length;
  const totalMemberships = membershipsData.length;
  const years = new Date().getFullYear() - 1997;

  const stats = t("home.stats") as (
    m: number,
    g: number,
    ms: number
  ) => string;
  const timelineDesc = t("home.timeline.desc") as (
    g: number,
    y: number
  ) => string;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-2xl mb-2 float-anim">&#x2764;&#xFE0F;</p>
        <h1 className="text-3xl font-bold mb-3 sparkle-text">
          {t("home.title") as string}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {stats(totalMembers, groupsData.length, totalMemberships)}
        </p>
      </div>

      <div className="grid gap-5">
        <Link href="/timeline" className="princess-card block p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">&#x1F3B6;</span>
            <h2
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {t("home.timeline.title") as string}
            </h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {timelineDesc(groupsData.length, years)}
          </p>
        </Link>

        <Link href="/distribution" className="princess-card block p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">&#x1F3A4;</span>
            <h2
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {t("home.distribution.title") as string}
            </h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {t("home.distribution.desc") as string}
          </p>
        </Link>
      </div>

      <div className="mt-12">
        <h3
          className="text-center text-sm font-medium mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          &#x2500;&#x2500;&#x2500; {t("home.activeGroups") as string}{" "}
          &#x2500;&#x2500;&#x2500;
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {activeGroups.map((g) => (
            <span
              key={g.id}
              className="badge-pill inline-flex items-center gap-1.5"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              {g.nameEn}
            </span>
          ))}
        </div>
      </div>

      <div
        className="mt-16 text-center text-xs"
        style={{ color: "var(--border-lace)" }}
      >
        &#x2661; &#x2729; &#x2661; &#x2729; &#x2661; &#x2729; &#x2661;
      </div>
    </div>
  );
}
