"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ENTITY_TYPES } from "@/lib/types";

import { NTH_OPTIONS } from "@/lib/anniv";

/** ファーストビューの2つの導線：①作品名から周年を調べる ②年と周年から探す */
export default function HeroSearch({ years, defaultYear }: { years: number[]; defaultYear: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [year, setYear] = useState(defaultYear);
  const [n, setN] = useState("");
  const [type, setType] = useState("");

  return (
    <div className="hero-panels">
      <form
        className="hero-panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/search/?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <p className="panel-label">
          <span className="panel-no">01</span>作品・ブランド・企業名から
        </p>
        <h2 className="panel-title">いつ周年を迎える？</h2>
        <div className="field-row">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例：ガンダム、ポケモン、任天堂"
            aria-label="作品名・ブランド名・企業名"
          />
          <button className="btn-gold" type="submit">
            調べる
          </button>
        </div>
      </form>

      <form
        className="hero-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const p = new URLSearchParams();
          if (n) p.set("n", n);
          if (type) p.set("type", type);
          const qs = p.toString();
          router.push(`/year/${year}/${qs ? `?${qs}` : ""}`);
        }}
      >
        <p className="panel-label">
          <span className="panel-no">02</span>年と周年から
        </p>
        <h2 className="panel-title">その年、何が周年？</h2>
        <div className="field-row selects">
          <select value={year} onChange={(e) => setYear(+e.target.value)} aria-label="年">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
          <span className="joiner">に</span>
          <select value={n} onChange={(e) => setN(e.target.value)} aria-label="周年">
            <option value="">節目の周年</option>
            {NTH_OPTIONS.map((x) => (
              <option key={x} value={x}>
                {x}周年
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="種別">
            <option value="">すべてのジャンル</option>
            {Object.entries(ENTITY_TYPES)
              .filter(([k]) => k !== "character")
              .map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
          <button className="btn-gold" type="submit">
            探す
          </button>
        </div>
      </form>
    </div>
  );
}
