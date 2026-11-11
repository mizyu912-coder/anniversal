import type { Metadata } from "next";
import SearchClient from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "周年の逆引き検索",
  description: "作品名・キャラクター名・ブランド名・企業名から、次に何周年を迎えるのか、いつ迎えるのかを調べられます。",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return (
    <>
      <h1>周年の逆引き検索</h1>
      <p className="lead">名前を入力すると、起算日と次の節目周年を表示します。ひらがな・カタカナ・略称でも検索できます。</p>
      <SearchClient />
    </>
  );
}
