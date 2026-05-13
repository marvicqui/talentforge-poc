import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { fmtRecommendation, recColorClass, scoreColorClass } from "@/lib/format";

export const metadata = { title: "Reporte de match — TalentForge AI" };

type Breakdown = {
  recommendation?: string;
  skill_breakdown?: Array<{
    name: string;
    required_years: number;
    candidate_years: number;
    score: number;
    evidence: string;
  }>;
  gaps?: string[];
  strengths?: string[];
};

/**
 * Public, read-only view of a candidate's match against a job.
 * Identity fields (full name, email, phone) are masked so the link can be
 * shared with a hiring committee or external stakeholder without leaking PII.
 * The application_id is the share token (UUID v4, unguessable in practice).
 */
export default async function ShareMatchPage({
  params,
}: {
  params: { id: string };
}) {
  // No auth needed; we use the admin client because the page is intentionally
  // public via the UUID-as-token model.
  const admin = createAdminClient();
  const { data: app } = await admin
    .from("applications")
    .select(
      `id, match_score, match_breakdown, match_reasoning, stage,
       jobs (title, company_name, modality),
       candidates (seniority, country, english_cefr)`,
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!app || app.match_score == null) notFound();
  const job = app.jobs;
  const cand = app.candidates;
  if (!job || !cand) notFound();

  const breakdown = (app.match_breakdown ?? null) as Breakdown | null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              TalentForge AI · Reporte público
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Match para {job.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {job.company_name} · {job.modality}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={
                "tabular-nums rounded-md px-3 py-2 text-2xl font-semibold " +
                scoreColorClass(app.match_score)
              }
            >
              {app.match_score}
            </div>
            {breakdown?.recommendation ? (
              <span
                className={
                  "rounded-full px-3 py-1 text-xs font-medium " +
                  recColorClass(breakdown.recommendation)
                }
              >
                {fmtRecommendation(breakdown.recommendation)}
              </span>
            ) : null}
          </div>
        </header>

        <section className="rounded-md border border-border bg-card p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Perfil del candidato
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <Field label="Seniority" value={cand.seniority ?? "—"} />
            <Field label="País" value={cand.country ?? "—"} />
            <Field label="Inglés" value={cand.english_cefr ?? "—"} />
          </div>
          <p className="text-xs italic text-muted-foreground pt-2 border-t border-border">
            Identidad oculta (nombre, email, teléfono) en este reporte público.
            Solicítala al recruiter del proceso.
          </p>
        </section>

        {app.match_reasoning ? (
          <section className="rounded-md border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Razonamiento
            </p>
            <p className="text-sm text-card-foreground/90">
              {app.match_reasoning}
            </p>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-emerald-600 mb-2">
              Strengths
            </p>
            {(breakdown?.strengths ?? []).length === 0 ? (
              <p className="text-sm italic text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-1 text-sm text-card-foreground">
                {breakdown!.strengths!.map((s, i) => (
                  <li key={i}>✓ {s}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-destructive mb-2">
              Gaps
            </p>
            {(breakdown?.gaps ?? []).length === 0 ? (
              <p className="text-sm italic text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-1 text-sm text-card-foreground">
                {breakdown!.gaps!.map((g, i) => (
                  <li key={i}>⚠ {g}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {breakdown?.skill_breakdown && breakdown.skill_breakdown.length > 0 ? (
          <section className="rounded-md border border-border bg-card p-5 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Cobertura por skill
            </p>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left pb-1">Skill</th>
                  <th className="text-left pb-1">Years</th>
                  <th className="text-left pb-1 w-32">Score</th>
                  <th className="text-left pb-1">Evidencia</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.skill_breakdown.map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 font-medium text-card-foreground">
                      {s.name}
                    </td>
                    <td className="py-2 tabular-nums text-card-foreground/80">
                      {s.candidate_years} / {s.required_years}
                    </td>
                    <td className="py-2">
                      <span
                        className={
                          "tabular-nums rounded-md px-2 py-0.5 text-xs font-medium " +
                          scoreColorClass(s.score)
                        }
                      >
                        {s.score}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-card-foreground/80">
                      {s.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          Generado por <strong>TalentForge AI</strong> · Score con evidencia
          textual + anti-bias.{" "}
          <a className="underline" href="/try-it-now">
            Probá tu propia vacante →
          </a>
        </footer>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}
