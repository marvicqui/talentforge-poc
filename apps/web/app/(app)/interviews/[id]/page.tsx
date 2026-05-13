import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InterviewReportView } from "./interview-report-view";

export const metadata = { title: "Entrevista — TalentForge AI" };

export default async function InterviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: interview } = await supabase
    .from("interviews")
    .select(
      `id, status, scheduled_at, duration_minutes,
       jobs (id, title, company_name),
       candidates (id, full_name, english_cefr, seniority, country, city),
       transcripts (id, language, segments),
       interview_reports (
         id, english_level, english_breakdown, technical_score,
         softskill_score, red_flags, strengths, summary, recommendation
       )`,
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!interview) notFound();

  const transcript = interview.transcripts;
  const report = interview.interview_reports;

  if (!transcript) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-sm text-muted-foreground">
            Esta entrevista aún no tiene transcripción. Corre <code>pnpm transcripts</code>.
          </p>
        </div>
      </main>
    );
  }

  const segments = Array.isArray(transcript.segments)
    ? (transcript.segments as Array<{
        speaker: "interviewer" | "candidate";
        language: "es" | "en" | "mixed";
        start_ms: number;
        end_ms: number;
        text: string;
      }>)
    : [];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <Link
          href={interview.jobs ? `/jobs/${interview.jobs.id}` : "/dashboard"}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← {interview.jobs?.title ?? "Dashboard"}
        </Link>
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Entrevista · {interview.jobs?.company_name ?? "—"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {interview.candidates?.full_name ?? "—"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {interview.scheduled_at
              ? new Date(interview.scheduled_at).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}{" "}
            · {interview.duration_minutes ?? "—"} min ·{" "}
            Inglés declarado {interview.candidates?.english_cefr ?? "—"}
          </p>
        </header>

        {report ? (
          <InterviewReportView
            segments={segments}
            report={{
              english_level: report.english_level ?? "B1",
              english_breakdown: report.english_breakdown as never,
              technical_score: report.technical_score as never,
              softskill_score: report.softskill_score as never,
              red_flags: (report.red_flags ?? []) as never,
              strengths: (report.strengths ?? []) as never,
              summary: report.summary ?? "",
              recommendation: report.recommendation ?? "maybe",
            }}
            pdfHref={`/api/interview-report/${params.id}/pdf`}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              El reporte aún no se generó. Corre <code>pnpm analyze</code>.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
