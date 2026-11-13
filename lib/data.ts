import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { BASE_KINDS, ENTITY_TYPES } from "./types";
import type { Base, BaseKind, Entity, EntityType, Precision, SearchItem } from "./types";
import { normalize } from "./normalize";

const DATA_DIR = path.join(process.cwd(), "data");

/** 手作業データ + 自動取り込みデータ（data/import/）。手作業データが先に読まれ優先される */
const ENTITY_FILES = ["entities.csv", "import/wikidata-entities.csv"];
const BASE_FILES = ["bases.csv", "import/wikidata-bases.csv"];

/** 手作業で登録したデータの知名度（厳選した有名作品なので上位に出す） */
const MANUAL_POP = 100;

function readCsv(file: string): Record<string, string>[] {
  const full = path.join(DATA_DIR, file);
  if (!fs.existsSync(full)) return [];
  const text = fs.readFileSync(full, "utf8");
  const res = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  if (res.errors.length) throw new Error(`${file}: ${res.errors.map((e) => `${e.row}: ${e.message}`).join(", ")}`);
  return res.data;
}

export function parseDate(s: string, precision: Precision): { year: number | null; month: number | null; day: number | null } {
  if (precision === "monthday") {
    const m = /^--(\d{2})-(\d{2})$/.exec(s);
    if (!m) throw new Error(`monthday形式は --MM-DD: ${s}`);
    return { year: null, month: +m[1], day: +m[2] };
  }
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(s);
  if (!m) throw new Error(`日付形式が不正: ${s}`);
  return { year: +m[1], month: m[2] ? +m[2] : null, day: m[3] ? +m[3] : null };
}

let cache: Entity[] | null = null;

export function getEntities(): Entity[] {
  if (cache) return cache;
  const entities = new Map<string, Entity>();
  for (const file of ENTITY_FILES) {
    const rows = readCsv(file);
    rows.forEach((r, i) => {
      if (!(r.type in ENTITY_TYPES)) throw new Error(`不明なtype: ${r.type} (${r.id})`);
      if (entities.has(r.id)) throw new Error(`idが重複: ${r.id}`);
      entities.set(r.id, {
        id: r.id,
        type: r.type as EntityType,
        name: r.name,
        kana: r.kana ?? "",
        aliases: (r.aliases ?? "")
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean),
        genre: r.genre ?? "",
        parentId: r.parent_id || null,
        officialUrl: r.official_url ?? "",
        wikidata: r.wikidata ?? "",
        // links 列（サイトリンク数）がなければ、リンク数順に並んだ行の位置から推定
        pop: file === "entities.csv" ? MANUAL_POP : r.links ? +r.links : Math.max(2, Math.round(60 * (1 - i / rows.length))),
        summary: null,
        product: null,
        bases: [],
      });
    });
  }
  for (const r of BASE_FILES.flatMap(readCsv)) {
    const e = entities.get(r.entity_id);
    if (!e) throw new Error(`bases.csv: 未登録のentity_id ${r.entity_id}`);
    if (!(r.kind in BASE_KINDS)) throw new Error(`不明なkind: ${r.kind} (${r.entity_id})`);
    const precision = r.precision as Precision;
    const base: Base = {
      entityId: r.entity_id,
      kind: r.kind as BaseKind,
      ...parseDate(r.date, precision),
      precision,
      official: r.official === "true",
      source: r.source ?? "",
      note: r.note ?? "",
    };
    e.bases.push(base);
  }
  for (const r of readCsv("import/summaries.csv")) {
    const e = entities.get(r.id);
    if (e && r.summary) e.summary = { title: r.title, text: r.summary };
  }
  for (const r of readCsv("import/rakuten.csv")) {
    const e = entities.get(r.id);
    if (e && r.image && r.url) e.product = { image: r.image, url: r.url, title: r.title };
  }
  cache = [...entities.values()];
  return cache;
}

export function getEntity(id: string): Entity | undefined {
  return getEntities().find((e) => e.id === id);
}

export function getChildren(id: string): Entity[] {
  return getEntities().filter((e) => e.parentId === id);
}

export function buildSearchIndex(): SearchItem[] {
  return getEntities().map((e) => ({
    id: e.id,
    t: e.type,
    name: e.name,
    keys: normalize([e.name, e.kana, ...e.aliases].join(" ")),
    p: e.pop,
    bases: e.bases.map((b) => ({ k: b.kind, y: b.year, m: b.month, d: b.day })),
  }));
}

let byYear: Map<number, Entity[]> | null = null;

/** 同じ年に生まれた（起算日が同じ年の）ほかの作品・ブランド・企業を知名度順に */
export function getSameYear(e: Entity, limit = 12): { year: number; list: Entity[] } | null {
  const base = e.bases.find((b) => b.kind !== "birthday" && b.year !== null);
  if (!base) return null;
  if (!byYear) {
    byYear = new Map();
    for (const x of getEntities()) {
      const b = x.bases.find((b) => b.kind !== "birthday" && b.year !== null);
      if (!b) continue;
      const list = byYear.get(b.year!) ?? [];
      list.push(x);
      byYear.set(b.year!, list);
    }
    for (const list of byYear.values()) list.sort((a, b) => b.pop - a.pop);
  }
  const list = (byYear.get(base.year!) ?? []).filter((x) => x.id !== e.id).slice(0, limit);
  return list.length ? { year: base.year!, list } : null;
}
