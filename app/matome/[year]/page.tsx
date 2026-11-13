import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { itemListLd } from "@/lib/seo";
import { getEntities } from "@/lib/data";
import { anniversariesInYear, sortByPop } from "@/lib/anniv";
import { featureTypes } from "@/lib/feature";
import { FEATURE_YEARS, MILESTONES } from "@/lib/site";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { Anniversary, EntityType } from "@/lib/types";

type Props = { params: Promise<{ year: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return FEATURE_YEARS.map((y) => ({ year: String(y) }));
}

const label = (t: EntityType) => (t === "company" ? "上場企業" : ENTITY_TYPES[t]);
const when = (a: Anniversary) => `${a.baseYear}年${a.month ? `${a.month}月` : ""}${a.day ? `${a.day}日` : ""}`;

/** 記事に載せる「大きな節目」：10周年以上の5の倍数 */
function picks(year: number) {
  const all = anniversariesInYear(getEntities(), year).filter((a) => a.n >= 10 && a.n % 5 === 0);
  const byType = new Map<EntityType, Anniversary[]>();
  for (const t of featureTypes()) byType.set(t, sortByPop(all.filter((a) => a.type === t)).slice(0, 8));
  // 節目別（大きい順）。企業の設立・上場が両方入らないよう1社1回に
  const byN = new Map<number, Anniversary[]>();
  for (const n of [...new Set(all.map((a) => a.n))].filter((n) => MILESTONES.includes(n)).sort((a, b) => b - a)) {
    const seen = new Set<string>();
    const list = sortByPop(all.filter((a) => a.n === n)).filter((a) => !seen.has(a.entityId) && !!seen.add(a.entityId));
    if (list.length) byN.set(n, list.slice(0, 6));
  }
  return { all, byType, byN, top: sortByPop(all).slice(0, 5) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const year = +(await params).year;
  const { top, all } = picks(year);
  // タイトルには企業より作品を出す（検索されやすいため）
  const head = sortByPop(all.filter((a) => a.type !== "company"))[0] ?? top[0];
  return {
    title: `${year}年に周年を迎える作品・ブランド・企業まとめ${head ? `｜${head.name}${head.n}周年ほか` : ""}`,
    description: `${year}年は${top.slice(0, 3).map((a) => `${a.name}が${a.n}周年`).join("、")}。漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・上場企業の節目をジャンル別に紹介します。`,
    alternates: { canonical: `/matome/${year}/` },
  };
}

export default async function MatomePage({ params }: Props) {
  const year = +(await params).year;
  const { all, byType, byN, top } = picks(year);
  const types = [...byType.entries()].filter(([, list]) => list.length > 0);
  const big = sortByPop(all.filter((a) => a.n >= 50)).slice(0, 6);
  return (
    <article className="article">
      <Breadcrumb items={[[`${year}年`, `/year/${year}/`], ["まとめ"]]} />
      <p className="eyebrow">ANNIVERSARY {year}</p>
      <h1>{year}年に周年を迎える作品・ブランド・企業まとめ</h1>
      <p className="article-lead">
        {year}年は、
        {top.map((a, i) => (
          <span key={a.entityId + a.kind}>
            <Link href={`/e/${a.entityId}/`}>{a.name}</Link>が{a.n}周年
            {i < top.length - 1 ? "、" : ""}
          </span>
        ))}
        を迎えるなど、節目の年を迎える作品やブランドがそろっています。ここでは10周年以上の大きな節目をジャンル別に紹介します。
      </p>

      <JsonLd data={itemListLd(`${year}年に周年を迎える主な作品・ブランド・企業`, sortByPop(all).map((a) => ({ name: `${a.name}（${a.n}周年）`, href: `/e/${a.entityId}/` })))} />
      <nav className="month-index" aria-label="目次">
        <h2>目次</h2>
        <ul>
          {types.map(([t]) => (
            <li key={t}>
              <a href={`#${t}`}>{label(t)}</a>
            </li>
          ))}
          {[...byN.keys()].map((n) => (
            <li key={n}>
              <a href={`#n${n}`}>{n}周年</a>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="month-index" aria-label="月別のまとめ">
        <h2>月別のまとめ</h2>
        <ul>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <li key={m}>
              <Link href={`/matome/${year}/${m}/`}>{m}月</Link>
            </li>
          ))}
        </ul>
      </nav>

      {big.length > 0 && (
        <section className="card">
          <h2>50周年以上の大きな節目</h2>
          <ul className="article-list">
            {big.map((a) => (
              <li key={a.entityId + a.kind}>
                <b className="nth milestone">{a.n}周年</b>
                <Link href={`/e/${a.entityId}/`}>{a.name}</Link>
                <span className={`tag t-${a.type}`}>{label(a.type)}</span>
                <small>
                  {when(a)}の{BASE_KINDS[a.kind]}から{a.n}年
                </small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {types.map(([t, list]) => (
          <section className="card" key={t} id={t}>
            <h2>
              {label(t)}（{year}年）
            </h2>
            <ul className="article-list">
              {list.map((a) => (
                <li key={a.entityId + a.kind}>
                  <b className="nth milestone">{a.n}周年</b>
                  <Link href={`/e/${a.entityId}/`}>{a.name}</Link>
                  <small>
                    {when(a)}の{BASE_KINDS[a.kind]}から{a.n}年
                  </small>
                </li>
              ))}
            </ul>
            <p className="more">
              <Link href={`/feature/${year}/${t}/`}>{year}年に周年を迎える{label(t)}をすべて見る</Link>
            </p>
          </section>
        ))}

      {[...byN.entries()].map(([n, list]) => (
        <section className="card" key={n} id={`n${n}`}>
          <h2>
            {year}年に{n}周年を迎えるもの
          </h2>
          <ul className="article-list">
            {list.map((a) => (
              <li key={a.entityId + a.kind}>
                <Link href={`/e/${a.entityId}/`}>{a.name}</Link>
                <span className={`tag t-${a.type}`}>{label(a.type)}</span>
                <small>
                  {when(a)}の{BASE_KINDS[a.kind]}
                </small>
              </li>
            ))}
          </ul>
          {MILESTONES.includes(n) && (
            <p className="more">
              <Link href={`/milestone/${n}/`}>{n}周年を迎えるものをもっと見る</Link>
            </p>
          )}
        </section>
      ))}

      <AdSlot />
      <p className="muted small">
        日付は公開情報（Wikidataなど）をもとにしており、公式発表と異なる場合があります。ほかの周年は
        <Link href={`/year/${year}/`}>{year}年の周年一覧</Link>、<Link href="/milestone/">節目別の特集</Link>、<Link href={`/born/${year - 30}/`}>{year - 30}年に生まれたもの</Link>から探せます。
      </p>
    </article>
  );
}
