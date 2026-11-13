import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import Logo from "@/components/Logo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}｜作品・ブランド・企業の周年データベース`, template: `%s｜${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, locale: "ja_JP", type: "website", images: ["/og.jpg"] },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  icons: { icon: "/icon.svg" },
  // Google Search Console の所有権確認（HTMLタグ方式の content 値）
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
};

/** Google アナリティクス 4 の測定ID（G-XXXXXXX）。未設定なら読み込まない */
// 測定ID は G-XXXXXXXXXX。「G-」を付け忘れて登録しても動くように補う
const GA_RAW = (process.env.NEXT_PUBLIC_GA_ID || "").trim();
const GA_ID = GA_RAW && !/^G-/i.test(GA_RAW) ? `G-${GA_RAW}` : GA_RAW;
// AdSense のサイト運営者ID（ca-pub-...）。設定するとサイト確認用のコードが入る（ads.txt は app/ads.txt で生成）
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

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
        <link rel="alternate" type="application/rss+xml" title={SITE_NAME} href="/feed.xml" />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        {ADSENSE_CLIENT && (
          <>
            <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" />
          </>
        )}
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
              <Link href="/today/">今日は何の日</Link>
              <Link href="/born/">生まれ年から探す</Link>
              <Link href="/milestone/">節目別の特集</Link>
              <Link href="/feed.xml">RSS</Link>
              <Link href="/about/">このサイトについて・情報提供</Link>
              <Link href="/privacy/">プライバシーポリシー</Link>
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
