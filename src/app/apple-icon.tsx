import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 24,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 72,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={{ color: "#fff" }}>Exam</span>
        <span style={{ color: "hsl(0, 75%, 50%)" }}>Pal</span>
      </div>
    ),
    { ...size }
  );
}
