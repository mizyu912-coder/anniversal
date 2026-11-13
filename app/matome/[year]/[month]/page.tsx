import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Spotlight from "@/components/Spotlight";
import { getEntities } from "@/lib/data";
import { anniversariesInYear, sortByDate, sortByPop } from "@/lib/anniv";
import { FEATURE_YEARS } from "@/lib/site";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { Anniversary } from "@/lib/types";

type Props = { params: Promise<{ year: string; month: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return FEATURE_YEARS.flatMap((y) => Array.from({ length: 12 }, (_, i) => ({ year: String(y), month: String(i + 1) })));
}

const label = (a: Anniversary) => (a.type === "company" ? "上場企業" : ENTITY_TYPES[a.type]);
const when = (a: Anniversary) => `${a.baseYear}年${a.month}月${a.day ? `${a.day}日` : ""}`;

/** その月に迎える節目（5の倍数周年）。設立と上場の両方が該当する企業は1回だけ */
function picks(year: number, month: number) {
  const seen = new Set<string>();
  const all = sortByPop(anniversariesInYear(getEntities(), year).filter((a) => a.month === month && a.n >= 5 && a.n % 5 === 0)).filter((a) => {
    if (seen.has(a.entityId)) return false;
    seen.add(a.entityId);
    return true;
  });
  return { all, top: all.slice(0, 10), rest: sortByDate(all.slice(10, 60)) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year: y, month: m } = await params;
  const { top } = picks(+y, +m);
  return {
    title: `${y}年${m}月に周年を迎える作品・ブランド・企業`,
    description: `${y}年${m}月は${top
      .slice(0, 3)
      .map((a) => `${a.name}が${a.n}周年`)
      .join("、")}。${m}月に節目を迎える漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・企業をまとめました。`,
    alternates: { canonical: `/matome/${y}/${m}/` },
  };
}

export default async function MonthlyPage({ params }: Props) {
  const p = await params;
  const year = +p.year;
  const month = +p.month;
  const { all, top, rest } = picks(year, month);
  const prev = month === 1 ? (FEATURE_YEARS.includes(year - 1) ? [year - 1, 12] : null) : [year, month - 1];
  const next = month === 12 ? (FEATURE_YEARS.includes(year + 1) ? [year + 1, 1] : null) : [year, month + 1];
  return (
    <article className="article">
      <p className="breadcrumb">
        <Link href="/">トップ</Link> › <Link href={`/matome/${year}/`}>{year}年まとめ</Link> › {month}月
      </p>
      <p className="eyebrow">
        ANNIVERSARY {year}.{String(month).padStart(2, "0")}
      </p>
      <h1>
        {year}年{month}月に周年を迎える作品・ブランド・企業
      </h1>
      {all.length === 0 ? (
        <p className="article-lead">この月に節目を迎えるデータはまだありません。</p>
      ) : (
        <>
          <p className="article-lead">
            {year}年{month}月は、
            {top.slice(0, 3).map((a, i) => (
              <span key={a.entityId}>
                <Link href={`/e/${a.entityId}/`}>{a.name}</Link>が{a.n}周年{i < Math.min(3, top.length) - 1 ? "、" : ""}
              </span>
            ))}
            を迎えます。ほかにも{all.length}件の節目があります。ここでは注目の10件と、日付順の一覧を紹介します。
          </p>

          <Spotlight
            title={`${month}月の注目の周年`}
            items={top.map((a) => ({
              key: a.entityId,
              href: `/e/${a.entityId}/`,
              big: String(a.n),
              unit: "周年",
              name: a.name,
              tag: label(a),
              meta: `${when(a)}の${BASE_KINDS[a.kind]}`,
            }))}
          />

          {rest.length > 0 && (
            <section className="card">
              <h2>{month}月のそのほかの節目</h2>
              <ul className="article-list">
                {rest.map((a) => (
                  <li key={a.entityId}>
                    <b className="nth milestone">{a.n}周年</b>
                    <Link href={`/e/${a.entityId}/`}>{a.name}</Link>
                    <span className={`tag t-${a.type}`}>{label(a)}</span>
                    <small>
                      {when(a)}の{BASE_KINDS[a.kind]}から{a.n}年
                    </small>
                  </li>
                ))}
              </ul>
              <p className="more">
                <Link href={`/year/${year}/?m=${month}`}>
                  {year}年{month}月の周年をすべて見る
                </Link>
              </p>
            </section>
          )}
        </>
      )}

      <nav className="month-pager">
        {prev ? <Link href={`/matome/${prev[0]}/${prev[1]}/`}>‹ {prev[0]}年{prev[1]}月</Link> : <span />}
        <Link href={`/matome/${year}/`}>{year}年のまとめ</Link>
        {next ? <Link href={`/matome/${next[0]}/${next[1]}/`}>{next[0]}年{next[1]}月 ›</Link> : <span />}
      </nav>
      <AdSlot />
      <p className="muted small">日付は公開情報（Wikidataなど）をもとにしており、公式発表と異なる場合があります。</p>
    </article>
  );
}
