import type { Metadata } from "next";
import Link from "next/link";
import { entriesInMonth, MONTHS } from "@/lib/calendar";
import { getEntity } from "@/lib/data";

type Props = { params: Promise<{ month: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return MONTHS.map((m) => ({ month: String(m) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  return {
    title: `${month}月生まれのキャラクター誕生日一覧`,
    description: `${month}月が誕生日の漫画・アニメ・ゲームのキャラクター一覧。`,
    alternates: { canonical: `/birthdays/${month}/` },
  };
}

export default async function BirthdaysMonth({ params }: Props) {
  const month = Number((await params).month);
  const items = entriesInMonth(month, true);
  return (
    <>
      <p className="breadcrumb">
        <Link href="/">トップ</Link> › <Link href="/birthdays/">キャラクター誕生日</Link> › {month}月
      </p>
      <h1>{month}月生まれのキャラクター</h1>
      <ul className="years">
        {MONTHS.map((m) => (
          <li key={m}>
            <Link href={`/birthdays/${m}/`} className={m === month ? "current" : ""}>
              {m}月
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="muted">データはまだありません。</p>}
      <ul className="anniv-list">
        {items.map((x) => {
          const e = getEntity(x.id)!;
          const parent = e.parentId ? getEntity(e.parentId) : undefined;
          return (
            <li key={x.id}>
              <span className="date">
                {month}/{x.day}
              </span>
              <span className="nth">誕生日</span>
              <span className="name">
                <Link href={`/e/${x.id}/`}>{x.name}</Link>
                {parent && <small>{parent.name}</small>}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
