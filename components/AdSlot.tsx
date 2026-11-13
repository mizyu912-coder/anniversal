"use client";
import { useEffect, useRef } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";

/**
 * 広告枠。AdSense のサイト運営者ID（ADSENSE_CLIENT）と広告ユニットID（ADSENSE_SLOT）の両方が
 * 設定されたときだけ表示する。未設定のあいだは何も描画しない（自動広告を使う場合も不要）。
 */
export default function AdSlot({ label = "スポンサーリンク" }: { label?: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (!CLIENT || !SLOT || done.current) return;
    done.current = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* 広告ブロッカーなどで読み込めない場合は何もしない */
    }
  }, []);
  if (!CLIENT || !SLOT) return null;
  return (
    <aside className="ad-slot" aria-label={label}>
      <span className="ad-label">{label}</span>
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={CLIENT} data-ad-slot={SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
