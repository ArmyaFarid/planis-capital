import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Planis Capital — Capital stratégique. Croissance durable."

// Generated rather than a committed asset, so it stays in step with the brand tokens
// and needs no design hand-off.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0d1929 0%, #16294A 55%, #0A1628 100%)",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#C0432F",
            fontWeight: 600,
          }}
        >
          Planis Capital
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", fontSize: 82, color: "#F7F5F2", lineHeight: 1.05 }}>
            Capital stratégique.
          </div>
          <div style={{ display: "flex", fontSize: 82, color: "#C0432F", lineHeight: 1.05 }}>
            Croissance durable.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            borderTop: "1px solid rgba(247,245,242,0.15)",
            paddingTop: 28,
            fontSize: 26,
            color: "rgba(247,245,242,0.65)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", width: 40, height: 4, background: "#C0432F" }} />
          Investir dans l&apos;avenir de l&apos;Afrique
        </div>
      </div>
    ),
    size,
  )
}
