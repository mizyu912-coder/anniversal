import Link from "next/link";
import { Fragment } from "react";
import JsonLd from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import type { Crumb } from "@/lib/seo";

/** 見た目のパンくず＋構造化データ（BreadcrumbList）。先頭の「トップ」は自動で付く */
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbLd(items)} />
      <p className="breadcrumb">
        <Link href="/">トップ</Link>
        {items.map(([label, href], i) => (
          <Fragment key={i}>
            {" › "}
            {href ? <Link href={href}>{label}</Link> : label}
          </Fragment>
        ))}
      </p>
    </>
  );
}
