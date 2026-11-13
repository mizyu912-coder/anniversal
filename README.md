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
| 今日は何の日（日別・366ページ） | `/today/11-13/` |
| 生まれ年から探す（年別・年×種別） | `/born/1995/`、`/born/1995/anime/` |
| 種別一覧（人気順） | `/type/anime/` |
| RSS（まとめ記事） | `/feed.xml` |

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

`data/entities.csv` と `data/bases.csv` は手作業で登録するデータです。現在の50件はWikipediaの記載をもとにしたサンプルなので、公開前に公式情報で確認してください。

## Wikidataからの自動取り込み

`data/import/` には Wikidata から自動で取り込んだデータ（約8,500件）が入っています。手作業データと同じ名前・種別のものは取り込まず、手作業側が優先されます。

| 種別 | 起算日 | 主な条件 |
| --- | --- | --- |
| 漫画 | 連載開始（なければ初出） | 日本の漫画 |
| アニメ | 放送開始 | 日本のテレビアニメ |
| ゲーム | 発売日（最も早いもの） | 日本のビデオゲーム |
| 映画 | 公開日（最も早いもの） | 日本の日本語作品 |
| ミュージシャン | グループは結成、ソロは活動開始 | 日本のグループ・日本語の歌手 |
| 上場企業 | 設立 | 東証上場の日本企業 |

いずれも他言語版Wikipediaのリンク数で知名度の低いものを除いています。

- 毎月2日に GitHub Actions（Import data from Wikidata）が取り込み直し、差分をプルリクエストにします。Actions タブから手動でも実行できます。自動でプルリクエストを作るには、リポジトリ設定 → Actions → General の「Allow GitHub Actions to create and approve pull requests」をオンにしてください。
- 取り込みたくないものは `data/import/excluded.txt` にQ番号を追加します。
- 取り込みデータの日付を直したいときは、`data/entities.csv` に同じ名前・種別で登録し直すと手作業データが優先されます。

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # out/ に静的サイトを出力
```

## お名前ドットコム レンタルサーバーへの自動デプロイ

`main` に変更が入るたびに、GitHub Actions がビルドしてアップロードします（毎月1日にも自動で再ビルド）。

サイト全体（約8,600ファイル）をzip 1個にまとめてFTPSで送り、サーバー上の使い捨てPHPスクリプトで展開します。お名前.comのFTPは1ファイルの送信に数秒かかり、1ファイルずつでは数時間かかるためです。PHPスクリプトは実行ごとに乱数のトークン付きで作られ、展開後に自分自身とzipを削除します（`scripts/deploy/`）。

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

## 流入のための自動処理

- **IndexNow**：デプロイ後に一覧・記事ページのURLを Bing などへ通知します（キーは `public/` の英数字32桁の `.txt`）。
- **SNS自動投稿**（`.github/workflows/sns.yml`）：毎朝8時（日本時間）に「今日で○周年」を投稿します。
  - Bluesky：Secrets に `BSKY_HANDLE`（例 `anniversary-db.bsky.social`）と `BSKY_APP_PASSWORD`（設定 → プライバシーとセキュリティ → アプリパスワード）
  - X：Secrets に `X_API_KEY` `X_API_SECRET` `X_ACCESS_TOKEN` `X_ACCESS_SECRET`（developer.x.com で作るアプリの Read and Write 権限のキー）
  - Variables に `SNS_ENABLED` = `true` を登録すると毎朝の自動投稿が始まります。Actions タブの「Post today's anniversaries to SNS」から手動実行すると、投稿せずに本文だけ確認できます。
