/** ファーストビューの背景：表彰式をイメージしたスポットライト・月桂冠・金の粒子（オリジナルのSVG） */
export default function HeroArt() {
  // 粒子の位置は固定値（ビルドごとに変わらないように）
  const sparkles = [
    [8, 18, 1.2], [15, 62, 0.8], [22, 35, 1], [30, 80, 0.7], [38, 12, 0.9], [46, 70, 1.1], [55, 25, 0.8],
    [62, 85, 1], [70, 40, 0.7], [78, 15, 1.2], [85, 65, 0.9], [92, 30, 1], [12, 88, 0.6], [50, 50, 0.6],
    [26, 55, 0.5], [74, 58, 0.5], [88, 88, 0.7], [5, 45, 0.6], [96, 52, 0.6], [42, 92, 0.5],
  ];
  // 月桂冠（左半分）：円弧に沿って外側・内側の葉を交互に配置
  const R = 86;
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (deg: number, r: number) => [+(Math.cos(rad(deg)) * r).toFixed(2), +(Math.sin(rad(deg)) * r).toFixed(2)];
  const [ax, ay] = pt(100, R);
  const [bx, by] = pt(245, R);
  const arc = `M${ax} ${ay} A ${R} ${R} 0 0 1 ${bx} ${by}`;
  const leaves: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const deg = 108 + i * 16;
    const tangent = deg + 90; // 先端（上）へ向かう方向
    const [ox, oy] = pt(deg, R + 8);
    const [ix, iy] = pt(deg + 6, R - 8);
    leaves.push([ox, oy, +(tangent - 28).toFixed(1)], [ix, iy, +(tangent + 28).toFixed(1)]);
  }
  return (
    <svg className="hero-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="hero-bg" cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor="#2a2418" />
          <stop offset="0.45" stopColor="#15151b" />
          <stop offset="1" stopColor="#0b0c10" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e7bf" stopOpacity="0.28" />
          <stop offset="1" stopColor="#f7e7bf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e3b3" />
          <stop offset="0.5" stopColor="#c9a45c" />
          <stop offset="1" stopColor="#7d5e27" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e9cf8f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#e9cf8f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#hero-bg)" />
      {/* スポットライト */}
      <polygon points="40,-10 90,-10 230,300 120,300" fill="url(#beam)" />
      <polygon points="310,-10 360,-10 280,300 170,300" fill="url(#beam)" />
      <polygon points="180,-10 220,-10 250,300 150,300" fill="url(#beam)" opacity="0.6" />
      <ellipse cx="200" cy="150" rx="120" ry="90" fill="url(#glow)" />
      {/* 月桂冠 */}
      <g opacity="0.42" transform="translate(200 150)">
        {[-1, 1].map((side) => (
          <g key={side} transform={`scale(${side} 1)`}>
            <path d={arc} fill="none" stroke="url(#hero-gold)" strokeWidth="1.6" />
            {leaves.map(([x, y, rot], i) => (
              <ellipse key={i} cx={x} cy={y} rx="11" ry="4.2" fill="url(#hero-gold)" transform={`rotate(${rot} ${x} ${y})`} />
            ))}
          </g>
        ))}
        <path d="M0 -22 l5.5 11.5 12.5 1.5 -9.5 8.5 2.5 12.5 -11 -6.5 -11 6.5 2.5 -12.5 -9.5 -8.5 12.5 -1.5z" fill="url(#hero-gold)" opacity="0.9" />
      </g>
      {/* 金の粒子 */}
      {sparkles.map(([x, y, r], i) => (
        <circle key={i} cx={x * 4} cy={y * 3} r={r * 1.6} fill="#e9cf8f" opacity={0.25 + (i % 4) * 0.15} />
      ))}
      <rect width="400" height="300" fill="url(#hero-bg)" opacity="0.25" />
    </svg>
  );
}
