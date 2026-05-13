"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Compact, fixed top-right counter that estimates time + cost saved during a
 * demo session. Calibrated to be **conservative** — a recruiter takes ~3 min
 * average per CV to triage manually, at a fully-loaded $45 USD/hour.
 */

const RECRUITER_HOURLY_USD = 45;
// Estimated recruiter minutes "replaced" per route view, capped per page.
const ROUTE_MINUTES: Array<{ match: RegExp; minutesPerVisit: number }> = [
  { match: /^\/jobs\/[^/]+\/import/, minutesPerVisit: 25 },
  { match: /^\/jobs\/[^/]+\/interview-guide/, minutesPerVisit: 40 },
  { match: /^\/interviews\//, minutesPerVisit: 90 },
  { match: /^\/candidates\//, minutesPerVisit: 8 },
  { match: /^\/jobs\/[^/]+$/, minutesPerVisit: 12 },
  { match: /^\/try-it-now/, minutesPerVisit: 6 },
  { match: /^\/dashboard/, minutesPerVisit: 3 },
];

const STORAGE_KEY = "tf_savings_v1";

function loadState(): { secondsActive: number; minutesSaved: number } {
  if (typeof window === "undefined") return { secondsActive: 0, minutesSaved: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { secondsActive: 0, minutesSaved: 0 };
    return JSON.parse(raw);
  } catch {
    return { secondsActive: 0, minutesSaved: 0 };
  }
}

function saveState(state: { secondsActive: number; minutesSaved: number }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SavingsCounter() {
  const [mounted, setMounted] = useState(false);
  const [secondsActive, setSecondsActive] = useState(0);
  const [minutesSaved, setMinutesSaved] = useState(0);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const initial = loadState();
    setSecondsActive(initial.secondsActive);
    setMinutesSaved(initial.minutesSaved);
    setMounted(true);
  }, []);

  // Tick session seconds.
  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => {
      setSecondsActive((s) => {
        const next = s + 1;
        saveState({ secondsActive: next, minutesSaved });
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mounted, minutesSaved]);

  // Accumulate minutes saved per visited route.
  useEffect(() => {
    if (!mounted || !pathname) return;
    const match = ROUTE_MINUTES.find((r) => r.match.test(pathname));
    if (!match) return;
    // Add only once per pathname per session — guard with sessionStorage.
    try {
      const key = `tf_visited_${pathname}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
      setMinutesSaved((prev) => {
        const next = prev + match.minutesPerVisit;
        saveState({ secondsActive, minutesSaved: next });
        return next;
      });
    } catch {
      // ignore
    }
  }, [pathname, mounted, secondsActive]);

  if (!mounted) return null;
  // Don't render on /login or root marketing
  if (pathname === "/login" || pathname === "/") return null;

  const costSaved = (minutesSaved / 60) * RECRUITER_HOURLY_USD;

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium shadow-lg hover:opacity-90 flex items-center gap-3"
        title="Tiempo y costo ahorrados en esta sesión"
      >
        <span className="tabular-nums">⏱ {fmtTime(secondsActive)}</span>
        <span className="opacity-50">·</span>
        <span className="tabular-nums">
          🤝 {minutesSaved}m equiv.
        </span>
        <span className="opacity-50">·</span>
        <span className="tabular-nums">
          💰 ${costSaved.toFixed(0)}
        </span>
      </button>
      {open ? (
        <div className="absolute bottom-12 right-0 w-80 rounded-lg border border-border bg-card p-4 text-xs text-card-foreground shadow-xl space-y-2">
          <p className="font-semibold text-sm">Sesión en curso</p>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Tiempo en pantalla" value={fmtTime(secondsActive)} />
            <Stat label="Equiv. recruiter" value={`${minutesSaved} min`} />
            <Stat label="Costo recruiter" value={`$${costSaved.toFixed(2)}`} />
            <Stat
              label="Costo IA real"
              value={`$${(minutesSaved * 0.01).toFixed(2)}`}
            />
          </div>
          <p className="text-[10px] text-muted-foreground pt-2 border-t border-border">
            Calibrado a {RECRUITER_HOURLY_USD} USD/hora del recruiter (loaded
            cost LATAM). Cada acción de IA equivale a X minutos de revisión
            manual. Es una estimación conservadora.
          </p>
          <button
            onClick={() => {
              try {
                window.localStorage.removeItem(STORAGE_KEY);
                // also clear visit markers
                for (let i = 0; i < window.sessionStorage.length; i++) {
                  const k = window.sessionStorage.key(i);
                  if (k?.startsWith("tf_visited_")) {
                    window.sessionStorage.removeItem(k);
                    i--;
                  }
                }
              } catch {
                // ignore
              }
              setSecondsActive(0);
              setMinutesSaved(0);
            }}
            className="text-[10px] text-muted-foreground hover:text-foreground underline"
          >
            Reiniciar contador
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}
