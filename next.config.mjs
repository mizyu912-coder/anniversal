/** @type {import('next').NextConfig} */
const nextConfig = {
  // 全ページを静的HTMLとして out/ に書き出す（レンタルサーバーに置くだけで動く）
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
