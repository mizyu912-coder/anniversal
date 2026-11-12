import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Logo from "@/components/Logo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}｜作品・ブランド・企業の周年データベース`, template: `%s｜${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, locale: "ja_JP", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0f1014" };

const NAV = [
  ["/search/", "逆引き"],
  ["/feature/", "特集"],
  ["/calendar/", "カレンダー"],
  ["/birthdays/", "誕生日"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Shippori+Mincho:wght@500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="logo-link" aria-label={`${SITE_NAME} トップ`}>
              <Logo />
            </Link>
            <nav className="site-nav">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <Logo />
            <nav className="footer-nav">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              <Link href="/about/">このサイトについて・情報提供</Link>
            </nav>
            <p className="fine">
              当サイトはアフィリエイト広告を利用しています。周年の日付は公開情報をもとにしており、誤りを含む場合があります。
            </p>
            <p className="fine">© {SITE_NAME}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
