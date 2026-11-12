"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isMilestone } from "@/lib/anniv";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { SearchItem } from "@/lib/types";

interface Hit {
  id: string;
  name: string;
  t: SearchItem["t"];
  label: string;
  milestone: boolean;
  p: number;
}

/** 今日が記念日・誕生日のもの（閲覧日基準） */
export default function TodayList() {
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [date, setDate] = useState("");
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    setDate(`${m}月${d}日`);
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((index: SearchItem[]) => {
        const out: Hit[] = [];
        for (const i of index)
          for (const b of i.bases) {
            if (b.m !== m || b.d !== d) continue;
            if (b.k === "birthday") out.push({ id: i.id, name: i.name, t: i.t, label: "誕生日", milestone: false, p: i.p });
            else if (b.y !== null && y - b.y >= 1)
              out.push({ id: i.id, name: i.name, t: i.t, label: `${BASE_KINDS[b.k]}${y - b.y}周年`, milestone: isMilestone(y - b.y), p: i.p });
          }
        out.sort((a, b) => Number(b.milestone) - Number(a.milestone) || b.p - a.p);
        setHits(out.slice(0, 24));
      })
      .catch(() => setHits([]));
  }, []);
  return (
    <section className="card">
      <h2>今日（{date}）周年・誕生日を迎えるもの</h2>
      {hits === null ? (
        <p className="muted">読み込み中…</p>
      ) : hits.length === 0 ? (
        <p className="muted">今日が記念日のデータはまだありません。</p>
      ) : (
        <ul className="chips">
          {hits.map((h) => (
            <li key={h.id + h.label}>
              <Link href={`/e/${h.id}/`}>
                {h.name} <span className={`tag t-${h.t}`}>{ENTITY_TYPES[h.t]}</span> <b className={h.milestone ? "hl" : ""}>{h.label}</b>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
