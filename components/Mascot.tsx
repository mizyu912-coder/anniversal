/** マスコット「アニバーサル」のサル：シルクハットと蝶ネクタイで、金の星を掲げてお祝いする（オリジナル） */
export default function Mascot({ className }: { className?: string }) {
  const fur = "#8a5634";
  const furDark = "#6b3f22";
  const skin = "#f6d3ac";
  return (
    <svg className={className} viewBox="0 0 200 230" role="img" aria-label="アニバーサルのマスコット（お祝いするサル）">
      <defs>
        <linearGradient id="m-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0be" />
          <stop offset="0.5" stopColor="#e9c264" />
          <stop offset="1" stopColor="#b88a2e" />
        </linearGradient>
      </defs>
      {/* しっぽ */}
      <path d="M128 196 C 160 206, 182 186, 172 166 C 166 154, 150 160, 156 170" fill="none" stroke={furDark} strokeWidth="7" strokeLinecap="round" />
      {/* 体 */}
      <ellipse cx="100" cy="172" rx="36" ry="40" fill={fur} />
      <ellipse cx="100" cy="180" rx="23" ry="27" fill={skin} />
      {/* 足 */}
      <ellipse cx="82" cy="210" rx="15" ry="9" fill={furDark} />
      <ellipse cx="118" cy="210" rx="15" ry="9" fill={furDark} />
      {/* 左腕（手を振る） */}
      <path d="M70 156 C 54 160, 46 176, 50 190" fill="none" stroke={fur} strokeWidth="14" strokeLinecap="round" />
      <circle cx="50" cy="192" r="8" fill={skin} />
      {/* 右腕（星を掲げる） */}
      <path d="M128 152 C 146 142, 154 124, 156 108" fill="none" stroke={fur} strokeWidth="14" strokeLinecap="round" />
      <circle cx="156" cy="106" r="8" fill={skin} />
      <path d="M160 64 l7.5 15.5 17 2.2 -12.4 11.8 3 16.8 -15.1 -8.2 -15.1 8.2 3 -16.8 -12.4 -11.8 17 -2.2z" fill="url(#m-gold)" stroke="#fff6d8" strokeWidth="1.2" />
      <g fill="#fff3c9">
        <circle cx="188" cy="62" r="2.2" />
        <circle cx="140" cy="56" r="1.6" />
        <circle cx="192" cy="96" r="1.6" />
      </g>
      {/* 蝶ネクタイ */}
      <path d="M100 138 L84 129 L84 147 Z M100 138 L116 129 L116 147 Z" fill="#c51f2c" />
      <circle cx="100" cy="138" r="4" fill="#e9c264" />
      {/* 耳 */}
      <circle cx="50" cy="84" r="17" fill={fur} />
      <circle cx="50" cy="84" r="9.5" fill={skin} />
      <circle cx="150" cy="84" r="17" fill={fur} />
      <circle cx="150" cy="84" r="9.5" fill={skin} />
      {/* 頭 */}
      <circle cx="100" cy="84" r="47" fill={fur} />
      <g fill={skin}>
        <circle cx="84" cy="78" r="21" />
        <circle cx="116" cy="78" r="21" />
        <ellipse cx="100" cy="102" rx="34" ry="24" />
      </g>
      {/* 目・鼻・口 */}
      <ellipse cx="86" cy="80" rx="5" ry="6.5" fill="#2b1a10" />
      <ellipse cx="114" cy="80" rx="5" ry="6.5" fill="#2b1a10" />
      <circle cx="88" cy="77.5" r="1.8" fill="#fff" />
      <circle cx="116" cy="77.5" r="1.8" fill="#fff" />
      <ellipse cx="96" cy="96" rx="2" ry="1.6" fill="#5a3520" />
      <ellipse cx="104" cy="96" rx="2" ry="1.6" fill="#5a3520" />
      <path d="M86 104 Q 100 118 114 104" fill="#c8434b" stroke="#5a3520" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="72" cy="98" rx="7" ry="4.5" fill="#f19a9a" opacity="0.6" />
      <ellipse cx="128" cy="98" rx="7" ry="4.5" fill="#f19a9a" opacity="0.6" />
      {/* シルクハット */}
      <g transform="rotate(-10 100 40)">
        <ellipse cx="100" cy="42" rx="34" ry="7" fill="#1b1b22" />
        <rect x="78" y="8" width="44" height="34" rx="3" fill="#1b1b22" />
        <rect x="78" y="30" width="44" height="7" fill="url(#m-gold)" />
        <ellipse cx="100" cy="8" rx="22" ry="4" fill="#2a2a33" />
      </g>
    </svg>
  );
}
