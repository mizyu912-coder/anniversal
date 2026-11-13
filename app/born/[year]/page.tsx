import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { bornByYear, bornTypePairs, bornVerb, bornYears, mainBaseOf } from "@/lib/pages";
import { itemListLd, wareki } from "@/lib/seo";
import { BUILD_YEAR } from "@/lib/site";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { EntityType } from "@/lib/types";

type Props = { params: Promise<{ year: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return bornYears().map((y) => ({ year: String(y) }));
}

const PER_TYPE = 30;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const year = +(await params).year;
  const list = bornByYear().get(year) ?? [];
  const w = wareki(year);
  return {
    title: `${year}年${w ? `（${w}）` : ""}に生まれた作品・ブランド・企業一覧｜${BUILD_YEAR}年で${BUILD_YEAR - year}周年`,
    description: `${year}年${w ? `（${w}）` : ""}に始まった・発売された漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・企業の一覧。${list
      .slice(0, 3)
      .map((e) => e.name)
      .join("、")}など${list.length}件。同い年の作品を探せます。`,
    alternates: { canonical: `/born/${year}/` },
    ...(list.length < 5 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BornYearPage({ params }: Props) {
  const year = +(await params).year;
  const list = bornByYear().get(year) ?? [];
  const years = bornYears();
  const i = years.indexOf(year);
  const w = wareki(year);
  const types = (Object.keys(ENTITY_TYPES) as EntityType[]).filter((t) => list.some((e) => e.type === t));
  const typePages = new Set(bornTypePairs().filter((p) => p.year === year).map((p) => p.type));
  return (
    <article className="article">
      <JsonLd data={itemListLd(`${year}年に生まれた作品・ブランド・企業`, list.map((e) => ({ name: e.name, href: `/e/${e.id}/` })))} />
      <Breadcrumb items={[["生まれ年から探す", "/born/"], [`${year}年`]]} />
      <p className="eyebrow">BORN IN {year}</p>
      <h1>
        {year}年{w && `（${w}）`}に生まれた作品・ブランド・企業
      </h1>
      <p className="article-lead">
        {year}年に始まった・発売されたものは、{BUILD_YEAR}年で{BUILD_YEAR - year}周年を迎えます。
        {list.slice(0, 3).map((e, k) => (
          <span key={e.id}>
            <Link href={`/e/${e.id}/`}>{e.name}</Link>
            {k < Math.min(list.length, 3) - 1 ? "、" : ""}
          </span>
        ))}
        など{list.length}件を種類別に紹介します。
      </p>
      <nav className="month-index" aria-label="前後の年">
        <ul>
          {i > 0 && (
            <li>
              <Link href={`/born/${years[i - 1]}/`}>← {years[i - 1]}年</Link>
            </li>
          )}
          {types.map((t) => (
            <li key={t}>
              <a href={`#${t}`}>{ENTITY_TYPES[t]}</a>
            </li>
          ))}
          {i < years.length - 1 && (
            <li>
              <Link href={`/born/${years[i + 1]}/`}>{years[i + 1]}年 →</Link>
            </li>
          )}
        </ul>
      </nav>
      {types.map((t) => {
        const items = list.filter((e) => e.type === t);
        return (
          <section className="card" key={t} id={t}>
            <h2>
              {year}年に{bornVerb(t)}
            </h2>
            <ul className="article-list">
              {items.slice(0, PER_TYPE).map((e) => {
                const b = mainBaseOf(e)!;
                return (
                  <li key={e.id}>
                    <Link href={`/e/${e.id}/`}>{e.name}</Link>
                    <small>
                      {b.month ? `${b.month}月${b.day ? `${b.day}日` : ""}` : ""}
                      {BASE_KINDS[b.kind]}
                    </small>
                  </li>
                );
              })}
            </ul>
            {typePages.has(t) && items.length > PER_TYPE && (
              <p className="more">
                <Link href={`/born/${year}/${t}/`}>
                  {year}年に{bornVerb(t)}をすべて見る（{items.length}件）
                </Link>
              </p>
            )}
          </section>
        );
      })}
      <AdSlot />
      <p className="muted small">
        日付は公開情報（Wikidataなど）をもとにしています。<Link href={`/year/${BUILD_YEAR + 1}/`}>{BUILD_YEAR + 1}年に周年を迎えるもの</Link>も見られます。
      </p>
    </article>
  );
}
