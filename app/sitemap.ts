import type { MetadataRoute } from "next";
import { getEntities } from "@/lib/data";
import { FEATURE_YEARS, MILESTONES, SITE_URL, yearRange } from "@/lib/site";
import { featureTypes } from "@/lib/feature";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${SITE_URL}${p}`;
  const pages = ["/", "/search/", "/feature/", "/calendar/", "/birthdays/", "/about/", "/privacy/"];
  for (const y of yearRange()) pages.push(`/year/${y}/`);
  for (let m = 1; m <= 12; m++) pages.push(`/calendar/${m}/`, `/birthdays/${m}/`);
  for (const y of FEATURE_YEARS) pages.push(`/matome/${y}/`);
  pages.push("/milestone/");
  for (const n of MILESTONES) pages.push(`/milestone/${n}/`);
  for (const y of FEATURE_YEARS) for (let m = 1; m <= 12; m++) pages.push(`/matome/${y}/${m}/`);
  for (const y of FEATURE_YEARS) for (const t of featureTypes()) pages.push(`/feature/${y}/${t}/`);
  for (const e of getEntities()) pages.push(`/e/${e.id}/`);
  return pages.map((p) => ({ url: u(p) }));
}
