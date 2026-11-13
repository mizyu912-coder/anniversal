import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { bornByYear, bornTypePairs, bornVerb, mainBaseOf } from "@/lib/pages";
import { itemListLd, wareki } from "@/lib/seo";
import { BUILD_YEAR } from "@/lib/site";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { EntityType } from "@/lib/types";

type Props = { params: Promise<{ year: string; type: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return bornTypePairs().map((p) => ({ year: String(p.year), type: p.type }));
}

async function load(params: Props["params"]) {
  const p = await params;
  const year = +p.year;
  const type = p.type as EntityType;
  const list = (bornByYear().get(year) ?? []).filter((e) => e.type === type);
  return { year, type, list };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, type, list } = await load(params);
  const w = wareki(year);
  return {
    title: `${year}年${w ? `（${w}）` : ""}に${bornVerb(type)}一覧｜${BUILD_YEAR}年で${BUILD_YEAR - year}周年`,
    description: `${year}年${w ? `（${w}）` : ""}に${bornVerb(type)}は${list
      .slice(0, 3)
      .map((e) => e.name)
      .join("、")}など${list.length}件。日付順の一覧と、${BUILD_YEAR}年に迎える周年を掲載。`,
    alternates: { canonical: `/born/${year}/${type}/` },
  };
}

export default async function BornTypePage({ params }: Props) {
  const { year, type, list } = await load(params);
  const w = wareki(year);
  const sorted = [...list].sort((a, b) => {
    const x = mainBaseOf(a)!, y = mainBaseOf(b)!;
    return (x.month ?? 13) - (y.month ?? 13) || (x.day ?? 32) - (y.day ?? 32);
  });
  const others = bornTypePairs().filter((p) => p.type === type).map((p) => p.year);
  return (
    <article className="article">
      <JsonLd data={itemListLd(`${year}年に${bornVerb(type)}`, list.map((e) => ({ name: e.name, href: `/e/${e.id}/` })))} />
      <Breadcrumb items={[["生まれ年から探す", "/born/"], [`${year}年`, `/born/${year}/`], [ENTITY_TYPES[type]]]} />
      <p className="eyebrow">BORN IN {year}</p>
      <h1>
        {year}年{w && `（${w}）`}に{bornVerb(type)}
      </h1>
      <p className="article-lead">
        {year}年に{bornVerb(type)}は、
        {list.slice(0, 3).map((e, k) => (
          <span key={e.id}>
            <Link href={`/e/${e.id}/`}>{e.name}</Link>
            {k < 2 ? "、" : ""}
          </span>
        ))}
        など{list.length}件。どれも{BUILD_YEAR}年で{BUILD_YEAR - year}周年を迎えます。
      </p>
      <section className="card">
        <h2>日付順の一覧</h2>
        <ul className="anniv-list">
          {sorted.map((e) => {
            const b = mainBaseOf(e)!;
            return (
              <li key={e.id}>
                <span className="date">{b.month ? `${b.month}/${b.day ?? ""}`.replace(/\/$/, "月") : "時期不明"}</span>
                <span className="name">
                  <Link href={`/e/${e.id}/`}>{e.name}</Link>
                  <small>{BASE_KINDS[b.kind]}</small>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <AdSlot />
      <nav className="month-index" aria-label="ほかの年">
        <h2>ほかの年の{ENTITY_TYPES[type]}</h2>
        <ul>
          {others.map((y) => (
            <li key={y}>
              <Link href={`/born/${y}/${type}/`} className={y === year ? "current" : ""}>
                {y}年
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
