// 楽天ブックスの商品画像と商品リンク（アフィリエイト）を取得し、data/import/rakuten.csv を作り直す。
// 楽天ウェブサービスの規約に従い、画像は商品ページへのリンクと一緒に表示し、クレジットを表示する。
// 必要な環境変数: RAKUTEN_APP_ID（必須）, RAKUTEN_ACCESS_KEY（発行された場合）, RAKUTEN_AFF_ID（任意）, RAKUTEN_LIMIT（取得件数、既定3000）
import fs from "node:fs";
import Papa from "papaparse";

const APP_ID = process.env.RAKUTEN_APP_ID;
if (!APP_ID) {
  console.log("RAKUTEN_APP_ID が未設定のためスキップします");
  process.exit(0);
}
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY || "";
const AFF_ID = process.env.RAKUTEN_AFF_ID || "";
const LIMIT = Number(process.env.RAKUTEN_LIMIT || 3000);
const BASE = "https://app.rakuten.co.jp/services/api";

/** 種別ごとの検索API（会社・ブランドは対象外） */
const APIS = {
  manga: { path: "BooksBook/Search/20170404", key: "title", extra: { booksGenreId: "001001" } },
  game: { path: "BooksGame/Search/20170404", key: "title" },
  anime: { path: "BooksDVD/Search/20170404", key: "title" },
  movie: { path: "BooksDVD/Search/20170404", key: "title" },
  musician: { path: "BooksCD/Search/20170404", key: "artistName" },
};

const read = (f) => (fs.existsSync(f) ? Papa.parse(fs.readFileSync(f, "utf8"), { header: true, skipEmptyLines: true }).data : []);
const normalize = (s) =>
  s.normalize("NFKC").toLowerCase().replace(/（.*?）|\(.*?\)/g, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・\-ー'’.。、,!！?？「」:：]/g, "");

// 手作業登録分を先頭に、続いて取り込み分（リンク数＝知名度の順に並んでいる）
const manual = read("data/entities.csv").map((r) => ({ ...r, links: 1000 }));
const imported = read("data/import/wikidata-entities.csv").map((r) => ({ ...r, links: Number(r.links || 0) }));
const targets = [...manual, ...imported].filter((r) => APIS[r.type]).sort((a, b) => b.links - a.links).slice(0, LIMIT);

async function search(api, word, attempt = 1) {
  const params = new URLSearchParams({ applicationId: APP_ID, format: "json", formatVersion: "2", hits: "5", [api.key]: word, ...(api.extra ?? {}) });
  if (ACCESS_KEY) params.set("accessKey", ACCESS_KEY);
  if (AFF_ID) params.set("affiliateId", AFF_ID);
  const res = await fetch(`${BASE}/${api.path}?${params}`);
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 4) return [];
    await new Promise((r) => setTimeout(r, 3000 * attempt));
    return search(api, word, attempt + 1);
  }
  if (res.status === 404) return []; // 該当なし
  if (!res.ok) throw new Error(`楽天API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).Items ?? [];
}

const rows = [];
for (const [i, e] of targets.entries()) {
  const word = e.name.replace(/（.*?）/g, "").trim();
  const items = await search(APIS[e.type], word);
  // 名前を含む商品だけを採用（ミュージシャンはアーティスト名で照合）
  const key = normalize(word);
  const hit = items.find((it) => normalize(e.type === "musician" ? it.artistName ?? "" : it.title ?? "").includes(key) && it.largeImageUrl);
  if (hit) {
    rows.push({
      id: e.id,
      image: hit.largeImageUrl.replace(/\?_ex=\d+x\d+/, "?_ex=400x400"),
      url: hit.affiliateUrl || hit.itemUrl,
      title: hit.title,
    });
  }
  if (i % 200 === 0) console.log(`${i}/${targets.length}（画像あり ${rows.length}）`);
  await new Promise((r) => setTimeout(r, 1100)); // 1秒1回の制限
}
fs.writeFileSync("data/import/rakuten.csv", Papa.unparse(rows) + "\n");
console.log(`楽天の商品画像: ${rows.length}/${targets.length}件`);
