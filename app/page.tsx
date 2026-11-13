import Link from "next/link";
import TodayList from "@/components/TodayList";
import AnnivList from "@/components/AnnivList";
import HeroArt from "@/components/HeroArt";
import HeroSearch from "@/components/HeroSearch";
import Logo from "@/components/Logo";
import { getEntities } from "@/lib/data";
import { anniversariesInYear, sortByPop } from "@/lib/anniv";
import { BUILD_YEAR, yearRange } from "@/lib/site";
import { featureTitle, featureTypes } from "@/lib/feature";
import { ENTITY_TYPES } from "@/lib/types";

export default function Home() {
  const next = BUILD_YEAR + 1;
  const entities = getEntities();
  const nextYear = anniversariesInYear(entities, next);
  // ジャンルが偏らないよう、各ジャンルから知名度の高い順に大きな節目を拾う
  const byType = new Map<string, typeof nextYear>();
  for (const a of sortByPop(nextYear.filter((a) => a.n % 10 === 0 || a.n % 25 === 0))) {
    const list = byType.get(a.type) ?? [];
    list.push(a);
    byType.set(a.type, list);
  }
  const big: typeof nextYear = [];
  for (let round = 0; big.length < 8 && round < 8; round++) {
    for (const list of byType.values()) if (list[round] && big.length < 8) big.push(list[round]);
  }
  big.sort((a, b) => b.n - a.n);
  const counts = Object.keys(ENTITY_TYPES).length;
  return (
    <>
      <section className="hero full">
        <HeroArt />
        <div className="hero-inner">
          <div className="hero-brand">
            <Logo size="lg" />
          </div>
          <h1 className="hero-title">すべての周年に、拍手を。</h1>
          <p className="hero-lead">
            <span className="lead-genres">漫画・アニメ・ゲーム・映画・ブランド・ミュージシャン・上場企業</span>
            <span>約{Math.floor(entities.length / 100) * 100}件の「周年」を、年からも作品からも。</span>
          </p>
          <HeroSearch years={yearRange()} defaultYear={next} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">NEXT YEAR</p>
          <h2>{next}年、大きな節目を迎えるもの</h2>
        </div>
        <ul className="medal-grid">
          {big.map((a) => (
            <li key={a.entityId + a.kind}>
              <Link href={`/e/${a.entityId}/`} className="medal-card">
                <span className={`medal n${a.n >= 50 ? "gold" : a.n >= 25 ? "silver" : "bronze"}`}>
                  <b>{a.n}</b>
                  <small>th</small>
                </span>
                <span className="medal-body">
                  <span className={`tag t-${a.type}`}>{ENTITY_TYPES[a.type]}</span>
                  <strong>{a.name}</strong>
                  <small>
                    {a.baseYear}年{a.month ? `${a.month}月` : ""}
                    {a.day ? `${a.day}日` : ""}〜
                  </small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="more">
          <Link href={`/matome/${next}/`}>{next}年の周年まとめを読む</Link>
          <Link href={`/year/${next}/`}>{next}年の周年をすべて見る</Link>
        </p>
      </section>

      <section className="section">
        <TodayList />
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">FEATURES</p>
          <h2>{next}年 周年特集</h2>
        </div>
        <ul className="feature-grid">
          {featureTypes().map((t) => (
            <li key={t}>
              <Link href={`/feature/${next}/${t}/`}>
                <span className="feature-type">{ENTITY_TYPES[t]}</span>
                <span>{featureTitle(next, t)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">BY YEAR</p>
          <h2>年から探す</h2>
        </div>
        <ul className="years">
          {yearRange().map((y) => (
            <li key={y}>
              <Link href={`/year/${y}/`} className={y === BUILD_YEAR ? "current" : ""}>
                {y}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="biz-card">
          <p className="eyebrow">FOR BUSINESS</p>
          <h2>周年企画のネタ探しに</h2>
          <p>
            年別ページでは、ジャンル・月・周年で絞り込み、そのままCSVで保存できます。出版・広告・販促の企画書づくりにお使いください。全{counts - 1}ジャンルに対応しています。
          </p>
          <Link href={`/year/${next}/`} className="btn-outline">
            {next}年のリストを見る
          </Link>
        </div>
      </section>
    </>
  );
}
