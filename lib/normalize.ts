/** 検索用の正規化: 全角半角・大小文字・カタカナ/ひらがな・記号のゆれを吸収 */
export function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・\-ー'’.。、,!！?？「」（）()]/g, "");
}
