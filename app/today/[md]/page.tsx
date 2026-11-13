import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { allDays, dayParam, itemsOnDay, neighborDays, parseDayParam } from "@/lib/pages";
import type { DayItem } from "@/lib/pages";
import { itemListLd } from "@/lib/seo";
import { BUILD_YEAR } from "@/lib/site";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";

type Props = { params: Promise<{ md: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return allDays().map(({ month, day }) => ({ md: dayParam(month, day) }));
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month, day } = parseDayParam((await params).md);
  const { anniv, birthdays } = itemsOnDay(month, day);
  const top = [...anniv.slice(0, 3).map((x) => x.name), ...birthdays.slice(0, 1).map((x) => `${x.name}の誕生日`)];
  const total = anniv.length + birthdays.length;
  return {
    title: `${month}月${day}日は何の日？この日に生まれた作品・キャラクター・企業`,
    description: `${month}月${day}日は${top.join("、")}など${total}件の記念日。この日に連載・放送・発売・設立された漫画・アニメ・ゲーム・映画・ブランド・企業と、誕生日のキャラクターを紹介します。`,
    alternates: { canonical: `/today/${dayParam(month, day)}/` },
    // 件数が少ない日は検索結果に出さない（薄いページを増やさないため）
    ...(total < 3 ? { robots: { index: false, follow: true } } : {}),
  };
}

function List({ items }: { items: DayItem[] }) {
  return (
    <ul className="anniv-list">
      {items.map((x) => (
        <li key={x.id + x.kind}>
          <span className="date">{x.baseYear ? `${x.baseYear}年` : ""}</span>
          <span>{x.n && <span className={`nth${x.milestone ? " milestone" : ""}`}>{x.n}周年</span>}</span>
          <span className="name">
            <Link href={`/e/${x.id}/`}>{x.name}</Link>
            <small>
              <span className={`tag t-${x.type}`}>{ENTITY_TYPES[x.type]}</span>
              {BASE_KINDS[x.kind]}
            </small>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function DayPage({ params }: Props) {
  const { month, day } = parseDayParam((await params).md);
  const { anniv, birthdays } = itemsOnDay(month, day);
  const { prev, next } = neighborDays(month, day);
  const milestones = anniv.filter((x) => x.milestone);
  const lead = anniv.slice(0, 3);
  return (
    <article className="article">
      <JsonLd data={itemListLd(`${month}月${day}日が記念日の作品・ブランド・企業`, anniv.map((x) => ({ name: x.name, href: `/e/${x.id}/` })))} />
      <Breadcrumb items={[["今日は何の日", "/today/"], [`${month}月`, `/calendar/${month}/`], [`${day}日`]]} />
      <p className="eyebrow">
        {String(month).padStart(2, "0")}.{String(day).padStart(2, "0")}
      </p>
      <h1>
        {month}月{day}日は何の日？
      </h1>
      <p className="article-lead">
        {month}月{day}日は、
        {lead.map((x, i) => (
          <span key={x.id + x.kind}>
            <Link href={`/e/${x.id}/`}>{x.name}</Link>の{BASE_KINDS[x.kind]}日{x.baseYear ? `（${x.baseYear}年）` : ""}
            {i < lead.length - 1 ? "、" : ""}
          </span>
        ))}
        {lead.length > 0 ? "です。" : ""}
        {birthdays.length > 0 && (
          <>
            また、<Link href={`/e/${birthdays[0].id}/`}>{birthdays[0].name}</Link>
            {birthdays.length > 1 ? `など${birthdays.length}人のキャラクター` : ""}の誕生日でもあります。
          </>
        )}
        {milestones.length > 0 && `${BUILD_YEAR}年は${milestones.slice(0, 2).map((x) => `${x.name}が${x.n}周年`).join("、")}の節目の年です。`}
      </p>

      <nav className="month-index" aria-label="前後の日">
        <ul>
          <li>
            <Link href={`/today/${dayParam(prev.month, prev.day)}/`}>
              ← {prev.month}月{prev.day}日
            </Link>
          </li>
          <li>
            <Link href={`/calendar/${month}/`}>{month}月の記念日一覧</Link>
          </li>
          <li>
            <Link href={`/today/${dayParam(next.month, next.day)}/`}>
              {next.month}月{next.day}日 →
            </Link>
          </li>
        </ul>
      </nav>

      {anniv.length > 0 && (
        <section className="card">
          <h2>
            {month}月{day}日に生まれた作品・ブランド・企業
          </h2>
          <p className="muted small">連載開始・放送開始・発売・公開・設立などの日が{month}月{day}日のものです。周年は{BUILD_YEAR}年時点。</p>
          <List items={anniv} />
        </section>
      )}

      {birthdays.length > 0 && (
        <section className="card">
          <h2>
            {month}月{day}日が誕生日のキャラクター
          </h2>
          <ul className="grid">
            {birthdays.map((x) => (
              <li key={x.id}>
                <Link href={`/e/${x.id}/`}>{x.name}</Link>
              </li>
            ))}
          </ul>
          <p className="more">
            <Link href={`/birthdays/${month}/`}>{month}月生まれのキャラクターをすべて見る</Link>
          </p>
        </section>
      )}

      <AdSlot />
      <p className="muted small">
        日付は公開情報（Wikidataなど）をもとにしており、公式発表と異なる場合があります。
      </p>
    </article>
  );
}
