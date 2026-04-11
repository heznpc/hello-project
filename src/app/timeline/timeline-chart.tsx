"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { useLocale } from "@/lib/locale-context";
import type { Member, Group, Membership } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

interface Props {
  members: Member[];
  groups: Group[];
  memberships: Membership[];
}

const LANE_HEIGHT = 32;
const MARGIN = { top: 40, right: 20, bottom: 30, left: 180 };
const BAR_HEIGHT = 22;
const MIN_YEAR = 1997;

function parseDate(d: string): Date {
  if (!d || d === "unknown") return new Date(MIN_YEAR, 0, 1);
  if (/^\d{4}$/.test(d)) return new Date(parseInt(d), 0, 1);
  return new Date(d);
}

function memberName(m: Member, locale: Locale): string {
  if (locale === "ja") return m.nameJa || m.nameEn;
  if (locale === "ko") return m.nameKo || m.nameJa || m.nameEn;
  return m.nameEn;
}

function groupName(g: Group, locale: Locale): string {
  if (locale === "ja") return g.nameJa || g.nameEn;
  return g.nameEn;
}

const LEAVE_REASON: Record<string, Record<Locale, string>> = {
  graduation: { ko: "\u2661 졸업", ja: "\u2661 卒業", en: "\u2661 graduation" },
  withdrawal: { ko: "탈퇴", ja: "脱退", en: "withdrawal" },
  dissolution: { ko: "해산", ja: "解散", en: "dissolution" },
  transfer: { ko: "이적", ja: "移籍", en: "transfer" },
};

const CURRENT: Record<Locale, string> = {
  ko: "활동 중",
  ja: "活動中",
  en: "current",
};

export function TimelineChart({ members, groups, memberships }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLocale();
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(
    new Set(groups.map((g) => g.id))
  );

  // Memoize lookup maps; they feed the effect's dependency array, and a
  // fresh Map per render would re-run the entire d3 layout on every keystroke.
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  );
  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups],
  );

  const toggleGroup = useCallback((groupId: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedGroups((prev) => {
      if (prev.size === groups.length) return new Set();
      return new Set(groups.map((g) => g.id));
    });
  }, [groups]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const filteredGroups = groups.filter((g) => selectedGroups.has(g.id));
    const filteredMemberships = memberships.filter((m) =>
      selectedGroups.has(m.groupId)
    );

    const width = containerRef.current.clientWidth;
    const height = Math.max(
      400,
      MARGIN.top + MARGIN.bottom + filteredGroups.length * (LANE_HEIGHT + 4)
    );

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const now = new Date();
    const xScale = d3
      .scaleTime()
      .domain([new Date(MIN_YEAR, 0, 1), now])
      .range([MARGIN.left, width - MARGIN.right]);

    const yScale = d3
      .scaleBand<string>()
      .domain(filteredGroups.map((g) => g.id))
      .range([MARGIN.top, height - MARGIN.bottom])
      .padding(0.15);

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("x", MARGIN.left)
      .attr("y", MARGIN.top)
      .attr("width", width - MARGIN.left - MARGIN.right)
      .attr("height", height - MARGIN.top - MARGIN.bottom);

    const chartArea = svg.append("g").attr("clip-path", "url(#chart-clip)");
    const barsGroup = chartArea.append("g");

    const xAxis = d3
      .axisTop(xScale)
      .ticks(d3.timeYear.every(2))
      .tickFormat((d) => d3.timeFormat("%Y")(d as Date));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${MARGIN.top})`)
      .call(xAxis)
      .call((g) => g.select(".domain").attr("stroke", "#f9a8d4"))
      .call((g) => g.selectAll(".tick line").attr("stroke", "#fce7f3"))
      .call((g) =>
        g.selectAll(".tick text").attr("fill", "#9d174d").attr("font-size", 11)
      );

    filteredGroups.forEach((group) => {
      const y = yScale(group.id)!;

      svg
        .append("rect")
        .attr("x", MARGIN.left)
        .attr("y", y)
        .attr("width", width - MARGIN.left - MARGIN.right)
        .attr("height", yScale.bandwidth())
        .attr("fill", "#fdf2f8")
        .attr("stroke", "#fce7f3")
        .attr("stroke-width", 1)
        .attr("rx", 6);

      svg
        .append("text")
        .attr("x", MARGIN.left - 10)
        .attr("y", y + yScale.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "central")
        .attr("fill", group.color)
        .attr("font-size", 12)
        .attr("font-weight", 700)
        .text(groupName(group, locale));
    });

    const tooltip = d3.select(tooltipRef.current);

    barsGroup
      .selectAll("rect.membership")
      .data(filteredMemberships)
      .join("rect")
      .attr("class", "membership")
      .attr("x", (d) => xScale(parseDate(d.joinDate)))
      .attr("y", (d) => {
        const bandY = yScale(d.groupId);
        if (bandY === undefined) return 0;
        return bandY + (yScale.bandwidth() - BAR_HEIGHT) / 2;
      })
      .attr("width", (d) => {
        const x1 = xScale(parseDate(d.joinDate));
        const x2 = xScale(d.leaveDate ? parseDate(d.leaveDate) : now);
        return Math.max(3, x2 - x1);
      })
      .attr("height", BAR_HEIGHT)
      .attr("rx", 8)
      .attr("fill", (d) => {
        const member = memberMap.get(d.memberId);
        if (member && member.color !== "#888888") return member.color;
        const group = groupMap.get(d.groupId);
        return group?.color || "#f9a8d4";
      })
      .attr("opacity", 0.75)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("mouseenter", (event, d) => {
        const member = memberMap.get(d.memberId);
        const group = groupMap.get(d.groupId);
        d3.select(event.currentTarget)
          .attr("opacity", 1)
          .attr("stroke", "#ec4899")
          .attr("stroke-width", 2);
        const joinStr = d.joinDate || "?";
        const leaveStr = d.leaveDate || CURRENT[locale];
        const reason = d.leaveReason
          ? LEAVE_REASON[d.leaveReason]?.[locale] || d.leaveReason
          : "";
        const mName = member ? memberName(member, locale) : d.memberId;
        const subName = member
          ? locale === "ja"
            ? member.nameEn
            : member.nameJa
          : "";
        const gName = group ? groupName(group, locale) : d.groupId;
        tooltip
          .style("display", "block")
          .html(
            `<strong>${mName}</strong><br/>` +
              `<span style="opacity:0.7">${subName}</span><br/>` +
              `${gName}<br/>` +
              `${joinStr} ~ ${leaveStr}` +
              (reason ? `<br/>${reason}` : "")
          );
      })
      .on("mousemove", (event) => {
        const container = containerRef.current!;
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 14}px`)
          .style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", (event) => {
        d3.select(event.currentTarget)
          .attr("opacity", 0.75)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);
        tooltip.style("display", "none");
      });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 20])
      .translateExtent([
        [MARGIN.left, 0],
        [width - MARGIN.right, height],
      ])
      .extent([
        [MARGIN.left, 0],
        [width - MARGIN.right, height],
      ])
      .on("zoom", (event) => {
        const newX = event.transform.rescaleX(xScale);

        barsGroup
          .selectAll<SVGRectElement, Membership>("rect.membership")
          .attr("x", (d) => newX(parseDate(d.joinDate)))
          .attr("width", (d) => {
            const x1 = newX(parseDate(d.joinDate));
            const x2 = newX(d.leaveDate ? parseDate(d.leaveDate) : now);
            return Math.max(3, x2 - x1);
          });

        svg
          .select<SVGGElement>("g.x-axis")
          .call(
            xAxis.scale(newX) as unknown as (
              selection: d3.Selection<SVGGElement, unknown, null, undefined>
            ) => void
          )
          .call((g) => g.select(".domain").attr("stroke", "#f9a8d4"))
          .call((g) => g.selectAll(".tick line").attr("stroke", "#fce7f3"))
          .call((g) =>
            g
              .selectAll(".tick text")
              .attr("fill", "#9d174d")
              .attr("font-size", 11)
          );
      });

    svg.call(zoom);
  }, [members, groups, memberships, selectedGroups, memberMap, groupMap, locale]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="princess-sidebar w-52 shrink-0 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            &#x2661; {t("timeline.groups") as string}
          </span>
          <button
            onClick={toggleAll}
            className="text-xs font-medium"
            style={{ color: "var(--accent-pink)" }}
          >
            {selectedGroups.size === groups.length
              ? (t("timeline.none") as string)
              : (t("timeline.all") as string)}
          </button>
        </div>
        {groups.map((g) => (
          <label
            key={g.id}
            className="flex items-center gap-2 py-1.5 text-sm"
          >
            <input
              type="checkbox"
              checked={selectedGroups.has(g.id)}
              onChange={() => toggleGroup(g.id)}
            />
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/50"
              style={{ backgroundColor: g.color }}
            />
            <span style={{ color: "var(--text-secondary)" }}>
              {groupName(g, locale)}
            </span>
          </label>
        ))}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        style={{ background: "var(--bg-card)" }}
      >
        <svg ref={svgRef} />
        <div
          ref={tooltipRef}
          className="timeline-tooltip"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
