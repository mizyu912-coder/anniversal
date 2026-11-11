import type { Metadata } from "next";
import Link from "next/link";
import { FEATURE_YEARS } from "@/lib/site";
import { featureTitle, featureTypes } from "@/lib/feature";

export const metadata: Metadata = {
  title: "周年特集",
  description: "その年に10周年・20周年・30周年などの節目を迎える作品・ブランド・企業を種別ごとにまとめた特集。",
  alternates: { canonical: "/feature/" },
};

export default function FeatureIndex() {
  return (
    <>
      <h1>周年特集</h1>
      {FEATURE_YEARS.map((y) => (
        <section key={y} className="card">
          <h2>{y}年</h2>
          <ul className="grid">
            {featureTypes().map((t) => (
              <li key={t}>
                <Link href={`/feature/${y}/${t}/`}>{featureTitle(y, t)}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
