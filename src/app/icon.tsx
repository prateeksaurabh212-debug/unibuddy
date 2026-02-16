import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 6,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.02em",
        }}
      >
        <span style={{ color: "#fff" }}>E</span>
        <span style={{ color: "hsl(0, 75%, 50%)" }}>P</span>
      </div>
    ),
    { ...size }
  );
}
