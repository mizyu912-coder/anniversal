// データCSVの簡易チェック: 必須項目・日付形式・参照切れ・ID重複
import fs from "node:fs";
import Papa from "papaparse";

const read = (f) => Papa.parse(fs.readFileSync(`data/${f}`, "utf8"), { header: true, skipEmptyLines: true });
const TYPES = ["manga", "anime", "game", "movie", "brand", "musician", "company", "character"];
const KINDS = ["serialization", "broadcast", "release", "premiere", "launch", "debut", "origin", "founding", "listing", "birthday"];
const DATE = { day: /^\d{4}-\d{2}-\d{2}$/, month: /^\d{4}-\d{2}$/, year: /^\d{4}$/, monthday: /^--\d{2}-\d{2}$/ };
const errors = [];

const ents = read("entities.csv");
const ids = new Set();
ents.data.forEach((r, i) => {
  const at = `entities.csv ${i + 2}行目`;
  if (!/^[a-z0-9-]+$/.test(r.id ?? "")) errors.push(`${at}: idは半角英小文字・数字・ハイフンのみ (${r.id})`);
  if (ids.has(r.id)) errors.push(`${at}: idが重複 (${r.id})`);
  ids.add(r.id);
  if (!TYPES.includes(r.type)) errors.push(`${at}: typeが不正 (${r.type})`);
  if (!r.name) errors.push(`${at}: nameが空`);
});
ents.data.forEach((r, i) => {
  if (r.parent_id && !ids.has(r.parent_id)) errors.push(`entities.csv ${i + 2}行目: parent_idが未登録 (${r.parent_id})`);
});
read("bases.csv").data.forEach((r, i) => {
  const at = `bases.csv ${i + 2}行目`;
  if (!ids.has(r.entity_id)) errors.push(`${at}: entity_idが未登録 (${r.entity_id})`);
  if (!KINDS.includes(r.kind)) errors.push(`${at}: kindが不正 (${r.kind})`);
  if (!DATE[r.precision]) errors.push(`${at}: precisionが不正 (${r.precision})`);
  else if (!DATE[r.precision].test(r.date)) errors.push(`${at}: dateが precision=${r.precision} の形式と合わない (${r.date})`);
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${ents.data.length}件`);
