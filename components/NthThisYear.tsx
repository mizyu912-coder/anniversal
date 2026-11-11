"use client";
import { useEffect, useState } from "react";

/** 閲覧している年に何周年かを表示 */
export default function NthThisYear({ baseYear }: { baseYear: number }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => setN(new Date().getFullYear() - baseYear), [baseYear]);
  if (n === null || n < 1) return null;
  return <span className={`nth${n === 1 || n % 5 === 0 ? " milestone" : ""}`}>今年{n}周年</span>;
}
