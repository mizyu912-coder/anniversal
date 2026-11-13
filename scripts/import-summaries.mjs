// 日本語版Wikipediaの冒頭（概要）を取得し、data/import/summaries.csv を作り直す。
// 本文は CC BY-SA 4.0。サイト上では出典（記事名へのリンク）とライセンスを必ず表示する。
// 対象: Wikidata取り込み分（jawiki列の記事名）と、手作業登録分（名前で記事を探し、曖昧さ回避ページは除く）
import fs from "node:fs";
import Papa from "papaparse";

const API = "https://ja.wikipedia.org/w/api.php";
const UA = "anniversary-database-import/0.1 (static site generator; GitHub Actions)";
const read = (f) => (fs.existsSync(f) ? Papa.parse(fs.readFileSync(f, "utf8"), { header: true, skipEmptyLines: true }).data : []);

const targets = [];
for (const r of read("data/entities.csv")) targets.push({ id: r.id, title: r.name.replace(/（.*?）/g, "").trim() });
for (const r of read("data/import/wikidata-entities.csv")) if (r.jawiki) targets.push({ id: r.id, title: r.jawiki });

/** 冒頭から最大3文・約220字まで */
function trim(text) {
  const clean = text.replace(/\s*\n+\s*/g, "").replace(/\s{2,}/g, " ").trim();
  let out = "";
  for (const s of clean.split(/(?<=。)/)) {
    if (out && (out.length + s.length > 220 || (out.match(/。/g) ?? []).length >= 3)) break;
    out += s;
  }
  return out.length > 260 ? out.slice(0, 250) + "…" : out;
}

async function fetchBatch(titles, attempt = 1) {
  const params = new URLSearchParams({
    action: "query", format: "json", formatversion: "2", redirects: "1", maxlag: "5",
    prop: "extracts|pageprops", exintro: "1", explaintext: "1", exlimit: "20", ppprop: "disambiguation",
    titles: titles.join("|"),
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
  const json = res.ok ? await res.json() : null;
  // 429（混雑）・5xx・maxlag は待って再試行。Retry-After があればそれに従う
  if (!res.ok || json?.error?.code === "maxlag") {
    if (attempt >= 6) return null;
    const wait = Math.max(Number(res.headers.get("retry-after") || 0) * 1000, 10000 * attempt);
    await new Promise((r) => setTimeout(r, wait));
    return fetchBatch(titles, attempt + 1);
  }
  return json;
}

const rows = [];
let failed = 0;
for (let i = 0; i < targets.length; i += 20) {
  const batch = targets.slice(i, i + 20);
  const json = await fetchBatch(batch.map((t) => t.title));
  if (!json) {
    failed += batch.length; // 取得できなかった分は飛ばして続ける（次回の取り込みで再取得）
    continue;
  }
  const q = json.query ?? {};
  // 入力した記事名 → 正規化・転送後の記事名
  const resolve = new Map();
  for (const n of q.normalized ?? []) resolve.set(n.from, n.to);
  for (const r of q.redirects ?? []) resolve.set(r.from, r.to);
  const pages = new Map((q.pages ?? []).map((p) => [p.title, p]));
  for (const t of batch) {
    let title = t.title;
    for (let k = 0; k < 3 && resolve.has(title); k++) title = resolve.get(title);
    const p = pages.get(title);
    if (!p || p.missing || p.pageprops?.disambiguation !== undefined || !p.extract) continue;
    const summary = trim(p.extract);
    if (summary.length >= 20) rows.push({ id: t.id, title: p.title, summary });
  }
  if (i % 1000 === 0) console.log(`${i}/${targets.length}`);
  await new Promise((r) => setTimeout(r, 1500)); // Wikipediaの負荷にならないよう1件ずつゆっくり
}
fs.writeFileSync("data/import/summaries.csv", Papa.unparse(rows) + "\n");
console.log(`概要: ${rows.length}/${targets.length}件（取得失敗 ${failed}件）`);
if (rows.length === 0) throw new Error("概要を1件も取得できませんでした");
