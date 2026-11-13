// IndexNow（Bing・Yandex など）にサイトの更新を通知する。
// デプロイ後に GitHub Actions から実行： node scripts/indexnow.mjs out/sitemap.xml
// 個別ページ（/e/）は数が多いのでサイトマップに任せ、一覧・記事ページだけを送る。
import fs from "node:fs";

const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");
if (!SITE_URL) {
  console.log("SITE_URL が未設定なのでスキップ");
  process.exit(0);
}
const keyFile = fs.readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("public/ に IndexNow のキーファイルがありません");
const key = keyFile.replace(/\.txt$/, "");

const xml = fs.readFileSync(process.argv[2] || "out/sitemap.xml", "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.includes("/e/"));
const host = new URL(SITE_URL).host;

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${SITE_URL}/${keyFile}`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${urls.length}件を送信 → HTTP ${res.status}`);
// 失敗してもデプロイ自体は成功扱いにする
