import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー・免責事項",
  alternates: { canonical: "/privacy/" },
};

const FORM_URL = process.env.NEXT_PUBLIC_REPORT_FORM_URL || "";
const UPDATED = "2026年11月13日";

export default function Privacy() {
  return (
    <article className="article policy">
      <h1>プライバシーポリシー・免責事項</h1>
      <p className="muted">制定日：{UPDATED}</p>

      <section className="card">
        <h2>個人情報の取り扱い</h2>
        <p>
          {SITE_NAME}（以下「当サイト」）は、お問い合わせフォームなどでお名前・メールアドレス等の個人情報をご提供いただいた場合、お問い合わせへの回答や必要なご連絡のためにのみ利用し、法令に基づく場合を除き、ご本人の同意なく第三者に提供しません。
        </p>
      </section>

      <section className="card">
        <h2>アクセス解析ツールについて</h2>
        <p>
          当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用することがあります。Googleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
          Cookieを無効にすることで収集を拒否できますので、お使いのブラウザの設定をご確認ください。詳しくは
          <a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener">
            Googleアナリティクス利用規約
          </a>
          および
          <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener">
            Googleのポリシーと規約
          </a>
          をご覧ください。
        </p>
      </section>

      <section className="card">
        <h2>広告の配信について</h2>
        <p>
          当サイトでは、第三者配信の広告サービス（Google アドセンス等）を利用することがあります。広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。Cookieを使用することで、当サイトや他のサイトへの過去のアクセス情報に基づいて広告を配信できるようになります。
        </p>
        <p>
          パーソナライズ広告は
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener">
            Googleの広告設定
          </a>
          で無効にできます。また、
          <a href="https://www.aboutads.info/" target="_blank" rel="noopener">
            www.aboutads.info
          </a>
          から第三者配信事業者のCookieを無効にすることもできます。
        </p>
      </section>

      <section className="card">
        <h2>アフィリエイトプログラムについて</h2>
        <p>
          当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。また、楽天アフィリエイトなどのアフィリエイトプログラムに参加しています。
        </p>
      </section>

      <section className="card">
        <h2>掲載情報・引用について</h2>
        <p>
          周年の起算日は、公式発表や公開情報（Wikidataなど）をもとに掲載していますが、正確性・完全性を保証するものではありません。作品紹介の文章は、Wikipedia日本語版の記事の冒頭を
          <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja" target="_blank" rel="noopener license">
            クリエイティブ・コモンズ 表示-継承 4.0
          </a>
          に基づいて掲載しており、各ページに出典を記載しています。
        </p>
        <p>作品名・商品名・企業名などは、各権利者の商標または登録商標です。</p>
      </section>

      <section className="card">
        <h2>免責事項</h2>
        <p>
          当サイトの情報を利用したことにより生じたいかなる損害についても、当サイトは責任を負いかねます。リンク先の外部サイトで提供される情報・サービスについても責任を負いません。掲載内容は予告なく変更・削除することがあります。
        </p>
      </section>

      <section className="card">
        <h2>お問い合わせ</h2>
        {FORM_URL ? (
          <p>
            当サイトへのお問い合わせ、掲載内容の誤りのご報告は
            <a href={FORM_URL} target="_blank" rel="noopener">
              お問い合わせフォーム
            </a>
            からお願いします。
          </p>
        ) : (
          <p>
            お問い合わせ先は<Link href="/about/">このサイトについて</Link>をご覧ください。
          </p>
        )}
      </section>

      <section className="card">
        <h2>プライバシーポリシーの変更</h2>
        <p>当サイトは、法令の変更や必要に応じて、本ポリシーを予告なく変更することがあります。変更後の内容は本ページに掲載した時点から有効となります。</p>
      </section>
    </article>
  );
}
