"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { normalize } from "@/lib/normalize";
import { formatDate, nextMilestone } from "@/lib/anniv";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { SearchItem } from "@/lib/types";

export default function SearchClient() {
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(new URLSearchParams(location.search).get("q") ?? "");
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  const results = useMemo(() => {
    const nq = normalize(q);
    if (!index || !nq) return [];
    // 前方一致を優先し、その中では知名度順
    return index
      .filter((i) => i.keys.includes(nq))
      .sort((a, b) => Number(b.keys.startsWith(nq)) - Number(a.keys.startsWith(nq)) || b.p - a.p)
      .slice(0, 50);
  }, [index, q]);

  const today = new Date();
  return (
    <>
      <input
        className="search-input"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          history.replaceState(null, "", e.target.value ? `?q=${encodeURIComponent(e.target.value)}` : location.pathname);
        }}
        placeholder="作品名・キャラクター名・企業名（例：ワンピース、ガンダム、任天堂）"
        autoFocus
      />
      {index === null && <p className="muted">読み込み中…</p>}
      {index && q && !results.length && <p className="muted">見つかりませんでした。別の表記でもお試しください。</p>}
      <ul className="result-list">
        {results.map((r) => (
          <li key={r.id}>
            <Link href={`/e/${r.id}/`}>
              <strong>{r.name}</strong> <span className={`tag t-${r.t}`}>{ENTITY_TYPES[r.t]}</span>
            </Link>
            {r.bases.map((b) => {
              if (b.k === "birthday")
                return (
                  <div key={b.k} className="sub">
                    誕生日：{formatDate(null, b.m, b.d)}
                  </div>
                );
              const nm = nextMilestone({ year: b.y, month: b.m, day: b.d }, today);
              return (
                <div key={b.k} className="sub">
                  {BASE_KINDS[b.k]}：{formatDate(b.y, b.m, b.d)}
                  {nm && (
                    <>
                      {" → "}次の節目は<b>{nm.year}年{b.m ? `${b.m}月${b.d ? `${b.d}日` : ""}` : ""}の{nm.n}周年</b>
                    </>
                  )}
                </div>
              );
            })}
          </li>
        ))}
      </ul>
    </>
  );
}
