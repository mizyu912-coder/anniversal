import { ENTITY_TYPES } from "./types";
import type { EntityType } from "./types";

/** 特集ページを作る種別（キャラクターは誕生日ページで扱う） */
export function featureTypes(): EntityType[] {
  return (Object.keys(ENTITY_TYPES) as EntityType[]).filter((t) => t !== "character");
}

export function featureTitle(year: number, type: EntityType): string {
  const label = type === "company" ? "上場企業" : ENTITY_TYPES[type];
  return `${year}年に周年を迎える${label}一覧`;
}
