import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#ededed",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          gap: 20,
        }}
      >
        <div style={{ fontSize: 70, fontWeight: 700, letterSpacing: -1 }}>
          Accounts Assists
        </div>
        <div style={{ fontSize: 40, opacity: 0.9 }}>
          Tax Preparation &amp; Accounting Services
        </div>
        <div style={{ fontSize: 26, opacity: 0.75 }}>
          Free, no-obligation consultation • CIMA Certified professional
        </div>
      </div>
    ),
    size,
  );
}

