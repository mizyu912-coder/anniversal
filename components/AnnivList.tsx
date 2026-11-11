import Link from "next/link";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { Anniversary } from "@/lib/types";

export function dateLabel(a: { month: number | null; day: number | null }): string {
  if (!a.month) return "日付未詳";
  return a.day ? `${a.month}/${a.day}` : `${a.month}月`;
}

export default function AnnivList({ items, showType = true }: { items: Anniversary[]; showType?: boolean }) {
  if (!items.length) return <p className="muted">該当するデータはまだありません。</p>;
  return (
    <ul className="anniv-list">
      {items.map((a) => (
        <li key={`${a.entityId}-${a.kind}`}>
          <span className="date">{dateLabel(a)}</span>
          <span className={`nth${a.milestone ? " milestone" : ""}`}>{a.n}周年</span>
          <span className="name">
            <Link href={`/e/${a.entityId}/`}>{a.name}</Link>
            <small>
              {showType && <span className={`tag t-${a.type}`}>{ENTITY_TYPES[a.type]}</span>}
              {BASE_KINDS[a.kind]}（{a.baseYear}年）
            </small>
          </span>
        </li>
      ))}
    </ul>
  );
}
