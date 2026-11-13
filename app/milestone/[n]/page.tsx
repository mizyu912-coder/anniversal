import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import AdSlot from "@/components/AdSlot";
import Spotlight from "@/components/Spotlight";
import { getEntities } from "@/lib/data";
import { anniversariesInYear, sortByPop } from "@/lib/anniv";
import { FEATURE_YEARS, MILESTONES } from "@/lib/site";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { Anniversary } from "@/lib/types";


type Props = { params: Promise<{ n: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return MILESTONES.map((n) => ({ n: String(n) }));
}

const label = (a: Anniversary) => (a.type === "company" ? "上場企業" : ENTITY_TYPES[a.type]);
const when = (a: Anniversary) => `${a.baseYear}年${a.month ? `${a.month}月` : ""}${a.day ? `${a.day}日` : ""}`;

/** 年ごとに、その周年を迎えるもの（企業の設立・上場の重複は1回に） */
function byYear(n: number) {
  const entities = getEntities();
  return FEATURE_YEARS.map((y) => {
    const seen = new Set<string>();
    const list = sortByPop(anniversariesInYear(entities, y).filter((a) => a.n === n)).filter((a) => {
      if (seen.has(a.entityId)) return false;
      seen.add(a.entityId);
      return true;
    });
    return { year: y, list };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = +(await params).n;
  const first = byYear(n)[0];
  const y0 = FEATURE_YEARS[0];
  const y1 = FEATURE_YEARS[FEATURE_YEARS.length - 1];
  return {
    title: `${n}周年を迎える作品・ブランド・企業一覧（${y0}〜${y1}年）`,
    description: `${y0}〜${y1}年に${n}周年を迎える漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・企業を年ごとにまとめました。${first.list
      .slice(0, 3)
      .map((a) => a.name)
      .join("、")}など。`,
    alternates: { canonical: `/milestone/${n}/` },
  };
}

export default async function MilestonePage({ params }: Props) {
  const n = +(await params).n;
  const years = byYear(n);
  const all = sortByPop(years.flatMap((y) => y.list));
  const y0 = FEATURE_YEARS[0];
  const y1 = FEATURE_YEARS[FEATURE_YEARS.length - 1];
  return (
    <article className="article">
      <Breadcrumb items={[["節目別の特集", "/milestone/"], [`${n}周年`]]} />
      <p className="eyebrow">{n}TH ANNIVERSARY</p>
      <h1>
        {n}周年を迎える作品・ブランド・企業（{y0}〜{y1}年）
      </h1>
      <p className="article-lead">
        {y0}年から{y1}年までに{n}周年を迎えるものを年ごとにまとめました。
        {all.length > 0 && (
          <>
            {all
              .slice(0, 3)
              .map((a) => `${a.name}（${a.baseYear + n}年）`)
              .join("、")}
            など、{all.length}件が{n}周年の節目を迎えます。
          </>
        )}
      </p>
      <nav className="month-index" aria-label="ほかの節目">
        <ul>
          {MILESTONES.map((m) => (
            <li key={m}>
              <Link href={`/milestone/${m}/`} aria-current={m === n ? "page" : undefined} className={m === n ? "current" : ""}>
                {m}周年
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Spotlight
        title={`${n}周年を迎える注目の作品・ブランド`}
        items={all.slice(0, 10).map((a) => ({
          key: `${a.entityId}-${a.kind}`,
          href: `/e/${a.entityId}/`,
          big: String(a.baseYear + n),
          unit: "年に",
          name: a.name,
          tag: label(a),
          meta: `${when(a)}の${BASE_KINDS[a.kind]}`,
        }))}
      />

      {years
        .filter((y) => y.list.length > 0)
        .map(({ year, list }) => (
          <section className="card" key={year}>
            <h2>
              {year}年に{n}周年（{list.length}件）
            </h2>
            <ul className="article-list">
              {list.slice(0, 15).map((a) => (
                <li key={`${a.entityId}-${a.kind}`}>
                  <b className="nth milestone">{n}周年</b>
                  <Link href={`/e/${a.entityId}/`}>{a.name}</Link>
                  <span className={`tag t-${a.type}`}>{label(a)}</span>
                  <small>
                    {when(a)}の{BASE_KINDS[a.kind]}から
                  </small>
                </li>
              ))}
            </ul>
            {list.length > 15 && (
              <p className="more">
                <Link href={`/year/${year}/?n=${n}`}>
                  {year}年に{n}周年を迎えるものをすべて見る
                </Link>
              </p>
            )}
          </section>
        ))}
      <AdSlot />
      <p className="muted small">日付は公開情報（Wikidataなど）をもとにしており、公式発表と異なる場合があります。</p>
    </article>
  );
}
