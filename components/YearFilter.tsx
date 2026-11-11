"use client";
import { useMemo, useState } from "react";
import AnnivList from "./AnnivList";
import { ENTITY_TYPES } from "@/lib/types";
import type { Anniversary, EntityType } from "@/lib/types";

export default function YearFilter({ items, year }: { items: Anniversary[]; year: number }) {
  const [type, setType] = useState<EntityType | "">("");
  const [milestoneOnly, setMilestoneOnly] = useState(true);
  const [month, setMonth] = useState(0);
  const filtered = useMemo(
    () =>
      items.filter(
        (a) => (!type || a.type === type) && (!milestoneOnly || a.milestone) && (!month || a.month === month),
      ),
    [items, type, milestoneOnly, month],
  );

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
        <select value={month} onChange={(e) => setMonth(+e.target.value)} aria-label="月">
          <option value={0}>すべての月</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}月
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
      <p className="muted">{filtered.length}件</p>
      <AnnivList items={filtered} />
    </>
  );
}
