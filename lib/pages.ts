/** 日別（今日は何の日）・生まれ年・種別ページのデータ */
import { getEntities } from "./data";
import { isMilestone } from "./anniv";
import { BUILD_YEAR } from "./site";
import type { BaseKind, Entity, EntityType } from "./types";

export interface DayItem {
  id: string;
  name: string;
  type: EntityType;
  kind: BaseKind;
  baseYear: number | null;
  /** ビルド年に迎える周年（誕生日・未来は null） */
  n: number | null;
  milestone: boolean;
  pop: number;
}

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function allDays(): { month: number; day: number }[] {
  const out = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= DAYS_IN_MONTH[m - 1]; d++) out.push({ month: m, day: d });
  return out;
}

export function dayParam(month: number, day: number) {
  return `${month}-${day}`;
}

export function parseDayParam(s: string): { month: number; day: number } {
  const [m, d] = s.split("-").map(Number);
  return { month: m, day: d };
}

/** 前後の日（2/29 も含めた366日を一周） */
export function neighborDays(month: number, day: number) {
  const days = allDays();
  const i = days.findIndex((x) => x.month === month && x.day === day);
  return { prev: days[(i + days.length - 1) % days.length], next: days[(i + 1) % days.length] };
}

let dayCache: Map<string, { anniv: DayItem[]; birthdays: DayItem[] }> | null = null;

/** その日（月日）が起算日・誕生日のもの。周年は節目優先→知名度順 */
export function itemsOnDay(month: number, day: number) {
  if (!dayCache) {
    dayCache = new Map();
    for (const e of getEntities())
      for (const b of e.bases) {
        if (!b.month || !b.day) continue;
        const key = dayParam(b.month, b.day);
        const v = dayCache.get(key) ?? { anniv: [], birthdays: [] };
        const n = b.year !== null && b.kind !== "birthday" && BUILD_YEAR - b.year >= 1 ? BUILD_YEAR - b.year : null;
        const item: DayItem = { id: e.id, name: e.name, type: e.type, kind: b.kind, baseYear: b.year, n, milestone: n !== null && isMilestone(n), pop: e.pop };
        (b.kind === "birthday" ? v.birthdays : v.anniv).push(item);
        dayCache.set(key, v);
      }
    for (const v of dayCache.values()) {
      v.anniv.sort((a, b) => Number(b.milestone) - Number(a.milestone) || b.pop - a.pop);
      v.birthdays.sort((a, b) => b.pop - a.pop);
    }
  }
  return dayCache.get(dayParam(month, day)) ?? { anniv: [], birthdays: [] };
}

/** 起算日（誕生日以外で最初のもの） */
export function mainBaseOf(e: Entity) {
  return e.bases.find((b) => b.kind !== "birthday" && b.year !== null) ?? null;
}

let bornCache: Map<number, Entity[]> | null = null;

/** 起算年ごとの実体（知名度順） */
export function bornByYear(): Map<number, Entity[]> {
  if (bornCache) return bornCache;
  bornCache = new Map();
  for (const e of getEntities()) {
    const b = mainBaseOf(e);
    if (!b || b.year! > BUILD_YEAR) continue;
    const list = bornCache.get(b.year!) ?? [];
    list.push(e);
    bornCache.set(b.year!, list);
  }
  for (const list of bornCache.values()) list.sort((a, b) => b.pop - a.pop);
  return bornCache;
}

/** 生まれ年ページを作る年（2件以上） */
export function bornYears(): number[] {
  return [...bornByYear().entries()]
    .filter(([, l]) => l.length >= 2)
    .map(([y]) => y)
    .sort((a, b) => a - b);
}

/** 年×種別ページを作る組み合わせ（5件以上） */
export const BORN_TYPE_MIN = 5;
export function bornTypePairs(): { year: number; type: EntityType }[] {
  const out: { year: number; type: EntityType }[] = [];
  for (const [year, list] of bornByYear()) {
    const counts = new Map<EntityType, number>();
    for (const e of list) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    for (const [type, c] of counts) if (c >= BORN_TYPE_MIN && type !== "character") out.push({ year, type });
  }
  return out.sort((a, b) => a.year - b.year);
}

/** 生まれ年ページの種別ごとの動詞 */
export function bornVerb(type: EntityType): string {
  switch (type) {
    case "manga":
      return "連載が始まった漫画";
    case "anime":
      return "放送が始まったアニメ";
    case "game":
      return "発売されたゲーム";
    case "movie":
      return "公開された映画";
    case "brand":
      return "誕生した商品ブランド";
    case "musician":
      return "デビュー・結成したミュージシャン";
    case "company":
      return "設立された上場企業";
    default:
      return "誕生したキャラクター";
  }
}
