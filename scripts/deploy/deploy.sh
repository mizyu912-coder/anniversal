#!/usr/bin/env bash
# out/ をzip 1個にまとめてFTPSで送り、サーバー上のPHPで展開する。
# 1ファイルずつ送ると数時間かかるため（お名前.comのFTPは1ファイル数秒）。
# 必要な環境変数: FTP_SERVER FTP_USERNAME FTP_PASSWORD FTP_SERVER_DIR SITE_URL
set -euo pipefail
: "${FTP_SERVER:?}" "${FTP_USERNAME:?}" "${FTP_PASSWORD:?}" "${SITE_URL:?}"
DIR="${FTP_SERVER_DIR:-./}"; DIR="${DIR#./}"; DIR="${DIR#/}"; [ -n "$DIR" ] && DIR="${DIR%/}/"
HOST="$(echo "$SITE_URL" | sed -E 's#^https?://##; s#/.*$##')"
TOKEN="$(openssl rand -hex 24)"
ZIP="_deploy_${TOKEN:0:16}.zip"
PHP="_deploy_${TOKEN:16:16}.php"
WORK="$(mktemp -d)"

(cd out && zip -qr -9 "$WORK/$ZIP" .)
sed -e "s/__TOKEN__/$TOKEN/" -e "s/__ZIPNAME__/$ZIP/" "$(dirname "$0")/extract.php.tpl" > "$WORK/$PHP"
echo "zip: $(du -h "$WORK/$ZIP" | cut -f1), files: $(cd out && find . -type f | wc -l)"

upload() {
  curl -sS --fail --ssl-reqd --ftp-create-dirs --retry 3 --retry-delay 5 \
    --user "$FTP_USERNAME:$FTP_PASSWORD" -T "$1" "ftp://$FTP_SERVER/$DIR$(basename "$1")"
}
upload "$WORK/$ZIP"
upload "$WORK/$PHP"

# ネームサーバー反映前でも動くよう、Webサーバー（FTPサーバーと同じホスト）のIPを直接指定して呼ぶ
IP="$(getent ahostsv4 "$FTP_SERVER" | awk 'NR==1{print $1}')"
cleanup() {  # 失敗時はサーバーに残ったzipとPHPを消す
  curl -sS --ssl-reqd --user "$FTP_USERNAME:$FTP_PASSWORD" "ftp://$FTP_SERVER/$DIR" \
    -Q "-DELE $ZIP" -Q "-DELE $PHP" -o /dev/null || true
}
RES="$(curl -sS --max-time 600 --resolve "$HOST:80:$IP" "http://$HOST/$PHP?t=$TOKEN" || true)"
echo "server: $RES"
case "$RES" in OK*) ;; *) echo "展開に失敗しました" >&2; cleanup; exit 1 ;; esac
