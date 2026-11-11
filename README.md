# アニバーサル（周年検索サイト）

漫画・アニメ・ゲーム・映画・商品ブランド・ミュージシャン・上場企業が、何年に何周年を迎えるかを検索できるサイトです。

## 主な機能

| ページ | URL |
| --- | --- |
| 年別の周年検索（種別・月・節目で絞り込み、CSV保存） | `/year/2027/` |
| 逆引き検索（名前から次の節目周年を表示） | `/search/?q=ガンダム` |
| 個別ページ（起算日・出典・節目一覧・カウントダウン・関連商品） | `/e/gundam/` |
| 周年カレンダー（月別の記念日） | `/calendar/4/` |
| キャラクター誕生日 | `/birthdays/5/` |
| 特集（その年に周年を迎える○○一覧） | `/feature/2027/anime/` |

全ページを静的HTMLとして `out/` に書き出すので、レンタルサーバーに置くだけで動きます。

## データの追加・修正

データは `data/` のCSV 2つだけです。GitHub上で直接編集できます。

**data/entities.csv**（作品・キャラ・ブランド・企業など）

| 列 | 内容 |
| --- | --- |
| id | URLになる半角英小文字ID（例 `onepiece`） |
| type | `manga` `anime` `game` `movie` `brand` `musician` `company` `character` |
| name / kana | 名称 / よみ（ひらがな） |
| aliases | 別名・略称。複数は `;` 区切り |
| genre | ジャンル |
| parent_id | 原作やキャラの所属作品のid |
| official_url | 公式サイト |

**data/bases.csv**（周年の起算日。1つの実体に複数持てます）

| 列 | 内容 |
| --- | --- |
| entity_id | entities.csv の id |
| kind | `serialization`連載開始 `broadcast`放送開始 `release`発売 `premiere`劇場公開 `launch`発売開始 `debut`デビュー `origin`創業 `founding`設立 `listing`上場 `birthday`誕生日 |
| date / precision | `1997-07-22`/`day`、`1969-12`/`month`、`1974`/`year`、誕生日など年なしは `--05-05`/`monthday` |
| official | 公式出典なら `true` |
| source / note | 出典URL / 補足 |

編集後は `npm run check:data` で形式をチェックできます（GitHub上でも自動で走ります）。

> 現在のデータ50件は動作確認用のサンプルです。Wikipediaの記載をもとにしているため、公開前に公式情報で確認してください。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # out/ に静的サイトを出力
```

## お名前ドットコム レンタルサーバーへの自動デプロイ

`main` に変更が入るたびに、GitHub Actions がビルドしてFTPSでアップロードします（毎月1日にも自動で再ビルド）。

GitHubのリポジトリ設定 → Secrets and variables → Actions で以下を登録してください。

**Secrets**

| 名前 | 値 |
| --- | --- |
| FTP_SERVER | FTPサーバー名（コントロールパネルのFTP情報） |
| FTP_USERNAME | FTPユーザー名 |
| FTP_PASSWORD | FTPパスワード |
| FTP_SERVER_DIR | アップロード先ディレクトリ（例 `/public_html/example.com/`、末尾は `/`） |

**Variables**

| 名前 | 値 |
| --- | --- |
| DEPLOY_ENABLED | `true`（これを設定するまでデプロイは行いません） |
| SITE_URL | `https://example.com` のような本番URL（sitemap・canonicalに使用） |
| AMAZON_TAG | AmazonアソシエイトのトラッキングID（任意） |
| RAKUTEN_AFF_ID | 楽天アフィリエイトID（任意） |
| REPORT_FORM_URL | 情報提供用のGoogleフォームURL（任意） |
