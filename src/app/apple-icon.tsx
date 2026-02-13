import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "linear-gradient(135deg, #1e1b4b, #0a0e1a)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 64 }}>🌙</div>
        <div style={{ color: "white", fontSize: 24, fontWeight: 700 }}>SW</div>
      </div>
    ),
    { ...size },
  );
}
