"use client";

import { useEffect, useState } from "react";

/**
 * Toggle to demo what the app would look like WITHOUT AI scoring.
 * When OFF, adds `no-ai` class to <body> and `globals.css` hides elements
 * marked with `[data-ai-only]`.
 */

const KEY = "tf_ai_mode";

function apply(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) document.body.classList.remove("no-ai");
  else document.body.classList.add("no-ai");
}

export function AiModeToggle() {
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initial = true;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw === "off") initial = false;
    } catch {
      // ignore
    }
    setOn(initial);
    apply(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    apply(next);
    try {
      window.localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      // ignore
    }
  }

  if (!mounted) return <div className="w-44 h-9" aria-hidden />;

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        "inline-flex items-center gap-2 rounded-md border px-3 h-9 text-xs font-medium transition-colors " +
        (on
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-amber-300 bg-amber-50 text-amber-700")
      }
      aria-pressed={on}
      title={on ? "Click: ver cómo se ve sin IA" : "Click: activar IA"}
    >
      <span
        className={
          "h-2 w-2 rounded-full " +
          (on ? "bg-primary animate-pulse" : "bg-amber-500")
        }
      />
      {on ? "Modo IA activo" : "Modo sin IA (ATS tradicional)"}
    </button>
  );
}
