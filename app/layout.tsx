import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}｜作品・ブランド・企業の周年検索`, template: `%s｜${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, locale: "ja_JP", type: "website" },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="logo">
              {SITE_NAME}
            </Link>
            <nav>
              <Link href="/search/">逆引き</Link>
              <Link href="/feature/">特集</Link>
              <Link href="/calendar/">カレンダー</Link>
              <Link href="/birthdays/">誕生日</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              当サイトはアフィリエイト広告を利用しています。周年の日付は公開情報をもとにしており、誤りを含む場合があります。
            </p>
            <p>
              <Link href="/about/">このサイトについて・情報提供</Link>
            </p>
            <p>© {SITE_NAME}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
