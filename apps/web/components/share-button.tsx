"use client";

import { useState } from "react";

export function ShareButton({
  path,
  label = "Compartir",
}: {
  path: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    if (navigator.share) {
      navigator
        .share({ url, title: "Reporte de match — TalentForge AI" })
        .catch(() => {
          fallback(url);
        });
    } else {
      fallback(url);
    }
  }

  function fallback(url: string) {
    navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => {
        window.prompt("Copia el link:", url);
      });
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary"
      title="Compartir link público del reporte (identidad oculta)"
    >
      🔗 {copied ? "Copiado ✓" : label}
    </button>
  );
}
