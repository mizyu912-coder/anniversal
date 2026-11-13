/**
 * ローマ字検索用：かな→ローマ字変換と、ローマ字表記ゆれ（ヘボン式/訓令式など）の吸収。
 * 比較はどちらも訓令式寄りの「正規形」に揃えて行う（shi→si, chi→ti, tsu→tu, fu→hu, ji→zi など）。
 */
const BASE: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko", が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "si", す: "su", せ: "se", そ: "so", ざ: "za", じ: "zi", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "ti", つ: "tu", て: "te", と: "to", だ: "da", ぢ: "zi", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "hu", へ: "he", ほ: "ho", ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo", や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro", わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o", ゔ: "bu",
};
const SMALL_Y: Record<string, string> = { ゃ: "a", ゅ: "u", ょ: "o" };
const SMALL_V: Record<string, string> = { ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o" };

/** ひらがな（normalize済み）→ ローマ字正規形。かな以外の文字は英数字のみ残し、他は区切り「|」 */
export function kanaToRomaji(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];
    if (c === "っ") {
      const r = next ? kanaToRomaji(next) : "";
      if (/^[a-z]/.test(r) && !/^[aiueon]/.test(r)) out += r[0];
      continue;
    }
    const r = BASE[c];
    if (r !== undefined) {
      if (next && SMALL_Y[next] && r.endsWith("i") && r.length > 1) {
        out += r.slice(0, -1) + "y" + SMALL_Y[next]; // きゃ→kya, しゃ→sya
        i++;
      } else if (next && SMALL_V[next] && r.endsWith("i") && r.length > 1) {
        out += r.slice(0, -1) + "y" + SMALL_V[next]; // ちぇ→tye, しぇ→sye
        i++;
      } else if (next && SMALL_V[next] && /^(hu|bu|te|de|tu|u)$/.test(r)) {
        out += r.slice(0, -1).replace(/^u?$/, "w") + SMALL_V[next]; // ふぁ→fa相当(ha)、うぃ→wi
        i++;
      } else out += r;
    } else if (/[a-z0-9]/.test(c)) out += c;
    else out += "|";
  }
  return canonicalRomaji(out);
}

/** ローマ字の表記ゆれを正規形に揃える（入力側・データ側の両方に適用） */
export function canonicalRomaji(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9|]/g, "")
    .replace(/tch/g, "tty")
    .replace(/sh(?=[aiueo])/g, (m, i, all) => (all[i + 2] === "i" ? "s" : "sy"))
    .replace(/ch(?=[aiueo])/g, (m, i, all) => (all[i + 2] === "i" ? "t" : "ty"))
    .replace(/tsu/g, "tu")
    .replace(/f(?=[aiueo])/g, "h")
    .replace(/j(?=[aiueo])/g, (m, i, all) => (all[i + 1] === "i" ? "z" : "zy"))
    .replace(/m(?=[bpm])/g, "n")
    .replace(/nn/g, "n")
    .replace(/n'/g, "n")
    .replace(/(ou|oo)/g, "o")
    .replace(/uu/g, "u")
    .replace(/(aa|ii|ee)/g, (m) => m[0]);
}
