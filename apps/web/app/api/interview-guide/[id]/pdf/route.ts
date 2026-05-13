import { renderToBuffer } from "@react-pdf/renderer";

import { InterviewGuideDocument } from "@/lib/pdf/interview-guide-document";
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
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, title, company_name, modality, ideal_profile")
    .eq("id", params.id)
    .maybeSingle();
  if (error || !job) return new Response("Job not found", { status: 404 });

  const profile = (job.ideal_profile ?? null) as Record<string, unknown> | null;
  const guide = profile?.interview_guide;
  if (!guide || typeof guide !== "object") {
    return new Response("Guide not generated yet", { status: 409 });
  }

  const buf = await renderToBuffer(
    InterviewGuideDocument({
      jobTitle: job.title,
      companyName: job.company_name,
      modality: job.modality,
      guide: guide as never,
    }),
  );

  const filename = `guia-${job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
