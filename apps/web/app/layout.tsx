import type { Metadata } from "next";
import "./globals.css";

import { SavingsCounter } from "@/components/savings-counter";

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
      <body className="antialiased">
        {children}
        <SavingsCounter />
      </body>
    </html>
  );
}
