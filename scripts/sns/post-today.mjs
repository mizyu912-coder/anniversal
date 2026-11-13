// 毎朝「今日で○周年」を SNS に投稿する（GitHub Actions から実行）。
// 公開中サイトの /search-index.json を読むので、リポジトリのビルドは不要。
//
// 環境変数（GitHub の Secrets / Variables）
//   SITE_URL                         例 https://anniversary-db.jp
//   BSKY_HANDLE, BSKY_APP_PASSWORD   Bluesky（設定されていれば投稿）
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET   X（設定されていれば投稿）
//   DRY_RUN=true                     投稿せず本文を表示するだけ
import crypto from "node:crypto";

const SITE_URL = (process.env.SITE_URL || "https://anniversary-db.jp").replace(/\/$/, "");
const DRY_RUN = process.env.DRY_RUN === "true";

const KINDS = {
  serialization: "連載開始", broadcast: "放送開始", release: "発売", premiere: "劇場公開", launch: "発売開始",
  debut: "デビュー", formation: "結成", origin: "創業", founding: "設立", listing: "上場", birthday: "誕生日",
};
const isMilestone = (n) => n === 1 || n % 5 === 0;

// 日本時間の今日
const jst = new Date(Date.now() + 9 * 3600 * 1000);
const Y = jst.getUTCFullYear(), M = jst.getUTCMonth() + 1, D = jst.getUTCDate();
const dayUrl = `${SITE_URL}/today/${M}-${D}/`;

const index = await (await fetch(`${SITE_URL}/search-index.json`)).json();
const anniv = [], birthdays = [];
for (const i of index)
  for (const b of i.bases) {
    if (b.m !== M || b.d !== D) continue;
    if (b.k === "birthday") birthdays.push({ ...i, b });
    else if (b.y !== null && Y - b.y >= 1) anniv.push({ ...i, b, n: Y - b.y });
  }
anniv.sort((a, b) => Number(isMilestone(b.n)) - Number(isMilestone(a.n)) || b.p - a.p);
birthdays.sort((a, b) => b.p - a.p);
// 同じ作品が複数行に出ないように
const seen = new Set();
const picks = anniv.filter((a) => !seen.has(a.id) && seen.add(a.id));

if (!picks.length && !birthdays.length) {
  console.log("今日の記念日データがないので投稿しません");
  process.exit(0);
}

const tagOk = (s) => /^[\p{L}\p{N}ー・]+$/u.test(s) && s.length <= 20;
function compose(nAnniv, withBirthday, withTag) {
  const lines = [`【今日は何の日】${M}月${D}日`, ""];
  picks.slice(0, nAnniv).forEach((a, i) =>
    lines.push(`${i === 0 ? "◆" : "・"}${a.name} ${KINDS[a.b.k]}${a.n}周年（${a.b.y}年）`),
  );
  if (withBirthday && birthdays[0]) lines.push(`・${birthdays[0].name}の誕生日`);
  lines.push("", "ほかの記念日はこちら", dayUrl);
  const tags = ["#今日は何の日"];
  const head = picks[0];
  if (withTag && head && isMilestone(head.n) && tagOk(head.name)) tags.push(`#${head.name}${head.n}周年`);
  lines.push(tags.join(" "));
  return lines.join("\n");
}

// X の文字数（全角2・URLは23として280以内）
function xLength(text) {
  let len = 0;
  for (const part of text.split(/(https?:\/\/\S+)/)) {
    if (/^https?:\/\//.test(part)) len += 23;
    else for (const ch of part) len += /[\u0000-ჿ -‍‐-‟′-‷]/.test(ch) ? 1 : 2;
  }
  return len;
}
const graphemes = (s) => [...new Intl.Segmenter("ja", { granularity: "grapheme" }).segment(s)].length;

function fit(limit) {
  for (const [n, bd, tag] of [[3, true, true], [3, false, true], [2, false, true], [2, false, false], [1, false, false], [1, false, false]]) {
    const t = compose(n, bd, tag);
    if (limit(t)) return t;
  }
  return compose(1, false, false);
}
const xText = fit((t) => xLength(t) <= 280);
const bskyText = fit((t) => graphemes(t) <= 300);

// ---------- Bluesky ----------
async function postBluesky(text) {
  const { BSKY_HANDLE, BSKY_APP_PASSWORD } = process.env;
  if (!BSKY_HANDLE || !BSKY_APP_PASSWORD) return console.log("Bluesky: 未設定なのでスキップ");
  if (DRY_RUN) return console.log(`--- Bluesky（${graphemes(text)}字）---\n${text}\n`);
  const pds = "https://bsky.social/xrpc";
  const s = await (await fetch(`${pds}/com.atproto.server.createSession`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: BSKY_HANDLE, password: BSKY_APP_PASSWORD }),
  })).json();
  if (!s.accessJwt) throw new Error(`Bluesky ログイン失敗: ${JSON.stringify(s)}`);
  // リンクとハッシュタグは facets（バイト位置）で指定しないとクリックできない
  const enc = new TextEncoder();
  const byteIndex = (str, i) => enc.encode(str.slice(0, i)).length;
  const facets = [];
  for (const m of text.matchAll(/https?:\/\/\S+/g))
    facets.push({ index: { byteStart: byteIndex(text, m.index), byteEnd: byteIndex(text, m.index + m[0].length) }, features: [{ $type: "app.bsky.richtext.facet#link", uri: m[0] }] });
  for (const m of text.matchAll(/#([^\s#]+)/g))
    facets.push({ index: { byteStart: byteIndex(text, m.index), byteEnd: byteIndex(text, m.index + m[0].length) }, features: [{ $type: "app.bsky.richtext.facet#tag", tag: m[1] }] });
  const record = {
    $type: "app.bsky.feed.post", text, facets, langs: ["ja"], createdAt: new Date().toISOString(),
    embed: { $type: "app.bsky.embed.external", external: { uri: dayUrl, title: `${M}月${D}日は何の日？`, description: "この日に生まれた作品・キャラクター・企業｜ANNIVERSARY DATABASE" } },
  };
  const r = await fetch(`${pds}/com.atproto.repo.createRecord`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.accessJwt}` },
    body: JSON.stringify({ repo: s.did, collection: "app.bsky.feed.post", record }),
  });
  console.log(`Bluesky: HTTP ${r.status}`);
  if (!r.ok) throw new Error(await r.text());
}

// ---------- X（OAuth 1.0a） ----------
const pct = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
async function postX(text) {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) return console.log("X: 未設定なのでスキップ");
  if (DRY_RUN) return console.log(`--- X（${xLength(text)}/280）---\n${text}\n`);
  const url = "https://api.x.com/2/tweets";
  const oauth = {
    oauth_consumer_key: X_API_KEY, oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1", oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: X_ACCESS_TOKEN, oauth_version: "1.0",
  };
  const params = Object.keys(oauth).sort().map((k) => `${pct(k)}=${pct(oauth[k])}`).join("&");
  const baseString = ["POST", pct(url), pct(params)].join("&");
  oauth.oauth_signature = crypto.createHmac("sha1", `${pct(X_API_SECRET)}&${pct(X_ACCESS_SECRET)}`).update(baseString).digest("base64");
  const header = "OAuth " + Object.keys(oauth).sort().map((k) => `${pct(k)}="${pct(oauth[k])}"`).join(", ");
  const r = await fetch(url, { method: "POST", headers: { Authorization: header, "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  console.log(`X: HTTP ${r.status}`);
  if (!r.ok) throw new Error(await r.text());
}

// 片方が失敗してももう片方は投稿する
const results = await Promise.allSettled([postBluesky(bskyText), postX(xText)]);
const failed = results.filter((r) => r.status === "rejected");
for (const f of failed) console.error(f.reason);
if (!process.env.BSKY_HANDLE && !process.env.X_API_KEY) console.log(`--- 投稿文の例 ---\n${xText}`);
process.exit(failed.length ? 1 : 0);
