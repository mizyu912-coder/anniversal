import { getEntities } from "@/lib/data";
import { anniversariesInYear, sortByPop } from "@/lib/anniv";
import { BUILD_YEAR, FEATURE_YEARS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS：月別まとめ・年別まとめの記事（ビルド時点で公開済みのもの） */
export function GET() {
  const now = new Date();
  const entities = getEntities();
  const items: { title: string; link: string; date: Date; desc: string }[] = [];
  // 月別まとめは前月1日に公開した扱い（ビルド時点から3か月先まで）
  for (let i = -2; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear(), m = d.getMonth() + 1;
    if (!FEATURE_YEARS.includes(y)) continue;
    const pub = new Date(y, m - 2, 1);
    if (pub > now) continue;
    const top = sortByPop(anniversariesInYear(entities, y).filter((a) => a.month === m && a.n >= 10 && a.n % 5 === 0)).slice(0, 3);
    items.push({
      title: `${y}年${m}月に周年を迎える作品・ブランド・企業`,
      link: `${SITE_URL}/matome/${y}/${m}/`,
      date: pub,
      desc: top.map((a) => `${a.name}が${a.n}周年`).join("、"),
    });
  }
  for (const y of [BUILD_YEAR, BUILD_YEAR + 1]) {
    const top = sortByPop(anniversariesInYear(entities, y).filter((a) => a.n >= 10 && a.n % 5 === 0)).slice(0, 3);
    items.push({
      title: `${y}年に周年を迎える作品・ブランド・企業まとめ`,
      link: `${SITE_URL}/matome/${y}/`,
      date: new Date(y - 1, 10, 1),
      desc: top.map((a) => `${a.name}が${a.n}周年`).join("、"),
    });
  }
  items.sort((a, b) => +b.date - +a.date);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(SITE_NAME)}</title>
<link>${SITE_URL}/</link>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
<description>${esc(SITE_DESCRIPTION)}</description>
<language>ja</language>
<lastBuildDate>${now.toUTCString()}</lastBuildDate>
${items
  .map(
    (i) => `<item>
<title>${esc(i.title)}</title>
<link>${i.link}</link>
<guid isPermaLink="true">${i.link}</guid>
<pubDate>${i.date.toUTCString()}</pubDate>
<description>${esc(i.desc)}</description>
</item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
