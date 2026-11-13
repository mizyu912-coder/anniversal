import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import YearFilter from "@/components/YearFilter";
import { getEntities } from "@/lib/data";
import { anniversariesInYear } from "@/lib/anniv";
import { yearRange } from "@/lib/site";

type Props = { params: Promise<{ year: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return yearRange().map((y) => ({ year: String(y) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year}年に周年を迎える作品・ブランド・企業一覧`,
    description: `${year}年に10周年・20周年・30周年などの節目を迎える漫画・アニメ・ゲーム・映画・商品ブランド・ミュージシャン・上場企業の一覧。種別や月で絞り込めます。`,
    alternates: { canonical: `/year/${year}/` },
  };
}

export default async function YearPage({ params }: Props) {
  const year = Number((await params).year);
  const items = anniversariesInYear(getEntities(), year).filter((a) => a.milestone);
  return (
    <>
      <Breadcrumb items={[[`${year}年`]]} />
      <h1>{year}年に周年を迎える作品・ブランド・企業</h1>
      <ul className="years">
        {yearRange().map((y) => (
          <li key={y}>
            <Link href={`/year/${y}/`} className={y === year ? "current" : ""}>
              {y}
            </Link>
          </li>
        ))}
      </ul>
      <YearFilter items={items} year={year} />
    </>
  );
}
