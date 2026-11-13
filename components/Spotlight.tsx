import Link from "next/link";

export type SpotItem = { key: string; href: string; big: string; unit: string; name: string; tag: string; meta: string };

/** 注目の周年・誕生日などをステージ風の2カラムカードで見せる */
export default function Spotlight({ title, items, en = "SPOTLIGHT" }: { title: string; items: SpotItem[]; en?: string }) {
  if (!items.length) return null;
  return (
    <section className="spotlight">
      <header className="spotlight-head">
        <span className="spotlight-en">{en}</span>
        <h2>{title}</h2>
      </header>
      <ol className="spotlight-grid">
        {items.map((x, i) => (
          <li key={x.key}>
            <Link href={x.href} className="spot-card">
              <span className="spot-rank">{String(i + 1).padStart(2, "0")}</span>
              <span className="spot-nth">
                <b className={x.big.length > 3 ? "long" : undefined}>{x.big}</b>
                {x.unit}
              </span>
              <span className="spot-body">
                <span className="spot-name">{x.name}</span>
                <span className="spot-meta">
                  {x.tag && <span className="spot-tag">{x.tag}</span>}
                  {x.meta}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
