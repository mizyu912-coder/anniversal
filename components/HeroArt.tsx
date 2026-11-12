/** ファーストビューの背景：赤いカーテンとレッドカーペットのステージ（3DCGで制作した実写風画像。scripts/hero-stage.html で再生成可） */
export default function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <picture>
        <source media="(min-width: 760px)" srcSet="/hero/stage-pc.jpg" />
        <img src="/hero/stage-sp.jpg" alt="" fetchPriority="high" />
      </picture>
      <div className="hero-shade" />
    </div>
  );
}
