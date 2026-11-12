/** ロゴ：月桂冠のエンブレム＋「ANNIVERSARY DATABASE / アニバーサル」 */
export function Emblem({ size = 40 }: { size?: number }) {
  const leaves = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="emblem">
      <defs>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e3b3" />
          <stop offset="0.5" stopColor="#c9a45c" />
          <stop offset="1" stopColor="#8c6a2f" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#lg-gold)" strokeWidth="1.2" />
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(64 0) scale(-1 1)" : undefined}>
          <path d="M30 54 C 16 50, 9 38, 12 22" fill="none" stroke="url(#lg-gold)" strokeWidth="1.4" strokeLinecap="round" />
          {leaves.map((i) => {
            const t = i / 6;
            const x = 12 + t * 6 + (1 - t) * 0 + Math.sin(t * 2.6) * 2;
            const y = 24 + t * 27;
            const rot = -60 + t * 70;
            return <ellipse key={i} cx={x} cy={y} rx="2" ry="4.6" fill="url(#lg-gold)" transform={`rotate(${rot} ${x} ${y})`} />;
          })}
        </g>
      ))}
      <text x="32" y="40" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="24" fontWeight="600" fill="url(#lg-gold)">
        A
      </text>
      <path d="M32 11 l1.6 3.4 3.7 .4 -2.8 2.5 .8 3.7 -3.3 -1.9 -3.3 1.9 .8 -3.7 -2.8 -2.5 3.7 -.4z" fill="url(#lg-gold)" />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`logo logo-${size}`}>
      <Emblem size={size === "lg" ? 64 : 38} />
      <span className="logo-text">
        <span className="logo-en">ANNIVERSARY DATABASE</span>
        <span className="logo-ja">アニバーサル</span>
      </span>
    </span>
  );
}
