"use client";
import { useEffect, useMemo, useState } from "react";
import Spotlight from "./Spotlight";
import AdSlot from "./AdSlot";
import AnnivList, { dateLabel } from "./AnnivList";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import { isMilestone, NTH_OPTIONS, sortByDate, sortByPop } from "@/lib/anniv";
import type { Anniversary, EntityType, SearchItem } from "@/lib/types";

const TOP_COUNT = 10;
const key = (a: Anniversary) => `${a.entityId}-${a.kind}`;

/** 節目以外も含む全件を検索インデックスから計算する */
function allFromIndex(index: SearchItem[], year: number): Anniversary[] {
  const out: Anniversary[] = [];
  for (const i of index)
    for (const b of i.bases) {
      if (b.k === "birthday" || b.y === null || year - b.y < 1) continue;
      const n = year - b.y;
      out.push({ entityId: i.id, name: i.name, type: i.t, kind: b.k, baseYear: b.y, month: b.m, day: b.d, n, milestone: isMilestone(n), pop: i.p });
    }
  return sortByDate(out);
}

/** items は節目の周年のみ（ページを軽くするため）。チェックを外すと全件を読み込む */
export default function YearFilter({ items: milestoneItems, year }: { items: Anniversary[]; year: number }) {
  const [type, setType] = useState<EntityType | "">("");
  const [milestoneOnly, setMilestoneOnly] = useState(true);
  const [month, setMonth] = useState(0);
  const [nth, setNth] = useState(0);
  const [allItems, setAllItems] = useState<Anniversary[] | null>(null);
  // トップページから ?n=30&type=anime のように来たときの初期値
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const n = Number(p.get("n"));
    if (n > 0) setNth(n);
    const t = p.get("type");
    if (t && t in ENTITY_TYPES) setType(t as EntityType);
    const m = Number(p.get("m"));
    if (m >= 1 && m <= 12) setMonth(m);
  }, []);
  useEffect(() => {
    if (milestoneOnly || allItems) return;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((index: SearchItem[]) => setAllItems(allFromIndex(index, year)))
      .catch(() => setAllItems([]));
  }, [milestoneOnly, allItems, year]);
  const items = milestoneOnly ? milestoneItems : (allItems ?? milestoneItems);
  // 月以外の条件で絞り込んだもの（月タブの件数表示に使う）
  const base = useMemo(
    () => items.filter((a) => (!type || a.type === type) && (!milestoneOnly || a.milestone) && (!nth || a.n === nth)),
    [items, type, milestoneOnly, nth],
  );
  const monthCounts = useMemo(() => {
    const c = Array(13).fill(0) as number[];
    for (const a of base) c[a.month ?? 0]++;
    return c;
  }, [base]);
  const filtered = useMemo(() => sortByDate(month ? base.filter((a) => a.month === month) : base), [base, month]);
  // 人気の上位を先頭に、残りを日付順に（月ごとに見出しを付ける）
  const top = useMemo(() => sortByPop(filtered).slice(0, TOP_COUNT), [filtered]);
  const groups = useMemo(() => {
    const topIds = new Set(top.map(key));
    const g = new Map<number, Anniversary[]>();
    for (const a of filtered) {
      if (topIds.has(key(a))) continue;
      const m = a.month ?? 0;
      if (!g.has(m)) g.set(m, []);
      g.get(m)!.push(a);
    }
    return [...g.entries()].sort((x, y) => (x[0] || 13) - (y[0] || 13));
  }, [filtered, top]);
  const pickMonth = (m: number) => {
    setMonth(m);
    const u = new URL(location.href);
    if (m) u.searchParams.set("m", String(m));
    else u.searchParams.delete("m");
    window.history.replaceState(window.history.state, "", u);
  };

  const csv = () => {
    const rows = [["名称", "種別", "周年", "起算", "起算年", "月", "日"]];
    for (const a of [...top, ...groups.flatMap(([, l]) => l)]) rows.push([a.name, ENTITY_TYPES[a.type], String(a.n), a.kind, String(a.baseYear), String(a.month ?? ""), String(a.day ?? "")]);
    const body = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anniversal-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="filters">
        <select value={type} onChange={(e) => setType(e.target.value as EntityType | "")} aria-label="種別">
          <option value="">すべての種別</option>
          {Object.entries(ENTITY_TYPES)
            .filter(([k]) => k !== "character")
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </select>
        <select value={nth} onChange={(e) => setNth(+e.target.value)} aria-label="周年">
          <option value={0}>すべての周年</option>
          {NTH_OPTIONS.map((x) => (
            <option key={x} value={x}>
              {x}周年
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={milestoneOnly} onChange={(e) => setMilestoneOnly(e.target.checked)} /> 節目（1・5の倍数周年）のみ
        </label>
        <button type="button" className="btn small" onClick={csv}>
          CSVで保存
        </button>
      </div>
      <nav className="month-tabs" aria-label="月で絞り込み">
        <button type="button" className={month === 0 ? "current" : ""} onClick={() => pickMonth(0)}>
          すべて<small>{base.length}</small>
        </button>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <button key={m} type="button" className={month === m ? "current" : ""} onClick={() => pickMonth(m)} disabled={!monthCounts[m]}>
            {m}月<small>{monthCounts[m]}</small>
          </button>
        ))}
      </nav>
      <p className="muted">
        {month ? `${month}月 ` : ""}
        {filtered.length}件
      </p>
      {filtered.length === 0 ? (
        <AnnivList items={[]} />
      ) : (
        <>
          <Spotlight
            title={`${year}年${month ? ` ${month}月` : ""}の注目の周年`}
            items={top.map((a) => ({
              key: key(a),
              href: `/e/${a.entityId}/`,
              big: String(a.n),
              unit: "周年",
              name: a.name,
              tag: ENTITY_TYPES[a.type],
              meta: `${dateLabel(a)}・${BASE_KINDS[a.kind]}（${a.baseYear}年）`,
            }))}
          />
          <AdSlot />
          {groups.length > 0 && (
            <section className="anniv-bydate">
              <h2>日付順</h2>
              {groups.map(([m, list]) => (
                <div key={m} className="month-group">
                  <h3>{m ? `${m}月` : "日付未詳"}</h3>
                  <AnnivList items={list} />
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}
