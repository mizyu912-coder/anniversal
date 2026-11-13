import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import NthThisYear from "@/components/NthThisYear";
import { entriesInMonth, MONTHS } from "@/lib/calendar";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";

type Props = { params: Promise<{ month: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return MONTHS.map((m) => ({ month: String(m) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  return {
    title: `${month}月の記念日・周年カレンダー`,
    description: `${month}月に記念日を迎える漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・企業の一覧。`,
    alternates: { canonical: `/calendar/${month}/` },
  };
}

export default async function CalendarMonth({ params }: Props) {
  const month = Number((await params).month);
  const items = entriesInMonth(month, false);
  return (
    <>
      <Breadcrumb items={[["周年カレンダー", "/calendar/"], [`${month}月`]]} />
      <h1>{month}月の記念日</h1>
      <ul className="years">
        {MONTHS.map((m) => (
          <li key={m}>
            <Link href={`/calendar/${m}/`} className={m === month ? "current" : ""}>
              {m}月
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="muted">データはまだありません。</p>}
      <ul className="anniv-list">
        {items.map((x) => (
          <li key={x.id + x.kind}>
            <span className="date">{x.day ? `${month}/${x.day}` : `${month}月`}</span>
            <span>{x.baseYear !== null && <NthThisYear baseYear={x.baseYear} />}</span>
            <span className="name">
              <Link href={`/e/${x.id}/`}>{x.name}</Link>
              <small>
                <span className={`tag t-${x.type}`}>{ENTITY_TYPES[x.type]}</span>
                {BASE_KINDS[x.kind]}（{x.baseYear}年）
              </small>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
