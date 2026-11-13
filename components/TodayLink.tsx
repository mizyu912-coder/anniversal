"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** 閲覧日の「今日は何の日」ページへのリンク */
export default function TodayLink({ className = "btn-outline" }: { className?: string }) {
  const [d, setD] = useState<{ m: number; d: number } | null>(null);
  useEffect(() => {
    const now = new Date();
    setD({ m: now.getMonth() + 1, d: now.getDate() });
  }, []);
  if (!d) return null;
  return (
    <p className="more">
      <Link href={`/today/${d.m}-${d.d}/`} className={className}>
        今日（{d.m}月{d.d}日）は何の日？
      </Link>
    </p>
  );
}
