import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentForge AI",
  description:
    "Reclutamiento técnico potenciado por agentes de IA: ICP, ranking de candidatos, entrevistas y outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
