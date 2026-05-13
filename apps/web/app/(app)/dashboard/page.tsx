import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fmtModality, fmtSalary, fmtStage, scoreColorClass } from "@/lib/format";

export const metadata = { title: "Dashboard — TalentForge AI" };

const STAGES_TO_SHOW = [
  "new",
  "interested",
  "contacted",
  "scheduled",
  "interviewed",
  "recommended",
] as const;

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, role, email")
    .eq("id", user.id)
    .maybeSingle();

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      `id, title, company_name, modality, location, salary_min_usd, salary_max_usd,
       english_min_cefr,
       applications (stage, match_score)`,
    )
    .eq("status", "active")
    .order("created_at", { ascending: true });

  const { count: candidatesCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });
  const { count: scoredCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .not("match_score", "is", null);
  // Heuristic: each interview saves ~2.5h of recruiter time.
  const interviewsAnalyzed = 12; // becomes dynamic in Fase 6
  const hoursSaved = Math.round(interviewsAnalyzed * 2.5);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Hola, {profile?.display_name ?? user.email}
            </h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Crear vacante
            </Link>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Metric label="Vacantes activas" value={jobs?.length ?? 0} />
          <Metric label="Candidatos" value={candidatesCount ?? 0} />
          <Metric label="Scoreados por IA" value={scoredCount ?? 0} />
          <Metric label="Horas ahorradas" value={`${hoursSaved}h`} hint={`${interviewsAnalyzed} entrevistas × 2.5h`} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-foreground">Vacantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(jobs ?? []).map((j) => (
              <Link
                key={j.id}
                href={`/jobs/${j.id}`}
                className="rounded-md border border-border bg-card p-5 hover:bg-secondary/30 transition-colors block"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {j.company_name} · {fmtModality(j.modality)} · {j.location ?? "—"}
                </p>
                <h3 className="mt-1 text-lg font-medium text-card-foreground">
                  {j.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fmtSalary(j.salary_min_usd, j.salary_max_usd)} · Inglés{" "}
                  {j.english_min_cefr ?? "—"}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {STAGES_TO_SHOW.map((stage) => {
                    const n = (j.applications ?? []).filter(
                      (a) => a.stage === stage,
                    ).length;
                    return (
                      <div
                        key={stage}
                        className="rounded-md border border-border bg-background px-2 py-1"
                      >
                        <p className="text-[10px] uppercase text-muted-foreground">
                          {fmtStage(stage)}
                        </p>
                        <p className="text-sm font-medium text-foreground tabular-nums">
                          {n}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Top score preview */}
                {(() => {
                  const top = (j.applications ?? [])
                    .map((a) => a.match_score)
                    .filter((s): s is number => s != null)
                    .sort((a, b) => b - a)[0];
                  return top != null ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Mejor match:
                      </span>
                      <span
                        className={
                          "tabular-nums rounded-md px-2 py-0.5 text-xs font-medium " +
                          scoreColorClass(top)
                        }
                      >
                        {top}
                      </span>
                    </div>
                  ) : null;
                })()}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Link
            href="/try-it-now"
            className="block rounded-md border border-dashed border-primary/40 bg-primary/5 p-5 hover:bg-primary/10 transition-colors"
          >
            <p className="text-xs uppercase tracking-wider text-primary">
              Pruébalo en vivo
            </p>
            <h3 className="mt-1 text-base font-medium text-foreground">
              Pega tu propia Job Description y vé el ICP en streaming →
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Demo público compartible: <code>/try-it-now</code>
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-card-foreground tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
