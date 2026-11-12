export const SITE_NAME = "ANNIVERSARY DATABASE";
export const SITE_DESCRIPTION =
  "漫画・アニメ・ゲーム・映画・商品ブランド・ミュージシャン・上場企業が何年に何周年を迎えるかを検索できる周年データベース。";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "");

/** ビルド時点の年。年別ページの生成範囲の基準 */
export const BUILD_YEAR = new Date().getFullYear();
export const YEAR_FROM = 2020;
export const YEAR_TO = BUILD_YEAR + 10;
export const FEATURE_YEARS = [BUILD_YEAR, BUILD_YEAR + 1, BUILD_YEAR + 2, BUILD_YEAR + 3];

export function yearRange(): number[] {
  const ys: number[] = [];
  for (let y = YEAR_FROM; y <= YEAR_TO; y++) ys.push(y);
  return ys;
}

export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "";
export const RAKUTEN_AFF_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFF_ID || "";
