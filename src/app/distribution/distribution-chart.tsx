"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useLocale } from "@/lib/locale-context";
import type { Song, LineDistribution, Member, Group } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface Props {
  song: Song;
  distribution: LineDistribution;
  memberMap: Map<string, Member>;
  groupMap: Map<string, Group>;
}

// Generate a color for members without one
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
}

function memberName(m: Member | undefined, id: string, locale: Locale): string {
  if (!m) return id;
  if (locale === "ja") return m.nameJa || m.nameEn;
  if (locale === "ko") return m.nameKo || m.nameJa || m.nameEn;
  return m.nameEn;
}

export function DistributionChart({
  song,
  distribution,
  memberMap,
  groupMap,
}: Props) {
  const { locale } = useLocale();
  const [view, setView] = useState<"bar" | "pie">("bar");
  const group = groupMap.get(song.groupId);

  const data = distribution.lines.map((line) => {
    const member = memberMap.get(line.memberId);
    const color =
      member && member.color !== "#888888"
        ? member.color
        : group?.color || hashColor(line.memberId);
    return {
      name: memberName(member, line.memberId, locale),
      nameEn: member?.nameEn || line.memberId,
      percentage: line.percentage,
      color,
    };
  });

  const labels: Record<string, Record<string, string>> = {
    bar: { ko: "막대", ja: "バー", en: "Bar" },
    pie: { ko: "파이", ja: "パイ", en: "Pie" },
    distribution: { ko: "파트 비율", ja: "パート比率", en: "Part Distribution" },
    youtube: {
      ko: "▶ YouTube 공식 영상",
      ja: "▶ YouTube 公式 MV",
      en: "▶ Official MV on YouTube",
    },
    youtubeHint: {
      ko: "유튜브 검색 결과가 새 탭에서 열립니다. 공식 채널 영상이 보통 첫 결과입니다.",
      ja: "YouTube 検索結果が新しいタブで開きます。公式チャンネルの動画が通常先頭に表示されます。",
      en: "Opens YouTube search in a new tab. Official channel videos are usually first.",
    },
    gasazip: {
      ko: "📝 가사집 (한국어 번역)",
      ja: "📝 가사집 (韓国語訳)",
      en: "📝 Gasazip (Korean translation)",
    },
    gasazipHint: {
      ko: "가사집 (한국 팬덤이 운영하는 J-pop 한국어 번역 가사 사이트) 검색 결과로 이동",
      ja: "韓国の J-pop 翻訳歌詞サイト「가사집」の検索結果が開きます",
      en: "Opens search on Gasazip (Korean fan-run J-pop translation site)",
    },
    bugs: {
      ko: "🎵 벅스 가사",
      ja: "🎵 Bugs 歌詞",
      en: "🎵 Bugs lyrics",
    },
    bugsHint: {
      ko: "한국 음원 플랫폼 벅스의 가사 검색 (2026-02 H!P 스트리밍 개방 이후 등록된 곡 한정)",
      ja: "韓国の音楽プラットフォーム Bugs の歌詞検索 (2026-02 H!P 配信解禁後に登録された曲のみ)",
      en: "Bugs (Korean music platform) lyrics search — limited to tracks listed after the Feb 2026 H!P streaming launch",
    },
  };

  const l = (key: string) => labels[key]?.[locale] ?? labels[key]?.["en"] ?? key;

  // 외부 사이트 검색 deep-link.
  // 가사 전재 대신 deep-link 만 두는 이유:
  // - 가사는 JASRAC / KOMCA 등 권리자 등록 작품. 우리 사이트가 호스팅하면 명백한 침해.
  // - 외부 사이트가 어떤 라이센스로 가사를 게재하는지는 그 사이트 책임 영역.
  // - URL 형식만 확정해 두면 사이트가 자체적으로 변하더라도 코드 영향 0.
  const songTitle = song.titleJa || song.titleEn;
  const groupName = group?.nameJa || group?.nameEn || "";

  // YouTube: "official" 키워드 추가 → 공식 채널 영상이 거의 항상 첫 결과.
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${groupName} ${songTitle} official`.trim()
  )}`;
  // 가사집(gasazip.com): 한국 팬덤이 운영하는 한국어 J-pop 가사 번역 hub.
  // SPA 라 server-side 결과 검증 불가하나 검색 URL 형식 (`/search?q=`) 은 안정.
  const gasazipUrl = `https://gasazip.com/search?q=${encodeURIComponent(songTitle)}`;
  // 벅스: 한국 음원 플랫폼. 2026-02 H!P 전곡 스트리밍 개방 후 등록 시작.
  const bugsUrl = `https://music.bugs.co.kr/search/integrated?q=${encodeURIComponent(
    songTitle
  )}`;

  return (
    <div>
      {/* Song header */}
      <div className="mb-6">
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {song.titleJa !== song.titleEn ? (
            <>
              {song.titleJa}{" "}
              <span
                className="text-base font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                {song.titleEn}
              </span>
            </>
          ) : (
            song.titleEn
          )}
        </h2>
        <div
          className="flex items-center gap-2 mt-1 flex-wrap"
          style={{ color: "var(--text-muted)", fontSize: 14 }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: group?.color }}
          />
          {group?.nameEn} - {song.releaseDate} -{" "}
          {distribution.lines.length} members
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={l("youtubeHint")}
            className="ml-2 inline-flex items-center px-3 py-1 text-xs rounded-full transition hover:brightness-95"
            style={{
              background: "linear-gradient(135deg, #fee2e2, #fecaca)",
              border: "1.5px solid #fca5a5",
              color: "#991b1b",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {l("youtube")}
          </a>
          <a
            href={gasazipUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={l("gasazipHint")}
            className="inline-flex items-center px-3 py-1 text-xs rounded-full transition hover:brightness-95"
            style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "1.5px solid #fcd34d",
              color: "#854d0e",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {l("gasazip")}
          </a>
          <a
            href={bugsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={l("bugsHint")}
            className="inline-flex items-center px-3 py-1 text-xs rounded-full transition hover:brightness-95"
            style={{
              background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
              border: "1.5px solid #93c5fd",
              color: "#1e40af",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {l("bugs")}
          </a>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        {(["bar", "pie"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-3 py-1 text-xs rounded-full transition"
            style={{
              background:
                view === v
                  ? "linear-gradient(135deg, #fbcfe8, #f9a8d4)"
                  : "transparent",
              border:
                view === v
                  ? "1.5px solid var(--accent-pink)"
                  : "1.5px solid var(--border-soft)",
              color: "var(--text-secondary)",
              fontWeight: view === v ? 700 : 400,
            }}
          >
            {l(v)}
          </button>
        ))}
      </div>

      {/* Chart */}
      {view === "bar" ? (
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 40 + 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 120, right: 40 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "#9d174d", fontSize: 12 }}
              axisLine={{ stroke: "#f9a8d4" }}
              tickLine={{ stroke: "#fce7f3" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#831843", fontSize: 12 }}
              axisLine={{ stroke: "#f9a8d4" }}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={{
                background: "linear-gradient(135deg, #fff0f6, #fdf2f8)",
                border: "2px solid #f9a8d4",
                borderRadius: 12,
                color: "#831843",
                fontSize: 13,
              }}
              formatter={(value) => [`${value}%`, l("distribution")]}
            />
            <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={24}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center">
          <ResponsiveContainer width={500} height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={60}
                paddingAngle={2}
                label={({ name, value }) =>
                  `${name} ${value}%`
                }
                labelLine={{ stroke: "#f9a8d4" }}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "linear-gradient(135deg, #fff0f6, #fdf2f8)",
                  border: "2px solid #f9a8d4",
                  borderRadius: 12,
                  color: "#831843",
                  fontSize: 13,
                }}
                formatter={(value) => [`${value}%`, l("distribution")]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
