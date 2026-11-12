/** ロゴ：授賞式のロゼット（記章）に「AD」のモノグラム＋「ANNIVERSARY DATABASE」のワードマーク */

// ロゼットの外周（ギザギザの円）は固定値で計算（ビルドごとに変わらない）
const ROSETTE = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  const r = 25 + 1.6 * Math.cos(a * 24);
  return `${(32 + Math.cos(a) * r).toFixed(2)},${(28 + Math.sin(a) * r).toFixed(2)}`;
}).join(" ");

export function Emblem({ size = 40, id = "lg" }: { size?: number; id?: string }) {
  const g = `url(#${id}-gold)`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="emblem">
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbecc0" />
          <stop offset="0.45" stopColor="#d6ad5c" />
          <stop offset="1" stopColor="#8f6a2a" />
        </linearGradient>
      </defs>
      {/* リボン */}
      <path d="M22 44 L15 62 L21 59 L25 64 L30 48 Z" fill="#a3121f" />
      <path d="M42 44 L49 62 L43 59 L39 64 L34 48 Z" fill="#a3121f" />
      <path d="M22 44 L15 62 L21 59 L25 64 L30 48 Z M42 44 L49 62 L43 59 L39 64 L34 48 Z" fill="none" stroke={g} strokeWidth="0.9" />
      {/* ロゼット */}
      <polygon points={ROSETTE} fill={g} />
      <circle cx="32" cy="28" r="19.5" fill="#15100a" />
      <circle cx="32" cy="28" r="17.6" fill="none" stroke={g} strokeWidth="0.8" />
      <text x="32" y="34.5" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="18.5" fontWeight="700" letterSpacing="-0.5" fill={g}>
        AD
      </text>
      <path d="M32 12.2 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1.1 -2 1.1 .4 -2.2 -1.6 -1.5 2.2 -.3z" fill={g} />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`logo logo-${size}`}>
      <Emblem size={size === "lg" ? 96 : 40} id={`lg-${size}`} />
      <span className="logo-text">
        <span className="logo-en">ANNIVERSARY</span>
        <span className="logo-sub">DATABASE</span>
      </span>
    </span>
  );
}
