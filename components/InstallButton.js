"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Se já está rodando como PWA instalado, não mostra nada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalar() {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  // Não mostra nada se já instalado ou se o browser não suporta o evento
  if (installed || !prompt) return null;

  return (
    <>
      {/* Mobile: ícone + texto na navbar */}
      <button
        onClick={instalar}
        aria-label="Instalar app"
        className="show-mobile-only"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "6px 12px",
          fontSize: "0.8rem",
          fontWeight: 700,
          cursor: "pointer",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        📲 Instalar
      </button>

      {/* Desktop: botão completo */}
      <button
        onClick={instalar}
        className="hide-mobile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--color-accent)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "10px 18px",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        📲 Instalar app
      </button>
    </>
  );
}
