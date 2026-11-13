export const ENTITY_TYPES = {
  manga: "漫画",
  anime: "アニメ",
  game: "ゲーム",
  movie: "映画",
  brand: "商品ブランド",
  musician: "ミュージシャン",
  company: "上場企業",
  character: "キャラクター",
} as const;
export type EntityType = keyof typeof ENTITY_TYPES;

/** 周年の起算日の種類 */
export const BASE_KINDS = {
  serialization: "連載開始",
  broadcast: "放送開始",
  release: "発売",
  premiere: "劇場公開",
  launch: "発売開始",
  debut: "デビュー",
  formation: "結成",
  origin: "創業",
  founding: "設立",
  listing: "上場",
  birthday: "誕生日",
} as const;
export type BaseKind = keyof typeof BASE_KINDS;

/** day=年月日 / month=年月 / year=年のみ / monthday=月日のみ（キャラ誕生日など） */
export type Precision = "day" | "month" | "year" | "monthday";

export interface Base {
  entityId: string;
  kind: BaseKind;
  year: number | null;
  month: number | null;
  day: number | null;
  precision: Precision;
  official: boolean;
  source: string;
  note: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  kana: string;
  aliases: string[];
  genre: string;
  parentId: string | null;
  officialUrl: string;
  wikidata: string;
  /** 知名度の目安（大きいほど有名。Wikidataのサイトリンク数、手作業登録は100） */
  pop: number;
  bases: Base[];
}

/** ある年に迎える1件の周年 */
export interface Anniversary {
  entityId: string;
  name: string;
  type: EntityType;
  kind: BaseKind;
  baseYear: number;
  month: number | null;
  day: number | null;
  n: number;
  milestone: boolean;
  pop: number;
}

/** 逆引き検索用インデックスの1件（クライアントに配信） */
export interface SearchItem {
  id: string;
  t: EntityType;
  name: string;
  keys: string;
  /** 知名度 */
  p: number;
  bases: { k: BaseKind; y: number | null; m: number | null; d: number | null }[];
}
