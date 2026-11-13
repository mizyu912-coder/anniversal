import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { FEATURE_YEARS, MILESTONES } from "@/lib/site";

const y0 = FEATURE_YEARS[0];
const y1 = FEATURE_YEARS[FEATURE_YEARS.length - 1];

export const metadata: Metadata = {
  title: `節目別の周年特集（10周年・30周年・50周年など）`,
  description: `${y0}〜${y1}年に10周年・20周年・30周年・50周年・100周年などの節目を迎える作品・ブランド・企業を、節目ごとにまとめています。`,
  alternates: { canonical: "/milestone/" },
};

export default function MilestoneIndex() {
  return (
    <article className="article">
      <Breadcrumb items={[["節目別の特集"]]} />
      <h1>節目別の周年特集</h1>
      <p className="article-lead">
        {y0}〜{y1}年に大きな節目を迎える作品・ブランド・企業を、周年の数ごとにまとめました。
      </p>
      <ul className="feature-grid">
        {MILESTONES.map((n) => (
          <li key={n}>
            <Link href={`/milestone/${n}/`}>
              <span className="feature-type">{n}周年</span>
              <span>{n}周年を迎える作品・ブランド・企業</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
