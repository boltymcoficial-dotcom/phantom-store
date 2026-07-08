type ProductArtProps = {
  title: string;
  subtitle: string;
  accent: string;
  size?: "hero" | "card";
};

export function ProductArt({
  title,
  subtitle,
  accent,
  size = "card",
}: ProductArtProps) {
  const isHero = size === "hero";
  const mark = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`product-art ${isHero ? "product-art-hero" : "product-art-card"}`}
      style={{ "--art-accent": accent } as React.CSSProperties}
    >
      <div className="product-art-glow" />
      <div className="product-art-grid" />

      <div className="product-art-frame">
        <div className="product-art-icon">{mark}</div>
        <div className="product-art-frame-lines">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="product-art-content">
        <p className="product-art-subtitle">{subtitle}</p>
        <h3 className="product-art-title">{title}</h3>
        <div className="product-art-badges">
          <span>Premium</span>
          <span>Digital</span>
          <span>Fast</span>
        </div>
      </div>
    </div>
  );
}
