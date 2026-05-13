"use client";

import { usePathname } from "next/navigation";

import { AiModeToggle } from "./ai-mode-toggle";
import { ThemeToggle } from "./theme-toggle";

export function AppChrome() {
  const pathname = usePathname();
  // Hide on the public marketing/landing and on the login.
  if (pathname === "/" || pathname === "/login") return null;
  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2 print:hidden">
      <AiModeToggle />
      <ThemeToggle />
    </div>
  );
}
