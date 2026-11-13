import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import TodayLink from "@/components/TodayLink";
import { allDays, dayParam } from "@/lib/pages";
import { MONTHS } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "今日は何の日？作品・キャラクター・企業の記念日カレンダー",
  description: "1年366日、その日に連載・放送・発売・設立された漫画・アニメ・ゲーム・映画・ブランド・企業と、誕生日のキャラクターを日付から探せます。",
  alternates: { canonical: "/today/" },
};

export default function TodayIndex() {
  const days = allDays();
  return (
    <>
      <Breadcrumb items={[["今日は何の日"]]} />
      <h1>今日は何の日？</h1>
      <p>日付を選ぶと、その日に生まれた作品・ブランド・企業と、誕生日のキャラクターが見られます。</p>
      <TodayLink />
      {MONTHS.map((m) => (
        <section className="card" key={m}>
          <h2>
            <Link href={`/calendar/${m}/`}>{m}月</Link>
          </h2>
          <ul className="chips">
            {days
              .filter((d) => d.month === m)
              .map((d) => (
                <li key={d.day}>
                  <Link href={`/today/${dayParam(d.month, d.day)}/`}>{d.day}日</Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}
