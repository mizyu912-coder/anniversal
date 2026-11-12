/** @type {import('next').NextConfig} */
const nextConfig = {
  // 全ページを静的HTMLとして out/ に書き出す（レンタルサーバーに置くだけで動く）
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // ビルドIDを固定し、内容が変わっていないページは毎回同じHTMLになるようにする
  // （FTPアップロードで変更のあったファイルだけを送るため）
  generateBuildId: async () => "anniversal",
};
export default nextConfig;
