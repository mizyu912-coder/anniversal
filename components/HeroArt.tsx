/**
 * ファーストビューの背景：赤いカーテンとレッドカーペットの授賞式ステージ（オリジナルのSVG）。
 * 重くなりすぎないよう、明るめの赤・金・紙吹雪で華やかさを出す。
 */
export default function HeroArt() {
  // 紙吹雪（位置は固定値：ビルドごとに変わらないように）
  const confetti: [number, number, number, string][] = [
    [6, 20, 20, "#f3d58a"], [14, 58, -30, "#fff4dc"], [21, 34, 45, "#f6b8b8"], [29, 76, 10, "#f3d58a"],
    [36, 14, -15, "#fff4dc"], [44, 66, 60, "#f3d58a"], [52, 26, -40, "#f6b8b8"], [59, 84, 25, "#fff4dc"],
    [66, 40, -55, "#f3d58a"], [73, 12, 35, "#f6b8b8"], [80, 62, -20, "#f3d58a"], [88, 30, 50, "#fff4dc"],
    [94, 78, -35, "#f3d58a"], [10, 90, 15, "#f6b8b8"], [48, 46, 70, "#fff4dc"], [62, 6, -10, "#f3d58a"],
    [33, 50, 30, "#f3d58a"], [77, 88, -60, "#fff4dc"], [18, 8, 5, "#f3d58a"], [92, 50, 20, "#f6b8b8"],
  ];
  // カーテンのひだ（左側。右側はCSSで反転）
  const folds = [0, 14, 28, 42, 56, 70, 84];
  return (
    <div className="hero-art" aria-hidden="true">
      <svg className="stage" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="wall" cx="50%" cy="28%" r="80%">
            <stop offset="0" stopColor="#c8424a" />
            <stop offset="0.5" stopColor="#8f1d29" />
            <stop offset="1" stopColor="#4f0b14" />
          </radialGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff2d2" stopOpacity="0.32" />
            <stop offset="1" stopColor="#fff2d2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="carpet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a3121f" />
            <stop offset="1" stopColor="#d8222f" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#wall)" />
        {/* スポットライト */}
        <polygon points="70,-10 110,-10 240,300 130,300" fill="url(#beam)" />
        <polygon points="290,-10 330,-10 270,300 160,300" fill="url(#beam)" />
        {/* ステージの床とレッドカーペット */}
        <rect y="168" width="400" height="132" fill="#3a0910" opacity="0.22" />
        <polygon points="176,168 224,168 330,300 70,300" fill="url(#carpet)" />
        <polyline points="176,168 70,300" fill="none" stroke="#e8c674" strokeWidth="1.2" opacity="0.8" />
        <polyline points="224,168 330,300" fill="none" stroke="#e8c674" strokeWidth="1.2" opacity="0.8" />
        {/* ポールとロープ */}
        {[[120, 230], [280, 230], [92, 270], [308, 270]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 1.6} y={y - 26} width="3.2" height="26" fill="#e3c27a" />
            <circle cx={x} cy={y - 27} r="3.2" fill="#f3d58a" />
            <ellipse cx={x} cy={y} rx="6" ry="2" fill="#c9a24f" />
          </g>
        ))}
        <path d="M120 206 Q 106 232 92 245" fill="none" stroke="#e8c674" strokeWidth="1.6" />
        <path d="M280 206 Q 294 232 308 245" fill="none" stroke="#e8c674" strokeWidth="1.6" />
        {/* 紙吹雪 */}
        {confetti.map(([x, y, r, c], i) => (
          <rect key={i} x={x * 4} y={y * 3} width={i % 3 === 0 ? 5 : 3.5} height={i % 3 === 0 ? 2.4 : 6} rx="0.8" fill={c} opacity="0.85" transform={`rotate(${r} ${x * 4} ${y * 3})`} />
        ))}
      </svg>

      {/* 左右のカーテン */}
      {["l", "r"].map((side) => (
        <svg key={side} className={`curtain curtain-${side}`} viewBox="0 0 100 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`fold-${side}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8a0f1b" />
              <stop offset="0.45" stopColor="#e2404a" />
              <stop offset="1" stopColor="#a8141f" />
            </linearGradient>
          </defs>
          <path d="M0 0 H100 C 92 120, 60 190, 46 230 C 60 290, 76 350, 84 400 H0 Z" fill={`url(#fold-${side})`} />
          {folds.map((x, i) => {
            const top = x + 7;
            const mid = 14 + i * 5;
            const bot = 6 + i * 11;
            const d = `M${top} 0 C ${top} 120, ${mid + 4} 190, ${mid} 228 C ${mid + 2} 290, ${bot - 2} 350, ${bot} 400`;
            return (
              <g key={x}>
                <path d={d} fill="none" stroke="#ff7b7f" strokeOpacity="0.35" strokeWidth="5" />
                <path d={d} fill="none" stroke="#5e0711" strokeOpacity="0.35" strokeWidth="3" transform="translate(6 0)" />
              </g>
            );
          })}
          {/* タッセル（金の留め紐） */}
          <path d="M0 222 Q 30 236 54 226" fill="none" stroke="#f0cf7e" strokeWidth="5" strokeLinecap="round" />
          <circle cx="54" cy="227" r="5" fill="#f3d58a" />
          <path d="M50 231 l-3 22 h14 l-3 -22 z" fill="#e3bb63" />
        </svg>
      ))}

      {/* 上部のバランス（幕） */}
      <svg className="valance" viewBox="0 0 400 30" preserveAspectRatio="none">
        <rect width="400" height="12" fill="#a8141f" />
        <path d={"M0 12 " + Array.from({ length: 10 }, (_, i) => `Q ${i * 40 + 20} 30 ${i * 40 + 40} 12`).join(" ") + " V0 H0 Z"} fill="#c51f2c" />
        <path d={"M0 12 " + Array.from({ length: 10 }, (_, i) => `Q ${i * 40 + 20} 30 ${i * 40 + 40} 12`).join(" ")} fill="none" stroke="#f0cf7e" strokeWidth="1.6" />
      </svg>
    </div>
  );
}
