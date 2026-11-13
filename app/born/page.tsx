import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { bornByYear, bornYears } from "@/lib/pages";
import { wareki } from "@/lib/seo";

export const metadata: Metadata = {
  title: "生まれ年から探す｜同い年の作品・ブランド・企業",
  description: "自分の生まれ年や好きな年に始まった漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・企業を、年ごとに一覧で探せます。",
  alternates: { canonical: "/born/" },
};

export default function BornIndex() {
  const years = bornYears().reverse();
  const map = bornByYear();
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))];
  return (
    <>
      <Breadcrumb items={[["生まれ年から探す"]]} />
      <h1>生まれ年から探す</h1>
      <p>あなたと同い年の作品は？ 年を選ぶと、その年に始まった・発売されたものが一覧で見られます。</p>
      {decades.map((d) => (
        <section className="card" key={d}>
          <h2>{d}年代</h2>
          <ul className="chips">
            {years
              .filter((y) => Math.floor(y / 10) * 10 === d)
              .map((y) => (
                <li key={y}>
                  <Link href={`/born/${y}/`}>
                    {y}年<small>（{wareki(y) ? `${wareki(y)}・` : ""}{map.get(y)!.length}件）</small>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}
