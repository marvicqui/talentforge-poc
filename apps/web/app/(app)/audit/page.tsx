import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Audit log — TalentForge AI" };
export const dynamic = "force-dynamic";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

type TraceRow = {
  id: string;
  agent: string;
  ref_table: string | null;
  ref_id: string | null;
  input_redacted: unknown;
  output: unknown;
  latency_ms: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
};

function preview(v: unknown, max = 220): string {
  if (v == null) return "—";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function fmtAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { agent?: string; status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let q = supabase
    .from("agent_traces")
    .select(
      "id, agent, ref_table, ref_id, input_redacted, output, latency_ms, status, error_message, created_at",
    )
    .eq("tenant_id", DEMO_TENANT_ID)
    .order("created_at", { ascending: false })
    .limit(80);

  if (searchParams.agent) q = q.eq("agent", searchParams.agent);
  if (searchParams.status) q = q.eq("status", searchParams.status);

  const { data } = await q;
  const rows = (data ?? []) as TraceRow[];

  // Aggregate counts for the filter chips.
  const { data: allAgents } = await supabase
    .from("agent_traces")
    .select("agent, status")
    .eq("tenant_id", DEMO_TENANT_ID)
    .order("created_at", { ascending: false })
    .limit(500);
  const agentCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();
  for (const r of allAgents ?? []) {
    agentCounts.set(r.agent, (agentCounts.get(r.agent) ?? 0) + 1);
    statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Audit log
          </h1>
          <p className="text-sm text-muted-foreground">
            Cada llamada al LLM queda registrada: agente, input redactado,
            output, latencia y status. Esto es lo que mostramos a auditoría.
          </p>
        </header>

        <section className="flex flex-wrap gap-2 text-xs">
          <FilterChip
            href="/audit"
            active={!searchParams.agent && !searchParams.status}
            label={`Todos (${allAgents?.length ?? 0})`}
          />
          {Array.from(agentCounts.entries()).map(([a, n]) => (
            <FilterChip
              key={a}
              href={`/audit?agent=${a}`}
              active={searchParams.agent === a}
              label={`${a} (${n})`}
            />
          ))}
          {Array.from(statusCounts.entries()).map(([s, n]) => (
            <FilterChip
              key={s}
              href={`/audit?status=${s}`}
              active={searchParams.status === s}
              label={`status:${s} (${n})`}
              tone={s === "error" ? "danger" : s === "ok" ? "ok" : "neutral"}
            />
          ))}
        </section>

        <section className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              Sin trazas que coincidan.
            </p>
          ) : null}
          {rows.map((r) => (
            <details
              key={r.id}
              className="rounded-md border border-border bg-card open:bg-card"
            >
              <summary className="cursor-pointer list-none px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-medium " +
                      (r.status === "ok"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "error"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground")
                    }
                  >
                    {r.status}
                  </span>
                  <span className="font-mono text-xs text-foreground">
                    {r.agent}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.ref_table ?? "—"}
                    {r.ref_id ? `/${r.ref_id.slice(0, 8)}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {r.latency_ms != null ? (
                    <span className="tabular-nums">{r.latency_ms}ms</span>
                  ) : null}
                  <span>{fmtAgo(r.created_at)} atrás</span>
                </div>
              </summary>
              <div className="border-t border-border px-4 py-3 space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Input (redactado)
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words text-card-foreground/90 bg-muted/40 rounded-md p-2 max-h-64 overflow-y-auto">
                    {preview(r.input_redacted, 4000)}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Output
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words text-card-foreground/90 bg-muted/40 rounded-md p-2 max-h-64 overflow-y-auto">
                    {preview(r.output, 4000)}
                  </pre>
                </div>
                {r.error_message ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-destructive mb-1">
                      Error
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-destructive bg-destructive/10 rounded-md p-2">
                      {r.error_message}
                    </pre>
                  </div>
                ) : null}
                <p className="text-[10px] text-muted-foreground">
                  trace id: <code>{r.id}</code> · {new Date(r.created_at).toLocaleString("es-MX")}
                </p>
              </div>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}

function FilterChip({
  href,
  active,
  label,
  tone = "neutral",
}: {
  href: string;
  active: boolean;
  label: string;
  tone?: "neutral" | "ok" | "danger";
}) {
  const base = "px-2 py-0.5 rounded-full border";
  const toneCls = active
    ? tone === "danger"
      ? "border-destructive bg-destructive/10 text-destructive"
      : tone === "ok"
        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
        : "border-foreground bg-foreground text-background"
    : "border-border bg-background text-muted-foreground hover:text-foreground";
  return (
    <Link href={href} className={`${base} ${toneCls}`}>
      {label}
    </Link>
  );
}
