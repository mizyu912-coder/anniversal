import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import AdSlot from "@/components/AdSlot";
import AnnivList from "@/components/AnnivList";
import { getEntities } from "@/lib/data";
import { anniversariesInYear } from "@/lib/anniv";
import { FEATURE_YEARS } from "@/lib/site";
import { featureTitle, featureTypes } from "@/lib/feature";
import { ENTITY_TYPES } from "@/lib/types";
import type { EntityType } from "@/lib/types";

type Props = { params: Promise<{ year: string; type: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return FEATURE_YEARS.flatMap((y) => featureTypes().map((t) => ({ year: String(y), type: t })));
}

function load(year: number, type: EntityType) {
  const items = anniversariesInYear(getEntities(), year).filter((a) => a.type === type && a.milestone);
  const groups = new Map<number, typeof items>();
  for (const a of items) groups.set(a.n, [...(groups.get(a.n) ?? []), a]);
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, type } = await params;
  const groups = load(+year, type as EntityType);
  const ns = groups.map(([n]) => `${n}周年`).slice(0, 5).join("・");
  return {
    title: featureTitle(+year, type as EntityType),
    description: `${year}年に${ns || "節目の周年"}を迎える${ENTITY_TYPES[type as EntityType]}をまとめました。記念日の日付と起算日も掲載。`,
    alternates: { canonical: `/feature/${year}/${type}/` },
  };
}

export default async function FeaturePage({ params }: Props) {
  const p = await params;
  const year = +p.year;
  const type = p.type as EntityType;
  const groups = load(year, type);
  const total = groups.reduce((s, [, l]) => s + l.length, 0);
  return (
    <>
      <Breadcrumb items={[["特集", "/feature/"], [`${year}年`, `/year/${year}/`], [ENTITY_TYPES[type]]]} />
      <h1>{featureTitle(year, type)}</h1>
      <p className="lead">
        {year}年に節目の周年を迎える{ENTITY_TYPES[type]}は{total}件です。周年の大きい順に並べています。
      </p>
      {groups.length === 0 && <p className="muted">該当するデータはまだありません。</p>}
      {groups.map(([n, list]) => (
        <section key={n} className="card">
          <h2>{n}周年</h2>
          <AnnivList items={list} showType={false} />
        </section>
      ))}
      <AdSlot />
      <p>
        <Link href={`/year/${year}/`}>{year}年の周年をすべて見る →</Link>
      </p>
    </>
  );
}
