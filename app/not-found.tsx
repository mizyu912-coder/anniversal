import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>ページが見つかりません</h1>
      <p>
        <Link href="/">トップへ戻る</Link>
      </p>
    </>
  );
}
