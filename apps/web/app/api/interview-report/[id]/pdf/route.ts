import { renderToBuffer } from "@react-pdf/renderer";

import { InterviewReportDocument } from "@/lib/pdf/interview-report-document";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: interview, error } = await supabase
    .from("interviews")
    .select(
      `id, scheduled_at, duration_minutes,
       jobs (title, company_name),
       candidates (full_name, english_cefr),
       interview_reports (
         english_level, english_breakdown, technical_score,
         softskill_score, red_flags, strengths, summary, recommendation
       )`,
    )
    .eq("id", params.id)
    .maybeSingle();
  if (error || !interview) {
    return new Response("Interview not found", { status: 404 });
  }
  const report = interview.interview_reports;
  if (!report) {
    return new Response("Report not generated yet", { status: 409 });
  }

  const buf = await renderToBuffer(
    InterviewReportDocument({
      candidateName: interview.candidates?.full_name ?? "Candidato",
      jobTitle: interview.jobs?.title ?? "—",
      companyName: interview.jobs?.company_name ?? "—",
      scheduledAt: interview.scheduled_at ?? null,
      durationMinutes: interview.duration_minutes ?? null,
      declaredEnglish: interview.candidates?.english_cefr ?? null,
      report: {
        english_level: report.english_level ?? "B1",
        english_breakdown: report.english_breakdown as never,
        technical_score: report.technical_score as never,
        softskill_score: report.softskill_score as never,
        red_flags: (report.red_flags ?? []) as never,
        strengths: (report.strengths ?? []) as never,
        summary: report.summary ?? "",
        recommendation: report.recommendation ?? "maybe",
      },
    }),
  );

  const filename = `reporte-${(interview.candidates?.full_name ?? "candidato")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.pdf`;

  return new Response(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
