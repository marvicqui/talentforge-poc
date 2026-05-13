import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DeleteWithConfirm } from "@/components/delete-with-confirm";
import { ScoreExplainer } from "@/components/score-explainer";
import { ShareButton } from "@/components/share-button";
import {
  fmtRecommendation,
  fmtStage,
  recColorClass,
  scoreColorClass,
} from "@/lib/format";
import { deleteCandidateAction } from "./actions";

type MatchBreakdown = {
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

type SkillEntry = { name: string; years_experience: number };
type ExperienceEntry = {
  company: string;
  role: string;
  start: string;
  end: string | null;
  description: string;
};

export default async function CandidatePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { job?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidate } = await supabase
    .from("candidates")
    .select(
      `id, full_name, email, phone_e164, linkedin_url, country, city,
       english_cefr, seniority,
       candidate_profiles (summary, skills, experience)`,
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!candidate) notFound();

  // The application this candidate has — there may be 0+. If a job is hinted
  // by search param, prefer it; otherwise show the first one.
  let appQuery = supabase
    .from("applications")
    .select(
      `id, match_score, match_breakdown, match_reasoning, stage,
       jobs (id, title, company_name)`,
    )
    .eq("candidate_id", params.id);
  if (searchParams.job) {
    appQuery = appQuery.eq("job_id", searchParams.job);
  }
  const { data: apps } = await appQuery;
  const app = apps?.[0] ?? null;

  const profile = candidate.candidate_profiles;
  const skills = Array.isArray(profile?.skills)
    ? (profile.skills as SkillEntry[])
    : [];
  const experience = Array.isArray(profile?.experience)
    ? (profile.experience as ExperienceEntry[])
    : [];
  const breakdown = (app?.match_breakdown ?? null) as MatchBreakdown | null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <Link
          href={app?.jobs ? `/jobs/${app.jobs.id}` : "/dashboard"}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← {app?.jobs ? app.jobs.title : "Dashboard"}
        </Link>

        <header className="grid gap-2 sm:grid-cols-[1fr_auto] items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {candidate.full_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {candidate.seniority ?? "—"} ·{" "}
              {candidate.city ? `${candidate.city}, ${candidate.country}` : (candidate.country ?? "—")}{" "}
              · Inglés {candidate.english_cefr ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {candidate.email} · {candidate.phone_e164 ?? "—"} ·{" "}
              {candidate.linkedin_url ? (
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  LinkedIn
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {app ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Etapa
                </span>
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {fmtStage(app.stage)}
                </span>
              </div>
            ) : null}
            <DeleteWithConfirm
              action={deleteCandidateAction}
              fields={{
                candidateId: candidate.id,
                returnJobId: app?.jobs?.id ?? "",
              }}
              confirmText={candidate.full_name}
              label="Eliminar candidato"
              warning={`Esto elimina al candidato "${candidate.full_name}" y, por cascade, su perfil, applications, entrevistas, transcripciones y reportes. No se puede deshacer.`}
            />
          </div>
        </header>

        {app && app.jobs ? (
          <MatchCard
            applicationId={app.id}
            jobId={app.jobs.id}
            jobTitle={app.jobs.title}
            companyName={app.jobs.company_name}
            score={app.match_score}
            reasoning={app.match_reasoning}
            breakdown={breakdown}
          />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-5 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Summary
            </p>
            <p className="text-sm text-card-foreground whitespace-pre-line">
              {profile?.summary ?? "—"}
            </p>
          </div>
          <div className="rounded-md border border-border bg-card p-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Skills ({skills.length})
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <li
                  key={`${s.name}-${i}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">
                    {s.years_experience}y
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Experiencia
          </p>
          <ol className="space-y-3">
            {experience.map((e, i) => (
              <li
                key={`${e.company}-${i}`}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-card-foreground">
                    {e.role}{" "}
                    <span className="text-muted-foreground font-normal">
                      @ {e.company}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {e.start} — {e.end ?? "presente"}
                  </p>
                </div>
                <p className="mt-1 text-sm text-card-foreground/80">
                  {e.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}

function MatchCard({
  applicationId,
  jobId,
  jobTitle,
  companyName,
  score,
  reasoning,
  breakdown,
}: {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  score: number | null;
  reasoning: string | null;
  breakdown: MatchBreakdown | null;
}) {
  return (
    <section
      data-ai-only
      className="rounded-md border border-border bg-card p-5 space-y-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Match con
            </p>
            <ScoreExplainer />
          </div>
          <Link
            href={`/jobs/${jobId}`}
            className="text-lg font-medium text-card-foreground hover:underline"
          >
            {jobTitle}
          </Link>
          <p className="text-xs text-muted-foreground">{companyName}</p>
        </div>
        <div className="flex items-center gap-3">
          {score != null ? (
            <div
              className={
                "tabular-nums rounded-md px-3 py-2 text-2xl font-semibold " +
                scoreColorClass(score)
              }
            >
              {score}
            </div>
          ) : (
            <span className="text-xs italic text-muted-foreground">
              no scoreado
            </span>
          )}
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
          <ShareButton path={`/share/match/${applicationId}`} />
        </div>
      </header>

      {reasoning ? (
        <p className="text-sm text-card-foreground/90">{reasoning}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-600 mb-2">
            Strengths
          </p>
          {(breakdown?.strengths ?? []).length === 0 ? (
            <p className="text-sm italic text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {breakdown!.strengths!.map((s, i) => (
                <li key={i} className="text-card-foreground">
                  ✓ {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-destructive mb-2">
            Gaps
          </p>
          {(breakdown?.gaps ?? []).length === 0 ? (
            <p className="text-sm italic text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {breakdown!.gaps!.map((g, i) => (
                <li key={i} className="text-card-foreground">
                  ⚠ {g}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {breakdown?.skill_breakdown && breakdown.skill_breakdown.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Cobertura por skill
          </p>
          <div className="rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase text-secondary-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Skill</th>
                  <th className="px-3 py-2 text-left">Years</th>
                  <th className="px-3 py-2 text-left w-40">Score</th>
                  <th className="px-3 py-2 text-left">Evidencia</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.skill_breakdown.map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 font-medium text-card-foreground">
                      {s.name}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-card-foreground/80">
                      {s.candidate_years} / {s.required_years}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={"absolute inset-y-0 left-0 " + scoreColorClass(s.score)}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs">{s.score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-card-foreground/80">
                      {s.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
        title="Generación de outreach llega en Fase 8 (Twilio)"
      >
        Generar outreach (Fase 8)
      </button>
    </section>
  );
}
