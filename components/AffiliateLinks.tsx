import { AMAZON_TAG, RAKUTEN_AFF_ID } from "@/lib/site";

/** 関連商品へのアフィリエイトリンク。IDが未設定なら何も出さない */
export default function AffiliateLinks({ keyword }: { keyword: string }) {
  if (!AMAZON_TAG && !RAKUTEN_AFF_ID) return null;
  const q = encodeURIComponent(keyword);
  const rakutenSearch = `https://search.rakuten.co.jp/search/mall/${q}/`;
  return (
    <section className="card">
      <h2>
        関連商品を探す <span className="pr">PR</span>
      </h2>
      <div className="aff">
        {AMAZON_TAG && (
          <a className="btn amazon" href={`https://www.amazon.co.jp/s?k=${q}&tag=${AMAZON_TAG}`} rel="sponsored noopener" target="_blank">
            Amazonで探す
          </a>
        )}
        {RAKUTEN_AFF_ID && (
          <a
            className="btn rakuten"
            href={`https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFF_ID}/?pc=${encodeURIComponent(rakutenSearch)}`}
            rel="sponsored noopener"
            target="_blank"
          >
            楽天市場で探す
          </a>
        )}
      </div>
    </section>
  );
}
