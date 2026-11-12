<?php
// デプロイ用の一時スクリプト。GitHub Actions が実行ごとに乱数トークン入りで生成・アップロードし、
// 呼び出し後に自分自身とzipを削除する。
if (!hash_equals('__TOKEN__', (string)($_GET['t'] ?? ''))) { http_response_code(404); exit; }
@set_time_limit(600);
$root = __DIR__;
$zipPath = $root . '/__ZIPNAME__';
$finish = function ($code, $msg) use ($zipPath) { @unlink($zipPath); @unlink(__FILE__); http_response_code($code); echo $msg; exit; };
if (!class_exists('ZipArchive')) $finish(500, 'NG ZipArchive is not available');
$zip = new ZipArchive();
if ($zip->open($zipPath) !== true) $finish(500, 'NG cannot open zip');
$keep = [];
for ($i = 0; $i < $zip->numFiles; $i++) $keep[rtrim($zip->getNameIndex($i), '/')] = true;
if (!$zip->extractTo($root)) { $zip->close(); $finish(500, 'NG extract failed'); }
$zip->close();
// サイトが生成するフォルダの中で、今回のzipに無い古いファイルを削除する
$removed = 0;
foreach (['e', 'year', 'feature', 'calendar', 'birthdays', 'search', 'about', '_next'] as $dir) {
  $base = "$root/$dir";
  if (!is_dir($base)) continue;
  $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
  foreach ($it as $f) {
    $rel = substr($f->getPathname(), strlen($root) + 1);
    if (isset($keep[$rel])) continue;
    if ($f->isDir()) { if (count(scandir($f->getPathname())) === 2 && @rmdir($f->getPathname())) $removed++; }
    elseif (@unlink($f->getPathname())) $removed++;
  }
}
$finish(200, 'OK files=' . count($keep) . ' removed=' . $removed);
