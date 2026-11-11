import { getEntities } from "./data";
import type { BaseKind, EntityType } from "./types";

export interface DayEntry {
  id: string;
  name: string;
  type: EntityType;
  kind: BaseKind;
  baseYear: number | null;
  month: number;
  day: number | null;
}

/** 指定月の記念日（birthday=trueなら誕生日のみ、falseなら誕生日以外） */
export function entriesInMonth(month: number, birthday: boolean): DayEntry[] {
  const out: DayEntry[] = [];
  for (const e of getEntities())
    for (const b of e.bases) {
      if (b.month !== month || (b.kind === "birthday") !== birthday) continue;
      out.push({ id: e.id, name: e.name, type: e.type, kind: b.kind, baseYear: b.year, month, day: b.day });
    }
  return out.sort((a, b) => (a.day ?? 32) - (b.day ?? 32));
}

export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
