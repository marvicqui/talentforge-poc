import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { GenerateGuideButton } from "./generate-button";

type InterviewQuestion = {
  question: string;
  intent: string;
  time_minutes: number;
  what_to_look_for: string[];
  good_answer_signals: string[];
  weak_answer_signals: string[];
  red_flag_signals: string[];
};
type Guide = {
  estimated_total_minutes: number;
  sections: Array<{
    id: string;
    label: string;
    questions: InterviewQuestion[];
  }>;
  practical_case_context: string;
  practical_case_subprompts: string[];
};

export const metadata = { title: "Guía de entrevista — TalentForge AI" };

export default async function InterviewGuidePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company_name, ideal_profile, modality, english_min_cefr")
    .eq("id", params.id)
    .maybeSingle();
  if (!job) notFound();

  const profile = (job.ideal_profile ?? null) as Record<string, unknown> | null;
  const guide = (profile?.interview_guide as Guide | undefined) ?? null;
  const generatedAt =
    (profile?.interview_guide_generated_at as string | undefined) ?? null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <Link
          href={`/jobs/${job.id}`}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← {job.title}
        </Link>

        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Guía de entrevista
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {job.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {job.company_name} · pensada para reclutador no técnico
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <GenerateGuideButton jobId={job.id} hasGuide={guide != null} />
            {guide ? (
              <a
                href={`/api/interview-guide/${job.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline text-muted-foreground hover:text-foreground"
              >
                Descargar PDF
              </a>
            ) : null}
          </div>
        </header>

        {!guide ? (
          <section className="rounded-md border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Todavía no se generó la guía para esta vacante. La IA arma
              preguntas calibradas a las must-have skills + señales para
              calificar respuestas en tiempo real.
            </p>
          </section>
        ) : (
          <>
            {generatedAt ? (
              <p className="text-xs text-muted-foreground">
                Última generación:{" "}
                {new Date(generatedAt).toLocaleString("es-MX")} ·{" "}
                {guide.estimated_total_minutes} min estimados
              </p>
            ) : null}

            <ol className="space-y-6">
              {guide.sections.map((s, sIdx) => (
                <li
                  key={s.id}
                  className="rounded-md border border-border bg-card p-5 space-y-4"
                >
                  <header className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold text-card-foreground">
                      {sIdx + 1}. {s.label}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {s.questions.reduce((sum, q) => sum + q.time_minutes, 0)}{" "}
                      min
                    </span>
                  </header>
                  <ol className="space-y-3">
                    {s.questions.map((q, qIdx) => (
                      <li
                        key={`${s.id}-${qIdx}`}
                        className="rounded-md border border-border bg-background p-3 space-y-2"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">
                            {sIdx + 1}.{qIdx + 1} {q.question}
                          </p>
                          <span className="text-[10px] uppercase text-muted-foreground tabular-nums">
                            {q.time_minutes} min
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          {q.intent}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <SignalList
                            label="Buscar"
                            color="text-foreground"
                            items={q.what_to_look_for}
                          />
                          <SignalList
                            label="Respuesta sólida"
                            color="text-emerald-600"
                            items={q.good_answer_signals}
                          />
                          <SignalList
                            label="Respuesta débil"
                            color="text-amber-600"
                            items={q.weak_answer_signals}
                          />
                          <SignalList
                            label="Red flag"
                            color="text-destructive"
                            items={q.red_flag_signals}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>

            <section className="rounded-md border border-border bg-secondary/30 p-5 space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                Caso práctico
              </h2>
              <p className="text-sm text-foreground/90 whitespace-pre-line">
                {guide.practical_case_context}
              </p>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Sub-prompts
                </p>
                <ol className="list-decimal list-inside text-sm text-foreground/90 space-y-1">
                  {guide.practical_case_subprompts.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SignalList({
  label,
  color,
  items,
}: {
  label: string;
  color: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className={`text-[10px] uppercase tracking-wider ${color}`}>{label}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-foreground/80">
        {items.map((it, i) => (
          <li key={i}>· {it}</li>
        ))}
      </ul>
    </div>
  );
}
