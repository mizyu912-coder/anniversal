import type { MetadataRoute } from "next";
import { getEntities } from "@/lib/data";
import { FEATURE_YEARS, MILESTONES, SITE_URL, yearRange } from "@/lib/site";
import { featureTypes } from "@/lib/feature";
import { allDays, bornByYear, bornTypePairs, bornYears, dayParam } from "@/lib/pages";
import { ENTITY_TYPES } from "@/lib/types";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE_URL}${p}`;
  // ビルド日を更新日にする（毎月の再ビルドで「今年○周年」などが更新されるため）
  const lastModified = new Date();
  const pages = ["/", "/search/", "/feature/", "/calendar/", "/birthdays/", "/today/", "/born/", "/about/", "/privacy/"];
  for (const y of yearRange()) pages.push(`/year/${y}/`);
  for (let m = 1; m <= 12; m++) pages.push(`/calendar/${m}/`, `/birthdays/${m}/`);
  for (const y of FEATURE_YEARS) pages.push(`/matome/${y}/`);
  pages.push("/milestone/");
  for (const n of MILESTONES) pages.push(`/milestone/${n}/`);
  for (const y of FEATURE_YEARS) for (let m = 1; m <= 12; m++) pages.push(`/matome/${y}/${m}/`);
  for (const y of FEATURE_YEARS) for (const t of featureTypes()) pages.push(`/feature/${y}/${t}/`);
  for (const t of Object.keys(ENTITY_TYPES)) pages.push(`/type/${t}/`);
  for (const { month, day } of allDays()) pages.push(`/today/${dayParam(month, day)}/`);
  // 件数が少なく noindex にしている生まれ年ページは載せない
  for (const y of bornYears()) if ((bornByYear().get(y)?.length ?? 0) >= 5) pages.push(`/born/${y}/`);
  for (const p of bornTypePairs()) pages.push(`/born/${p.year}/${p.type}/`);
  for (const e of getEntities()) pages.push(`/e/${e.id}/`);
  return pages.map((p) => ({ url: u(p), lastModified }));
}
