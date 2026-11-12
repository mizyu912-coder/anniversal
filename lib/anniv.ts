import type { Base, Entity, Anniversary } from "./types";

/** 節目の周年: 1周年と5の倍数 */
export function isMilestone(n: number): boolean {
  return n === 1 || n % 5 === 0;
}

export function anniversaryOf(entity: Entity, base: Base, year: number): Anniversary | null {
  if (base.year === null || base.kind === "birthday") return null;
  const n = year - base.year;
  if (n < 1) return null;
  return {
    entityId: entity.id,
    name: entity.name,
    type: entity.type,
    kind: base.kind,
    baseYear: base.year,
    month: base.month,
    day: base.day,
    n,
    milestone: isMilestone(n),
    pop: entity.pop,
  };
}

export function sortByDate<T extends { month: number | null; day: number | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.month ?? 13) - (b.month ?? 13) || (a.day ?? 32) - (b.day ?? 32));
}

/** 知名度順（同じなら周年の大きい順） */
export function sortByPop<T extends { pop: number; n: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.pop - a.pop || b.n - a.n);
}

export function anniversariesInYear(entities: Entity[], year: number): Anniversary[] {
  const out: Anniversary[] = [];
  for (const e of entities) {
    for (const b of e.bases) {
      const a = anniversaryOf(e, b, year);
      if (a) out.push(a);
    }
  }
  return sortByDate(out);
}

/** 次の節目周年（today以降に初めて迎える節目） */
export function nextMilestone(
  base: { year: number | null; month: number | null; day: number | null },
  today: Date,
): { n: number; year: number; date: Date | null } | null {
  if (base.year === null) return null;
  const ty = today.getFullYear();
  for (let y = Math.max(ty, base.year + 1); y < ty + 200; y++) {
    const n = y - base.year;
    if (!isMilestone(n)) continue;
    const date = base.month ? new Date(y, base.month - 1, base.day ?? 1) : null;
    // 今年の記念日が既に過ぎていたら次へ（日付不明なら年単位で判定）
    if (y === ty && date && date < startOfDay(today)) continue;
    return { n, year: y, date };
  }
  return null;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDate(y: number | null, m: number | null, d: number | null): string {
  if (y === null && m && d) return `${m}月${d}日`;
  if (y === null) return "不明";
  if (!m) return `${y}年`;
  if (!d) return `${y}年${m}月`;
  return `${y}年${m}月${d}日`;
}

/** 絞り込みで選べる周年 */
export const NTH_OPTIONS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80, 90, 100];
