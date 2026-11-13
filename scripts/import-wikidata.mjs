// Wikidata から国内の作品・ミュージシャン・上場企業と起算日を取り込み、
// data/import/wikidata-entities.csv と data/import/wikidata-bases.csv を作り直す。
// 手作業で登録した data/entities.csv と同じ名前・種別のものは取り込まない（手作業側を優先）。
// 除外したいものは data/import/excluded.txt に Q番号を1行ずつ書く。
import fs from "node:fs";
import Papa from "papaparse";

const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "anniversal-data-import/0.1 (static site generator; GitHub Actions)";

/**
 * where: 対象を絞る条件 / dateProps: 起算日のプロパティ（先頭優先、各プロパティ内は最も古い日付）
 * minLinks: 他言語版Wikipediaなどのリンク数の下限（知名度の目安）
 */
const TARGETS = [
  { type: "manga", kind: "serialization", genre: "漫画", minLinks: 4, dateProps: ["P580", "P577"],
    where: "?item wdt:P31 wd:Q21198342; wdt:P495 wd:Q17." },
  { type: "anime", kind: "broadcast", genre: "テレビアニメ", minLinks: 4, dateProps: ["P580", "P577"],
    where: "?item wdt:P31 wd:Q63952888; wdt:P495 wd:Q17." },
  { type: "game", kind: "release", genre: "ゲームソフト", minLinks: 8, dateProps: ["P577"],
    where: "?item wdt:P31 wd:Q7889; wdt:P495 wd:Q17." },
  { type: "movie", kind: "premiere", genre: "映画", minLinks: 8, dateProps: ["P577"],
    where: "VALUES ?cls { wd:Q11424 wd:Q20650540 wd:Q202866 } ?item wdt:P31 ?cls; wdt:P495 wd:Q17; wdt:P364 wd:Q5287. FILTER NOT EXISTS { ?item wdt:P495 wd:Q30 }" },
  { type: "musician", kind: "formation", genre: "グループ", minLinks: 8, dateProps: ["P571", "P2031"],
    where: "VALUES ?cls { wd:Q215380 wd:Q5741069 wd:Q2088357 wd:Q9212979 } ?item wdt:P31 ?cls; wdt:P495 wd:Q17." },
  { type: "musician", kind: "debut", genre: "ソロ", minLinks: 12, dateProps: ["P2031"],
    where: "?item wdt:P31 wd:Q5; wdt:P27 wd:Q17; wdt:P1412 wd:Q5287; wdt:P106 wd:Q177220." },
  { type: "company", kind: "founding", genre: "", minLinks: 2, dateProps: ["P571"],
    where: "?item wdt:P414 wd:Q217475; wdt:P17 wd:Q17." },
];

function query(t, prop) {
  return `SELECT ?item ?label ?kana ?date ?prec ?links ?jawiki ?en WHERE {
  ${t.where}
  ?item wikibase:sitelinks ?links. FILTER(?links >= ${t.minLinks})
  ?item p:${prop}/psv:${prop} [ wikibase:timeValue ?date; wikibase:timePrecision ?prec ].
  ?item rdfs:label ?label. FILTER(LANG(?label) = "ja")
  OPTIONAL { ?item wdt:P1814 ?kana. }
  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://ja.wikipedia.org/>; schema:name ?jawiki. }
  OPTIONAL { ?item rdfs:label ?en. FILTER(LANG(?en) = "en") }
}`;
}

async function sparql(q, attempt = 1) {
  const res = await fetch(`${ENDPOINT}?query=${encodeURIComponent(q)}`, {
    headers: { Accept: "application/sparql-results+json", "User-Agent": UA },
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 4) throw new Error(`SPARQL ${res.status}`);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
    return sparql(q, attempt + 1);
  }
  if (!res.ok) throw new Error(`SPARQL ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).results.bindings;
}

const pad = (n) => String(n).padStart(2, "0");
function toDate(value, prec) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m || +prec < 9) return null;
  const y = +m[1];
  if (y < 1800 || y > new Date().getFullYear()) return null;
  if (+prec >= 11) return { date: `${m[1]}-${m[2]}-${m[3]}`, precision: "day", key: `${m[1]}${m[2]}${m[3]}` };
  if (+prec === 10) return { date: `${m[1]}-${m[2]}`, precision: "month", key: `${m[1]}${m[2]}99` };
  return { date: m[1], precision: "year", key: `${m[1]}9999` };
}

const normalize = (s) =>
  s.normalize("NFKC").toLowerCase().replace(/（.*?）|\(.*?\)/g, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・\-ー'’.。、,!！?？「」]/g, "");
const toHiragana = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

const manual = Papa.parse(fs.readFileSync("data/entities.csv", "utf8"), { header: true, skipEmptyLines: true }).data;
const manualKeys = new Set(manual.map((r) => `${r.type}:${normalize(r.name)}`));
const manualQids = new Set(manual.map((r) => r.wikidata).filter(Boolean));
const excluded = new Set(
  fs.existsSync("data/import/excluded.txt")
    ? fs.readFileSync("data/import/excluded.txt", "utf8").split("\n").map((l) => l.trim().split(/\s/)[0]).filter((s) => /^Q\d+$/.test(s))
    : [],
);

const entities = new Map();
for (const t of TARGETS) {
  const picked = new Map(); // この対象で採用した qid → 候補（優先度の高いプロパティを優先）
  for (const prop of t.dateProps) {
    const rows = await sparql(query(t, prop));
    console.log(`${t.type}/${t.kind} ${prop}: ${rows.length}行`);
    const earliest = new Map();
    for (const r of rows) {
      const qid = r.item.value.split("/").pop();
      const d = toDate(r.date.value, r.prec.value);
      if (!d) continue;
      const cur = earliest.get(qid);
      if (!cur || d.key < cur.d.key)
        earliest.set(qid, { qid, type: t.type, kind: t.kind, genre: t.genre, name: r.label.value, kana: r.kana ? toHiragana(r.kana.value) : "", d, links: +r.links.value, jawiki: r.jawiki?.value ?? "", en: r.en?.value ?? "" });
    }
    for (const [qid, e] of earliest) if (!picked.has(qid)) picked.set(qid, e);
    await new Promise((r) => setTimeout(r, 2000));
  }
  for (const [qid, e] of picked) {
    if (entities.has(qid) || excluded.has(qid) || manualQids.has(qid)) continue;
    if (/^Q\d+$/.test(e.name) || manualKeys.has(`${e.type}:${normalize(e.name)}`)) continue;
    entities.set(qid, e);
  }
}

const list = [...entities.values()].sort((a, b) => b.links - a.links || a.qid.localeCompare(b.qid));
// 英語名は別名として持たせる（ローマ字・英語での検索用）
const ents = list.map((e) => ({
  id: e.qid.toLowerCase(), type: e.type, name: e.name, kana: e.kana,
  aliases: e.en && normalize(e.en) !== normalize(e.name) ? e.en.replace(/;/g, ",") : "",
  genre: e.genre, parent_id: "", official_url: "", wikidata: e.qid, links: e.links, jawiki: e.jawiki,
}));
const bases = list.map((e) => ({
  entity_id: e.qid.toLowerCase(), kind: e.kind, date: e.d.date, precision: e.d.precision, official: "false",
  source: `https://www.wikidata.org/wiki/${e.qid}`, note: "",
}));
fs.mkdirSync("data/import", { recursive: true });
fs.writeFileSync("data/import/wikidata-entities.csv", Papa.unparse(ents) + "\n");
fs.writeFileSync("data/import/wikidata-bases.csv", Papa.unparse(bases) + "\n");
const byType = {};
for (const e of list) byType[e.type] = (byType[e.type] ?? 0) + 1;
console.log(`取り込み: ${list.length}件`, byType);
