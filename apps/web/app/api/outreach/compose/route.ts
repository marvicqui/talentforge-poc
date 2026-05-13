import { z } from "zod";
import { composeOutreach } from "@talentforge/agents";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const BodySchema = z.object({
  applicationId: z.string().uuid(),
});

type SkillEntry = { name: string; years_experience: number };
type ExperienceEntry = { company: string; role: string; start: string };

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parse.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: app, error } = await supabase
    .from("applications")
    .select(
      `id,
       jobs (title, company_name, modality, salary_min_usd, salary_max_usd),
       candidates (id, full_name, country, seniority,
                   candidate_profiles (skills, experience))`,
    )
    .eq("id", parse.data.applicationId)
    .maybeSingle();
  if (error || !app || !app.jobs || !app.candidates) {
    return new Response("Application not found", { status: 404 });
  }

  const cand = app.candidates;
  const skills =
    (cand.candidate_profiles?.skills as SkillEntry[] | undefined) ?? [];
  const experience =
    (cand.candidate_profiles?.experience as ExperienceEntry[] | undefined) ?? [];
  const lastCompany = experience[0]?.company ?? null;
  const firstName = (cand.full_name ?? "").split(/\s+/)[0] ?? cand.full_name;

  try {
    const result = await composeOutreach({
      job: {
        title: app.jobs.title,
        company_name: app.jobs.company_name,
        modality: app.jobs.modality,
        salary_min_usd: app.jobs.salary_min_usd,
        salary_max_usd: app.jobs.salary_max_usd,
      },
      candidate: {
        first_name: firstName,
        seniority: cand.seniority,
        country: cand.country,
        top_skills: skills.slice(0, 5),
        last_company: lastCompany,
      },
    });
    return Response.json(result.parsed);
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
