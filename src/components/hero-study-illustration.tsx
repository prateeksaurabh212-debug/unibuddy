"use client";

import Image from "next/image";

/**
 * Hero image: three students studying with books, tablet, and laptops (brand colors).
 * Cropped to hide the Gemini watermark in the bottom-right corner.
 */
export function HeroStudyIllustration({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ clipPath: "inset(0 0 10% 10%)" }}
    >
      <Image
        src="/hero-study.png"
        alt=""
        width={460}
        height={360}
        className="w-full block"
      />
    </div>
  );
}
