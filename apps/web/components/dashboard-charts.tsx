/**
 * Minimal SVG-based charts for the dashboard. No external dep.
 * Designed for the demo: three side-by-side panels.
 *   - Funnel by stage
 *   - Candidates by country
 *   - Score distribution (histogram by bucket)
 */

import { fmtStage } from "@/lib/format";

type ChartProps = {
  stages: Record<string, number>;
  countries: Record<string, number>;
  scoreBuckets: { label: string; count: number; color: string }[];
};

export function DashboardCharts(props: ChartProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3" data-ai-only>
      <Panel title="Funnel por etapa">
        <BarList
          items={Object.entries(props.stages)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => ({ label: fmtStage(k), value: v }))}
          color="hsl(var(--primary))"
        />
      </Panel>
      <Panel title="Candidatos por país">
        <BarList
          items={Object.entries(props.countries)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([k, v]) => ({ label: k || "—", value: v }))}
          color="hsl(217 91% 60%)"
        />
      </Panel>
      <Panel title="Distribución de scores">
        <BarList
          items={props.scoreBuckets.map((b) => ({
            label: b.label,
            value: b.count,
            color: b.color,
          }))}
        />
      </Panel>
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function BarList({
  items,
  color,
}: {
  items: { label: string; value: number; color?: string }[];
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) {
    return <p className="text-xs italic text-muted-foreground">—</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((it) => {
        const pct = (it.value / max) * 100;
        const bg = it.color ?? color ?? "hsl(var(--primary))";
        return (
          <li key={it.label} className="text-xs text-card-foreground">
            <div className="flex items-center justify-between">
              <span className="truncate">{it.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {it.value}
              </span>
            </div>
            <div className="relative h-1.5 mt-0.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 transition-[width]"
                style={{ width: `${pct}%`, background: bg }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
