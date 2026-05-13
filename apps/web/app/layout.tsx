import type { Metadata } from "next";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
import { SavingsCounter } from "@/components/savings-counter";

export const metadata: Metadata = {
  title: "TalentForge AI",
  description:
    "Reclutamiento técnico potenciado por agentes de IA: ICP, ranking de candidatos, entrevistas y outreach.",
};

// Inline script: apply theme + ai-mode classes BEFORE first paint to avoid
// a flash of light theme / AI overlays.
const THEME_INIT_SCRIPT = `(function(){try{
  var t=localStorage.getItem('tf_theme');
  if(t==='dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)){
    document.documentElement.classList.add('dark');
  }
  var ai=localStorage.getItem('tf_ai_mode');
  if(ai==='off'){
    document.addEventListener('DOMContentLoaded', function(){
      document.body && document.body.classList.add('no-ai');
    });
  }
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        {children}
        <AppChrome />
        <SavingsCounter />
      </body>
    </html>
  );
}
