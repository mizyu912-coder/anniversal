"use client";
import { useEffect, useMemo, useState } from "react";
import AnnivList from "./AnnivList";
import { ENTITY_TYPES } from "@/lib/types";
import { isMilestone, NTH_OPTIONS, sortByDate, sortByPop } from "@/lib/anniv";
import type { Anniversary, EntityType, SearchItem } from "@/lib/types";

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
  const [order, setOrder] = useState<"pop" | "date">("pop");
  const [allItems, setAllItems] = useState<Anniversary[] | null>(null);
  // トップページから ?n=30&type=anime のように来たときの初期値
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const n = Number(p.get("n"));
    if (n > 0) setNth(n);
    const t = p.get("type");
    if (t && t in ENTITY_TYPES) setType(t as EntityType);
  }, []);
  useEffect(() => {
    if (milestoneOnly || allItems) return;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((index: SearchItem[]) => setAllItems(allFromIndex(index, year)))
      .catch(() => setAllItems([]));
  }, [milestoneOnly, allItems, year]);
  const items = milestoneOnly ? milestoneItems : (allItems ?? milestoneItems);
  const filtered = useMemo(() => {
    const list = items.filter(
      (a) => (!type || a.type === type) && (!milestoneOnly || a.milestone) && (!month || a.month === month) && (!nth || a.n === nth),
    );
    return order === "pop" ? sortByPop(list) : sortByDate(list);
  }, [items, type, milestoneOnly, month, nth, order]);

  const csv = () => {
    const rows = [["名称", "種別", "周年", "起算", "起算年", "月", "日"]];
    for (const a of filtered) rows.push([a.name, ENTITY_TYPES[a.type], String(a.n), a.kind, String(a.baseYear), String(a.month ?? ""), String(a.day ?? "")]);
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
        <select value={month} onChange={(e) => setMonth(+e.target.value)} aria-label="月">
          <option value={0}>すべての月</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}月
            </option>
          ))}
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value as "pop" | "date")} aria-label="並び順">
          <option value="pop">知名度順</option>
          <option value="date">日付順</option>
        </select>
        <label>
          <input type="checkbox" checked={milestoneOnly} onChange={(e) => setMilestoneOnly(e.target.checked)} /> 節目（1・5の倍数周年）のみ
        </label>
        <button type="button" className="btn small" onClick={csv}>
          CSVで保存
        </button>
      </div>
      <p className="muted">{filtered.length}件</p>
      <AnnivList items={filtered} />
    </>
  );
}
