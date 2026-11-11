import Link from "next/link";
import TodayList from "@/components/TodayList";
import AnnivList from "@/components/AnnivList";
import { getEntities } from "@/lib/data";
import { anniversariesInYear } from "@/lib/anniv";
import { BUILD_YEAR, SITE_DESCRIPTION, yearRange } from "@/lib/site";
import { featureTitle, featureTypes } from "@/lib/feature";

export default function Home() {
  const next = BUILD_YEAR + 1;
  const big = anniversariesInYear(getEntities(), next)
    .filter((a) => a.n % 10 === 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 10);
  return (
    <>
      <section className="hero">
        <h1>あの作品は何周年？周年がすぐわかる</h1>
        <p className="lead">{SITE_DESCRIPTION}</p>
        <form action="/search/" method="get">
          <input name="q" type="search" placeholder="作品名・キャラ名・企業名で逆引き" aria-label="逆引き検索" />
          <button className="btn" type="submit">
            検索
          </button>
        </form>
      </section>

      <section className="card">
        <h2>年から探す</h2>
        <ul className="years">
          {yearRange().map((y) => (
            <li key={y}>
              <Link href={`/year/${y}/`} className={y === BUILD_YEAR ? "current" : ""}>
                {y}年
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <TodayList />

      <section className="card">
        <h2>{next}年に大きな節目を迎えるもの</h2>
        <AnnivList items={big} />
        <p>
          <Link href={`/year/${next}/`}>{next}年の周年をすべて見る →</Link>
        </p>
      </section>

      <section className="card">
        <h2>特集</h2>
        <ul className="grid">
          {featureTypes().map((t) => (
            <li key={t}>
              <Link href={`/feature/${next}/${t}/`}>{featureTitle(next, t)}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
