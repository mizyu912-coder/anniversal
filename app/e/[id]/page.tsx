import type { Metadata } from "next";
import Link from "next/link";
import AffiliateLinks from "@/components/AffiliateLinks";
import Countdown from "@/components/Countdown";
import { getChildren, getEntities, getEntity, getSameYear } from "@/lib/data";
import { formatDate, isMilestone } from "@/lib/anniv";
import { BASE_KINDS, ENTITY_TYPES } from "@/lib/types";
import type { Entity } from "@/lib/types";
import { BUILD_YEAR, SITE_URL, YEAR_FROM, YEAR_TO } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return getEntities().map((e) => ({ id: e.id }));
}

function mainBase(e: Entity) {
  return e.bases.find((b) => b.kind !== "birthday" && b.year !== null) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getEntity((await params).id)!;
  const b = mainBase(e);
  const bd = e.bases.find((x) => x.kind === "birthday");
  const desc = b
    ? `${e.name}は${formatDate(b.year, b.month, b.day)}${BASE_KINDS[b.kind]}。${BUILD_YEAR}年で${BUILD_YEAR - b.year!}周年。今後の周年の年月日とカウントダウンを掲載。`
    : bd
      ? `${e.name}の誕生日は${formatDate(null, bd.month, bd.day)}。`
      : `${e.name}の周年情報。`;
  const title = e.type === "character" ? `${e.name}の誕生日はいつ？` : `${e.name}は何周年？周年はいつ？`;
  return { title, description: desc, alternates: { canonical: `/e/${e.id}/` } };
}

function jsonLd(e: Entity) {
  const b = mainBase(e);
  const typeMap: Record<string, string> = {
    company: "Organization",
    musician: "MusicGroup",
    brand: "Brand",
    character: "Thing",
    movie: "Movie",
    game: "VideoGame",
    anime: "TVSeries",
    manga: "CreativeWork",
  };
  const date = b && b.year ? [b.year, b.month, b.day].filter(Boolean).map((v, i) => (i ? String(v).padStart(2, "0") : v)).join("-") : undefined;
  return {
    "@context": "https://schema.org",
    "@type": typeMap[e.type],
    name: e.name,
    alternateName: e.aliases.length ? e.aliases : undefined,
    url: `${SITE_URL}/e/${e.id}/`,
    ...(date ? (e.type === "company" ? { foundingDate: date } : { datePublished: date }) : {}),
  };
}

export default async function EntityPage({ params }: Props) {
  const e = getEntity((await params).id)!;
  const parent = e.parentId ? getEntity(e.parentId) : undefined;
  const children = getChildren(e.id);
  const sameYear = getSameYear(e);
  const years = [];
  for (const b of e.bases) {
    if (b.year === null || b.kind === "birthday") continue;
    for (let y = BUILD_YEAR - 5; y <= BUILD_YEAR + 30; y++) {
      const n = y - b.year;
      if (n >= 1 && isMilestone(n)) years.push({ y, n, kind: b.kind, month: b.month, day: b.day });
    }
  }
  years.sort((a, b) => a.y - b.y);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(e)) }} />
      <p className="breadcrumb">
        <Link href="/">トップ</Link> › {ENTITY_TYPES[e.type]} › {e.name}
      </p>
      <h1>
        {e.name} <span className={`tag t-${e.type}`}>{ENTITY_TYPES[e.type]}</span>
      </h1>
      {e.bases
        .filter((b) => b.year !== null && b.kind !== "birthday")
        .map((b) => (
          <Countdown key={b.kind} year={b.year!} month={b.month} day={b.day} label={BASE_KINDS[b.kind]} />
        ))}

      {e.summary && (
        <section className="card intro">
          <h2>{e.type === "company" ? "企業紹介" : e.type === "musician" || e.type === "character" ? "プロフィール" : e.type === "brand" ? "ブランド紹介" : "作品紹介"}</h2>
          <p>{e.summary.text}</p>
          <p className="credit">
            出典：
            <a href={`https://ja.wikipedia.org/wiki/${encodeURIComponent(e.summary.title)}`} target="_blank" rel="noopener">
              Wikipedia「{e.summary.title}」
            </a>
            （
            <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja" target="_blank" rel="noopener license">
              CC BY-SA 4.0
            </a>
            ）
          </p>
        </section>
      )}

      <section className="card">
        <h2>基本情報</h2>
        <table className="facts">
          <tbody>
            {e.bases.map((b) => (
              <tr key={b.kind}>
                <th>{BASE_KINDS[b.kind]}</th>
                <td>
                  {formatDate(b.year, b.month, b.day)}
                  {b.note && <span className="muted">（{b.note}）</span>}
                  {b.source && (
                    <>
                      {" "}
                      <a href={b.source} target="_blank" rel="noopener" className="muted">
                        出典
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {e.genre && (
              <tr>
                <th>ジャンル</th>
                <td>{e.genre}</td>
              </tr>
            )}
            {e.aliases.length > 0 && (
              <tr>
                <th>別名</th>
                <td>{e.aliases.join("、")}</td>
              </tr>
            )}
            {parent && (
              <tr>
                <th>原作・関連</th>
                <td>
                  <Link href={`/e/${parent.id}/`}>{parent.name}</Link>
                </td>
              </tr>
            )}
            {e.officialUrl && (
              <tr>
                <th>公式サイト</th>
                <td>
                  <a href={e.officialUrl} target="_blank" rel="noopener">
                    {e.officialUrl}
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {years.length > 0 && (
        <section className="card">
          <h2>節目の周年一覧</h2>
          <ul className="anniv-list">
            {years.map((x) => (
              <li key={`${x.kind}-${x.y}`}>
                <span className="date">
                  {x.y >= YEAR_FROM && x.y <= YEAR_TO ? <Link href={`/year/${x.y}/`}>{x.y}年</Link> : `${x.y}年`}
                </span>
                <span className="nth milestone">{x.n}周年</span>
                <span className="name">
                  {BASE_KINDS[x.kind]}
                  {x.month ? `（${x.month}月${x.day ? `${x.day}日` : ""}）` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children.length > 0 && (
        <section className="card">
          <h2>関連する作品・キャラクター</h2>
          <ul className="grid">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={`/e/${c.id}/`}>
                  {c.name} <span className={`tag t-${c.type}`}>{ENTITY_TYPES[c.type]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sameYear && (
        <section className="card">
          <h2>{sameYear.year}年に生まれた作品・ブランド・企業</h2>
          <p className="muted small">{e.name}と同じ年に誕生し、同じタイミングで周年を迎えます。</p>
          <ul className="grid">
            {sameYear.list.map((c) => (
              <li key={c.id}>
                <Link href={`/e/${c.id}/`}>
                  {c.name} <span className={`tag t-${c.type}`}>{ENTITY_TYPES[c.type]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.type !== "company" && <AffiliateLinks keyword={(parent ?? e).name.replace(/（.*?）/g, "")} />}
    </>
  );
}
