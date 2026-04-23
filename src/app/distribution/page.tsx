"use client";

import { useState, useMemo } from "react";
import { useLocale } from "@/lib/locale-context";
import songsData from "@/data/songs.json";
import distributionsData from "@/data/distributions.json";
import membersData from "@/data/members.json";
import groupsData from "@/data/groups.json";
import type { Song, LineDistribution, Member, Group } from "@/lib/types";
import { DistributionChart } from "./distribution-chart";

export default function DistributionPage() {
  const { locale } = useLocale();
  const songs = songsData as Song[];
  const distributions = distributionsData as LineDistribution[];
  const members = membersData as Member[];
  const groups = groupsData as Group[];

  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  );
  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups]
  );
  const distMap = useMemo(
    () => new Map(distributions.map((d) => [d.songId, d])),
    [distributions]
  );

  // Only songs that have distribution data
  const songsWithDist = useMemo(
    () => songs.filter((s) => distMap.has(s.id)),
    [songs, distMap]
  );

  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedSong, setSelectedSong] = useState<string | null>(
    songsWithDist[0]?.id ?? null
  );

  const filteredSongs = useMemo(() => {
    return songsWithDist.filter((s) => {
      if (selectedGroup !== "all" && s.groupId !== selectedGroup) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.titleJa.toLowerCase().includes(q) ||
          s.titleEn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [songsWithDist, selectedGroup, search]);

  const activeDist = selectedSong ? distMap.get(selectedSong) : null;
  const activeSong = selectedSong
    ? songs.find((s) => s.id === selectedSong)
    : null;

  // Groups that actually have distribution data
  const activeGroupIds = useMemo(
    () => [...new Set(songsWithDist.map((s) => s.groupId))],
    [songsWithDist]
  );

  const labels: Record<string, Record<string, string>> = {
    title: {
      ko: "파트 분배 분석",
      ja: "パート分析",
      en: "Line Distribution",
    },
    allGroups: { ko: "전체", ja: "すべて", en: "All" },
    searchPlaceholder: {
      ko: "곡 검색...",
      ja: "楽曲を検索...",
      en: "Search songs...",
    },
    songs: { ko: "곡", ja: "曲", en: "songs" },
    selectSong: {
      ko: "곡을 선택하세요",
      ja: "楽曲を選択してください",
      en: "Select a song",
    },
  };

  const l = (key: string) => labels[key]?.[locale] ?? labels[key]?.["en"] ?? key;

  return (
    <div className="flex flex-1 h-[calc(100vh-49px)] overflow-hidden">
      {/* Song list sidebar */}
      <div className="princess-sidebar w-72 shrink-0 flex flex-col overflow-hidden">
        <div className="p-4 space-y-3">
          <h2
            className="font-bold text-sm sparkle-text"
          >
            {l("title")} ({songsWithDist.length} {l("songs")})
          </h2>

          {/* Group filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedGroup("all")}
              className="px-2 py-0.5 text-xs rounded-full transition"
              style={{
                background:
                  selectedGroup === "all"
                    ? "linear-gradient(135deg, #fbcfe8, #f9a8d4)"
                    : "transparent",
                border:
                  selectedGroup === "all"
                    ? "1.5px solid var(--accent-pink)"
                    : "1.5px solid var(--border-soft)",
                color: "var(--text-secondary)",
                fontWeight: selectedGroup === "all" ? 700 : 400,
              }}
            >
              {l("allGroups")}
            </button>
            {activeGroupIds.map((gId) => {
              const g = groupMap.get(gId);
              return (
                <button
                  key={gId}
                  onClick={() => setSelectedGroup(gId)}
                  className="px-2 py-0.5 text-xs rounded-full transition"
                  style={{
                    background:
                      selectedGroup === gId
                        ? "linear-gradient(135deg, #fbcfe8, #f9a8d4)"
                        : "transparent",
                    border:
                      selectedGroup === gId
                        ? `1.5px solid ${g?.color || "var(--accent-pink)"}`
                        : "1.5px solid var(--border-soft)",
                    color: "var(--text-secondary)",
                    fontWeight: selectedGroup === gId ? 700 : 400,
                  }}
                >
                  {g?.nameEn || gId}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={l("searchPlaceholder")}
            className="w-full px-3 py-1.5 text-sm rounded-lg outline-none"
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-lace)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filteredSongs.map((song) => {
            const group = groupMap.get(song.groupId);
            const isActive = selectedSong === song.id;
            return (
              <button
                key={song.id}
                onClick={() => setSelectedSong(song.id)}
                className="w-full text-left px-3 py-2 rounded-lg mb-1 transition-all"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #fce7f3, #fff0f6)"
                    : "transparent",
                  border: isActive
                    ? "1.5px solid var(--border-lace)"
                    : "1.5px solid transparent",
                }}
              >
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {song.titleEn}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: group?.color }}
                  />
                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {group?.nameEn} - {song.releaseDate}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart area */}
      <div
        className="flex-1 overflow-auto p-6"
        style={{ background: "var(--bg-card)" }}
      >
        {activeDist && activeSong ? (
          <DistributionChart
            song={activeSong}
            distribution={activeDist}
            memberMap={memberMap}
            groupMap={groupMap}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "var(--text-muted)" }}>{l("selectSong")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
