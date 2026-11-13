import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { getEntities } from "@/lib/data";
import { bornTypePairs, mainBaseOf } from "@/lib/pages";
import { itemListLd } from "@/lib/seo";
import { BUILD_YEAR, FEATURE_YEARS } from "@/lib/site";
import { featureTitle, featureTypes } from "@/lib/feature";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { EntityType } from "@/lib/types";

type Props = { params: Promise<{ type: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return (Object.keys(ENTITY_TYPES) as EntityType[]).map((type) => ({ type }));
}

const TOP = 100;

function load(type: EntityType) {
  return getEntities()
    .filter((e) => e.type === type)
    .sort((a, b) => b.pop - a.pop);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = (await params).type as EntityType;
  const list = load(type);
  const label = ENTITY_TYPES[type];
  return {
    title: type === "character" ? "キャラクターの誕生日一覧（人気順）" : `${label}の周年一覧（人気順）｜何周年かがすぐ分かる`,
    description: `${list
      .slice(0, 3)
      .map((e) => e.name)
      .join("、")}など、${label}${list.length}件の${type === "character" ? "誕生日" : "周年・起算日"}を掲載。人気順と年代別に探せます。`,
    alternates: { canonical: `/type/${type}/` },
  };
}

export default async function TypePage({ params }: Props) {
  const type = (await params).type as EntityType;
  const list = load(type);
  const label = ENTITY_TYPES[type];
  const years = bornTypePairs()
    .filter((p) => p.type === type)
    .map((p) => p.year)
    .reverse();
  return (
    <>
      <JsonLd data={itemListLd(`人気の${label}`, list.map((e) => ({ name: e.name, href: `/e/${e.id}/` })))} />
      <Breadcrumb items={[[label]]} />
      <h1>{type === "character" ? "キャラクターの誕生日一覧" : `${label}の周年一覧`}</h1>
      <p>
        {label}
        {list.length}件のうち、知名度の高い{Math.min(TOP, list.length)}件を並べています。名前から探すときは
        <Link href="/search/">逆引き検索</Link>をどうぞ。
      </p>
      <nav className="month-index" aria-label="ほかの種類">
        <ul>
          {(Object.keys(ENTITY_TYPES) as EntityType[]).map((t) => (
            <li key={t}>
              <Link href={`/type/${t}/`} className={t === type ? "current" : ""}>
                {ENTITY_TYPES[t]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="card">
        <h2>人気の{label}</h2>
        <ul className="anniv-list">
          {list.slice(0, TOP).map((e) => {
            const b = mainBaseOf(e) ?? e.bases[0];
            const n = b && b.year !== null && b.kind !== "birthday" ? BUILD_YEAR - b.year : null;
            return (
              <li key={e.id}>
                <span className="date">{b ? (b.year ? `${b.year}年` : b.month ? `${b.month}/${b.day}` : "") : ""}</span>
                <span>{n !== null && n >= 1 && <span className={`nth${n % 5 === 0 ? " milestone" : ""}`}>{n}周年</span>}</span>
                <span className="name">
                  <Link href={`/e/${e.id}/`}>{e.name}</Link>
                  {b && <small>{BASE_KINDS[b.kind]}</small>}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <AdSlot />
      {years.length > 0 && (
        <section className="card">
          <h2>年代別の{label}</h2>
          <ul className="chips">
            {years.map((y) => (
              <li key={y}>
                <Link href={`/born/${y}/${type}/`}>{y}年</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {featureTypes().includes(type) && (
        <section className="card">
          <h2>周年を迎える{label}</h2>
          <ul className="grid">
            {FEATURE_YEARS.map((y) => (
              <li key={y}>
                <Link href={`/feature/${y}/${type}/`}>{featureTitle(y, type)}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
