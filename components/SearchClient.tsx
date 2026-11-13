"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalize } from "@/lib/normalize";
import { kanaToRomaji } from "@/lib/romaji";
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

  const composing = useRef(false);
  // ローマ字検索用に、読みをローマ字にしたキーを用意しておく
  const romaji = useMemo(() => (index ? index.map((i) => kanaToRomaji(i.keys)) : []), [index]);

  // URLの ?q= は入力が落ち着いてから更新（日本語変換中に書き換えると変換が途切れるため）
  useEffect(() => {
    const t = setTimeout(() => {
      if (composing.current) return;
      const url = q ? `?q=${encodeURIComponent(q)}` : location.pathname;
      window.history.replaceState(window.history.state, "", url);
    }, 500);
    return () => clearTimeout(t);
  }, [q]);

  const results = useMemo(() => {
    const nq = normalize(q);
    if (!index || !nq) return [];
    // ローマ字を含む入力（例: gundam, dragonb, がんd）は読みのローマ字とも照合
    const rq = /[a-z]/.test(nq) ? kanaToRomaji(nq) : "";
    const hit = (i: SearchItem, k: number) => i.keys.includes(nq) || (rq.length >= 2 && romaji[k].includes(rq));
    const head = (i: SearchItem, k: number) => i.keys.startsWith(nq) || (rq.length >= 2 && romaji[k].startsWith(rq));
    // 知名度順（前方一致は少し優先）
    return index
      .map((i, k) => ({ i, k }))
      .filter(({ i, k }) => hit(i, k))
      .map((x) => ({ ...x, score: x.i.p * (head(x.i, x.k) ? 1.5 : 1) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(({ i }) => i);
  }, [index, romaji, q]);

  const today = new Date();
  return (
    <>
      <input
        className="search-input"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={() => (composing.current = false)}
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
