import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "OTS Packing List — Air Force Officer Training School prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const shieldData = await readFile(
    join(process.cwd(), "public/ots-shield.png"),
  );
  const shieldSrc = `data:image/png;base64,${shieldData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafaf9",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shieldSrc} width={140} height={140} alt="" />
        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 700,
            color: "#1c1917",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          OTS Packing List
        </div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#57534e" }}>
          Air Force Officer Training School Prep &amp; Checklist
        </div>
        <div
          style={{
            marginTop: 40,
            width: 120,
            height: 6,
            backgroundColor: "#1d4ed8",
            borderRadius: 999,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
