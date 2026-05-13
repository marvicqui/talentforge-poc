import { rankCandidateStream, type JobForRanker } from "@talentforge/agents";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: app, error } = await supabase
    .from("applications")
    .select(
      `id, job_id, candidate_id,
       jobs (id, title, company_name, description_raw, modality,
             english_min_cefr, salary_min_usd, salary_max_usd),
       candidates (id, full_name, email, country, city, english_cefr,
                   seniority, gender, university,
                   candidate_profiles (summary, skills, experience))`,
    )
    .eq("id", params.id)
    .maybeSingle();
  if (error || !app || !app.jobs || !app.candidates) {
    return new Response("Application not found", { status: 404 });
  }
  const job = app.jobs;
  const cand = app.candidates;
  const profile = cand.candidate_profiles;
  if (!profile) return new Response("Candidate has no profile", { status: 422 });

  const jobForRanker: JobForRanker = {
    title: job.title,
    company_name: job.company_name,
    description_raw: job.description_raw,
    modality: job.modality,
    english_min_cefr: job.english_min_cefr,
    salary_min_usd: job.salary_min_usd,
    salary_max_usd: job.salary_max_usd,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };
      try {
        for await (const ev of rankCandidateStream({
          job: jobForRanker,
          candidate: {
            id: cand.id,
            full_name: cand.full_name,
            email: cand.email,
            country: cand.country,
            city: cand.city,
            english_cefr: cand.english_cefr,
            seniority: cand.seniority,
            gender: cand.gender,
            university: cand.university,
            profile: {
              summary: profile.summary,
              skills: profile.skills,
              experience: profile.experience,
            },
          },
        })) {
          if (ev.type === "done") {
            // Persist the new score
            const admin = createAdminClient();
            await admin
              .from("applications")
              .update({
                match_score: ev.parsed.overall_score,
                match_breakdown: {
                  skill_breakdown: ev.parsed.skill_breakdown,
                  gaps: ev.parsed.gaps,
                  strengths: ev.parsed.strengths,
                  recommendation: ev.parsed.recommendation,
                } as unknown as never,
                match_reasoning: ev.parsed.match_reasoning,
              })
              .eq("id", app.id);
            await admin.from("agent_traces").insert({
              tenant_id: DEMO_TENANT_ID,
              agent: "candidate-ranker-stream",
              ref_table: "applications",
              ref_id: app.id,
              output: ev.parsed as unknown as never,
              status: "ok",
            });
            send({ type: "done", parsed: ev.parsed });
          } else {
            send(ev);
          }
          if (ev.type === "error") break;
        }
      } catch (err: unknown) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
