import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  fmtModality,
  fmtRecommendation,
  fmtSalary,
  fmtStage,
  recColorClass,
  scoreColorClass,
} from "@/lib/format";

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

type Tab = "candidatos" | "icp" | "outreach" | "reporte";

const TAB_LABELS: Record<Tab, string> = {
  candidatos: "Candidatos",
  icp: "ICP",
  outreach: "Outreach",
  reporte: "Reporte comparativo",
};

export default async function JobPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, description_raw, modality, location, salary_min_usd, salary_max_usd, english_min_cefr, status",
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!job) notFound();

  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, match_score, match_breakdown, match_reasoning, stage,
       candidates (id, full_name, country, city, english_cefr, seniority)`,
    )
    .eq("job_id", params.id)
    .order("match_score", { ascending: false, nullsFirst: false });

  const tab = (
    ["candidatos", "icp", "outreach", "reporte"].includes(searchParams.tab ?? "")
      ? searchParams.tab
      : "candidatos"
  ) as Tab;

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
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {job.company_name} · {fmtModality(job.modality)} ·{" "}
            {job.location ?? "—"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {job.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {fmtSalary(job.salary_min_usd, job.salary_max_usd)} · Inglés{" "}
            {job.english_min_cefr ?? "—"} · {(apps?.length ?? 0)} candidatos
          </p>
        </header>

        <nav className="flex flex-wrap gap-1 border-b border-border">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
            const active = t === tab;
            return (
              <Link
                key={t}
                href={`/jobs/${params.id}?tab=${t}`}
                className={
                  "px-3 py-2 text-sm font-medium border-b-2 -mb-px " +
                  (active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {TAB_LABELS[t]}
              </Link>
            );
          })}
        </nav>

        {tab === "candidatos" ? (
          <CandidatesTab jobId={job.id} apps={apps ?? []} />
        ) : null}
        {tab === "icp" ? <IcpTab description={job.description_raw} /> : null}
        {tab === "outreach" ? <PlaceholderTab text="El módulo de Outreach llega en Fase 8 (Twilio WhatsApp Sandbox)." /> : null}
        {tab === "reporte" ? (
          <PlaceholderTab text="El reporte comparativo side-by-side de los 3 entrevistados llega en Fase 7." />
        ) : null}
      </div>
    </main>
  );
}

function CandidatesTab({
  jobId,
  apps,
}: {
  jobId: string;
  apps: Array<{
    id: string;
    match_score: number | null;
    match_breakdown: unknown;
    match_reasoning: string | null;
    stage: string;
    candidates: {
      id: string;
      full_name: string;
      country: string | null;
      city: string | null;
      english_cefr: string | null;
      seniority: string | null;
    } | null;
  }>;
}) {
  const scored = apps.filter((a) => a.match_score != null).length;
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {scored}/{apps.length} candidatos puntuados por IA. Ordenados por score.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs uppercase text-secondary-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Candidato</th>
              <th className="px-3 py-2 text-left">Locación</th>
              <th className="px-3 py-2 text-left">Inglés</th>
              <th className="px-3 py-2 text-left">Seniority</th>
              <th className="px-3 py-2 text-left">Etapa</th>
              <th className="px-3 py-2 text-left w-56">Score</th>
              <th className="px-3 py-2 text-left">Recomendación</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => {
              const c = a.candidates;
              if (!c) return null;
              const breakdown = a.match_breakdown as MatchBreakdown | null;
              return (
                <tr
                  key={a.id}
                  className="border-t border-border hover:bg-secondary/40"
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    <Link
                      href={`/candidates/${c.id}?job=${jobId}`}
                      className="hover:underline"
                    >
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {c.city ? `${c.city}, ${c.country}` : (c.country ?? "—")}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{c.english_cefr ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground capitalize">{c.seniority ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{fmtStage(a.stage)}</td>
                  <td className="px-3 py-2">
                    <ScoreBar score={a.match_score} />
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                        recColorClass(breakdown?.recommendation)
                      }
                    >
                      {fmtRecommendation(breakdown?.recommendation)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ScoreBar({ score }: { score: number | null }) {
  if (score == null) {
    return <span className="text-xs italic text-muted-foreground">no scoreado</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 w-32 overflow-hidden rounded-full bg-secondary">
        <div
          className={"absolute inset-y-0 left-0 " + scoreColorClass(score)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-foreground">{score}</span>
    </div>
  );
}

function IcpTab({ description }: { description: string }) {
  return (
    <section className="rounded-md border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Job Description (raw)
      </p>
      <pre className="whitespace-pre-wrap break-words text-sm text-card-foreground font-sans">
        {description}
      </pre>
      <p className="mt-4 text-xs text-muted-foreground">
        El ICP parseado por IA (con must/nice/soft skills, idiomas, red flags)
        se ve en{" "}
        <Link href="/try-it-now" className="underline">
          /try-it-now
        </Link>{" "}
        si pegás esta JD allí. Persistencia del ICP por job llega en una
        iteración siguiente.
      </p>
    </section>
  );
}

function PlaceholderTab({ text }: { text: string }) {
  return (
    <section className="rounded-md border border-dashed border-border p-12 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </section>
  );
}
