"use client";
import { useEffect, useState } from "react";
import { nextMilestone, startOfDay } from "@/lib/anniv";

/** 次の節目周年までのカウントダウン（閲覧日基準で計算） */
export default function Countdown({ year, month, day, label }: { year: number; month: number | null; day: number | null; label: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const today = new Date();
    const nm = nextMilestone({ year, month, day }, today);
    if (!nm) return;
    let rest = "";
    if (nm.date) {
      const days = Math.round((nm.date.getTime() - startOfDay(today).getTime()) / 86400000);
      rest = days === 0 ? "（今日！）" : `（あと${days.toLocaleString()}日）`;
    }
    const md = month ? `${month}月${day ? `${day}日` : ""}` : "";
    setText(`次の節目：${nm.year}年${md}に${label}${nm.n}周年${rest}`);
  }, [year, month, day, label]);
  if (!text) return null;
  return <p className="countdown">{text}</p>;
}
