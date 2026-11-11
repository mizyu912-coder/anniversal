import type { Metadata } from "next";
import Link from "next/link";
import { entriesInMonth, MONTHS } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "キャラクター誕生日一覧",
  description: "漫画・アニメ・ゲームのキャラクターの誕生日を月別に一覧できます。",
  alternates: { canonical: "/birthdays/" },
};

export default function BirthdaysIndex() {
  return (
    <>
      <h1>キャラクター誕生日一覧</h1>
      <ul className="grid">
        {MONTHS.map((m) => (
          <li key={m}>
            <Link href={`/birthdays/${m}/`}>
              {m}月生まれ <span className="muted">（{entriesInMonth(m, true).length}人）</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
