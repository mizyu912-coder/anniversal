import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { BASE_KINDS, ENTITY_TYPES } from "./types";
import type { Base, BaseKind, Entity, EntityType, Precision, SearchItem } from "./types";
import { normalize } from "./normalize";

const DATA_DIR = path.join(process.cwd(), "data");

function readCsv(file: string): Record<string, string>[] {
  const text = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
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
  for (const r of readCsv("entities.csv")) {
    if (!(r.type in ENTITY_TYPES)) throw new Error(`不明なtype: ${r.type} (${r.id})`);
    if (entities.has(r.id)) throw new Error(`idが重複: ${r.id}`);
    entities.set(r.id, {
      id: r.id,
      type: r.type as EntityType,
      name: r.name,
      kana: r.kana ?? "",
      aliases: (r.aliases ?? "").split(";").map((s) => s.trim()).filter(Boolean),
      genre: r.genre ?? "",
      parentId: r.parent_id || null,
      officialUrl: r.official_url ?? "",
      bases: [],
    });
  }
  for (const r of readCsv("bases.csv")) {
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
    bases: e.bases.map((b) => ({ k: b.kind, y: b.year, m: b.month, d: b.day })),
  }));
}
