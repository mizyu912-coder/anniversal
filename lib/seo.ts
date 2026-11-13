import { SITE_NAME, SITE_URL } from "./site";

/** パンくずの1段。href なしは現在のページ */
export type Crumb = [label: string, href?: string];

export function breadcrumbLd(items: Crumb[]) {
  const all: Crumb[] = [["トップ", "/"], ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map(([name, href], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      ...(href ? { item: `${SITE_URL}${href}` } : {}),
    })),
  };
}

/** 一覧ページ用の ItemList（上位のみ） */
export function itemListLd(name: string, items: { name: string; href: string }[], limit = 30) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, limit).map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      url: `${SITE_URL}${x.href}`,
    })),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "アニバーサリーデータベース",
    url: `${SITE_URL}/`,
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** 西暦→和暦（明治以降） */
export function wareki(y: number): string {
  const eras: [number, string][] = [
    [2019, "令和"],
    [1989, "平成"],
    [1926, "昭和"],
    [1912, "大正"],
    [1868, "明治"],
  ];
  for (const [start, name] of eras) if (y >= start) return `${name}${y - start === 0 ? "元" : y - start + 1}年`;
  return "";
}
