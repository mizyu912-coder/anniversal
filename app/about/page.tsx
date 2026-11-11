import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて",
  alternates: { canonical: "/about/" },
};

const FORM_URL = process.env.NEXT_PUBLIC_REPORT_FORM_URL ?? "";

export default function About() {
  return (
    <>
      <h1>このサイトについて</h1>
      <section className="card">
        <h2>周年の数え方</h2>
        <p>
          連載開始・放送開始・発売・劇場公開・デビュー・設立などの日を起算日とし、その年の記念日に迎える周年を表示しています。1周年と5の倍数の周年を「節目」としています。
        </p>
      </section>
      <section className="card">
        <h2>データについて</h2>
        <p>
          起算日は公式発表や公開情報をもとに編集部が登録しています。各ページに出典を記載していますが、誤りを含む可能性があります。
        </p>
      </section>
      <section className="card">
        <h2>情報提供・誤りのご報告</h2>
        {FORM_URL ? (
          <p>
            未掲載の作品や誤りがありましたら、<a href={FORM_URL} target="_blank" rel="noopener">情報提供フォーム</a>からお知らせください。
          </p>
        ) : (
          <p className="muted">情報提供フォームは準備中です。</p>
        )}
      </section>
      <section className="card">
        <h2>広告について</h2>
        <p>当サイトはAmazonアソシエイト、楽天アフィリエイトなどのアフィリエイトプログラムに参加しています。</p>
      </section>
    </>
  );
}
