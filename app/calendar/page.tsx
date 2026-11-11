import type { Metadata } from "next";
import Link from "next/link";
import { entriesInMonth, MONTHS } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "周年カレンダー（記念日一覧）",
  description: "連載開始・放送開始・発売・公開・デビュー・設立などの記念日を月別にまとめた周年カレンダー。",
  alternates: { canonical: "/calendar/" },
};

export default function CalendarIndex() {
  return (
    <>
      <h1>周年カレンダー</h1>
      <p className="lead">作品・ブランド・企業の記念日を月ごとに一覧できます。</p>
      <ul className="grid">
        {MONTHS.map((m) => (
          <li key={m}>
            <Link href={`/calendar/${m}/`}>
              {m}月の記念日 <span className="muted">（{entriesInMonth(m, false).length}件）</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
