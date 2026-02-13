"use client";

/**
 * Hero image: three students studying with books, tablet, and laptops (brand colors).
 * Cropped to hide the Gemini watermark in the bottom-right corner.
 */
export function HeroStudyIllustration({ className }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      style={{ clipPath: "inset(0 0 10% 10%)" }}
    >
      <img
        src="/hero-study.png"
        alt=""
        className="w-full block"
      />
    </div>
  );
}
