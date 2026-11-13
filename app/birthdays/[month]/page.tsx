import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { entriesInMonth, MONTHS } from "@/lib/calendar";
import { getEntity } from "@/lib/data";
import Spotlight from "@/components/Spotlight";
import AdSlot from "@/components/AdSlot";

type Props = { params: Promise<{ month: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return MONTHS.map((m) => ({ month: String(m) }));
}

/** 知名度順の上位（記事の冒頭とカードに使う） */
function popular(month: number) {
  return entriesInMonth(month, true)
    .map((x) => ({ x, e: getEntity(x.id)! }))
    .sort((a, b) => b.e.pop - a.e.pop);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const top = popular(+month).slice(0, 3).map(({ x }) => x.name);
  return {
    title: `${month}月生まれのキャラクター誕生日一覧`,
    description: `${month}月が誕生日の漫画・アニメ・ゲームのキャラクター一覧。${top.length ? `${top.join("、")}など。` : ""}`,
    alternates: { canonical: `/birthdays/${month}/` },
  };
}

export default async function BirthdaysMonth({ params }: Props) {
  const month = Number((await params).month);
  const items = entriesInMonth(month, true);
  const pop = popular(month);
  const work = (id: string) => {
    const e = getEntity(id);
    return e?.parentId ? (getEntity(e.parentId)?.name ?? "") : "";
  };
  return (
    <>
      <Breadcrumb items={[["キャラクター誕生日", "/birthdays/"], [`${month}月`]]} />
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
      {items.length === 0 ? (
        <p className="muted">データはまだありません。</p>
      ) : (
        <p className="article-lead">
          {month}月は、
          {pop
            .slice(0, 3)
            .map(({ x }) => x.name)
            .join("、")}
          など、{items.length}人のキャラクターが誕生日を迎えます。誕生日のお祝いや、作品のイベント・グッズ企画の参考にどうぞ。
        </p>
      )}
      <Spotlight
        en="HAPPY BIRTHDAY"
        title={`${month}月生まれの人気キャラクター`}
        items={pop.slice(0, 6).map(({ x }) => ({
          key: x.id,
          href: `/e/${x.id}/`,
          big: `${month}/${x.day}`,
          unit: "誕生日",
          name: x.name,
          tag: "",
          meta: work(x.id),
        }))}
      />
      <h2>{month}月生まれのキャラクター（日付順）</h2>
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
      <AdSlot />
    </>
  );
}
