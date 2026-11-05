import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ComparaBici.es · Comparador Técnico Oficial de Bicicletas";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          padding: "64px 72px",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #042f2e 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#14b8a6",
              color: "#020617",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 900,
            }}
          >
            CB
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              ComparaBici.es
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#2dd4bf",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Catálogo y Comparador Técnico Oficial
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#f8fafc",
            }}
          >
            Carretera, Gravel, MTB y E-Bikes frente a frente
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "#cbd5e1",
            }}
          >
            Geometrías Stack/Reach, pasos de rueda al milímetro, pesos declarados, ratios de subida y enlaces directos a marcas oficiales.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {["Geometría Real", "Ratios de Subida", "Paso de Rueda", "100% Sin Afiliados"].map(
            (badge) => (
              <div
                key={badge}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  background: "rgba(20, 184, 166, 0.15)",
                  border: "1px solid rgba(45, 212, 191, 0.4)",
                  color: "#5eead4",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {badge}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
