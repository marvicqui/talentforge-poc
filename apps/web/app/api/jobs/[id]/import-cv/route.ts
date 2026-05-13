/**
 * Import a single CV PDF into a job pipeline.
 *
 * POST multipart/form-data with field "file" (PDF).
 * Auth: requires Supabase session.
 * Flow:
 *   1. Parse PDF with the CV Parser agent (Claude Haiku 4.5, native PDF).
 *   2. Upsert candidate + candidate_profiles (with OpenAI embedding).
 *   3. Insert (or skip if exists) an application for this job.
 *   4. Run the Candidate Ranker against the job.
 *   5. Persist match_score / match_breakdown / match_reasoning.
 *   6. Return the parsed profile + the score.
 */
import {
  parseCv,
  rankCandidate,
  type JobForRanker,
} from "@talentforge/agents";

import { computeEmbedding } from "@/lib/embeddings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB per file

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, description_raw, modality, english_min_cefr, salary_min_usd, salary_max_usd",
    )
    .eq("id", params.id)
    .maybeSingle();
  if (jobErr || !job) return new Response("Job not found", { status: 404 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new Response("Missing file", { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return new Response(`File too large (max ${MAX_PDF_BYTES} bytes)`, {
      status: 413,
    });
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return new Response("Only PDF supported", { status: 415 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");

  // 1) Parse the CV
  let cv;
  try {
    cv = await parseCv({ pdfBase64: base64 });
  } catch (err: unknown) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? `CV parse failed: ${err.message}`
            : "CV parse failed",
        filename: file.name,
      },
      { status: 422 },
    );
  }

  if (cv.parsed._extraction_failed) {
    return Response.json(
      { error: "El PDF no es legible (¿imagen sin OCR?).", filename: file.name },
      { status: 422 },
    );
  }

  // 2) Upsert candidate (by email when distinct; else synthesize a slug-style email)
  const admin = createAdminClient();
  const email =
    cv.parsed.email === "unknown@cv.local"
      ? `cv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@cv.local`
      : cv.parsed.email;

  const { data: candidateRow, error: candErr } = await admin
    .from("candidates")
    .upsert(
      {
        tenant_id: DEMO_TENANT_ID,
        full_name: cv.parsed.full_name,
        email,
        phone_e164: cv.parsed.phone_e164 ?? null,
        country: cv.parsed.country ?? null,
        city: cv.parsed.city ?? null,
        english_cefr: cv.parsed.english_cefr ?? null,
        seniority: cv.parsed.seniority,
      },
      { onConflict: "tenant_id,email" },
    )
    .select("id")
    .single();
  if (candErr || !candidateRow) {
    return new Response(`Failed to upsert candidate: ${candErr?.message}`, {
      status: 500,
    });
  }

  // Compute embedding for the profile
  const embeddingText = [
    `Seniority: ${cv.parsed.seniority}`,
    `Country: ${cv.parsed.country ?? "-"}`,
    `Skills: ${cv.parsed.skills.map((s) => `${s.name} (${s.years_experience}y)`).join(", ")}`,
    "",
    cv.parsed.summary,
    "",
    cv.parsed.experience
      .map(
        (e) =>
          `- ${e.role} @ ${e.company} (${e.start}-${e.end ?? "present"}): ${e.description}`,
      )
      .join("\n"),
  ].join("\n");

  let embedding: string | null = null;
  try {
    embedding = await computeEmbedding(embeddingText);
  } catch {
    // If embedding fails we still persist the profile without it.
  }

  await admin.from("candidate_profiles").upsert(
    {
      candidate_id: candidateRow.id,
      summary: cv.parsed.summary,
      skills: cv.parsed.skills as unknown as never,
      experience: cv.parsed.experience as unknown as never,
      embedding: (embedding ?? null) as unknown as never,
    },
    { onConflict: "candidate_id" },
  );

  // 3) Insert / upsert application
  const { data: app, error: appErr } = await admin
    .from("applications")
    .upsert(
      {
        tenant_id: DEMO_TENANT_ID,
        job_id: job.id,
        candidate_id: candidateRow.id,
        stage: "new",
        status: "open",
      },
      { onConflict: "job_id,candidate_id" },
    )
    .select("id")
    .single();
  if (appErr || !app) {
    return new Response(`Failed to upsert application: ${appErr?.message}`, {
      status: 500,
    });
  }

  // 4) Rank against the job
  const jobForRanker: JobForRanker = {
    title: job.title,
    company_name: job.company_name,
    description_raw: job.description_raw,
    modality: job.modality,
    english_min_cefr: job.english_min_cefr,
    salary_min_usd: job.salary_min_usd,
    salary_max_usd: job.salary_max_usd,
  };

  let rank;
  try {
    rank = await rankCandidate({
      job: jobForRanker,
      candidate: {
        id: candidateRow.id,
        full_name: cv.parsed.full_name,
        email,
        country: cv.parsed.country ?? null,
        city: cv.parsed.city ?? null,
        english_cefr: cv.parsed.english_cefr ?? null,
        seniority: cv.parsed.seniority,
        gender: null,
        university: null,
        profile: {
          summary: cv.parsed.summary,
          skills: cv.parsed.skills,
          experience: cv.parsed.experience,
        },
      },
    });
  } catch (err: unknown) {
    // Persistence already happened; surface the rank failure.
    return Response.json(
      {
        candidate_id: candidateRow.id,
        application_id: app.id,
        full_name: cv.parsed.full_name,
        error:
          err instanceof Error ? `Ranker failed: ${err.message}` : "Ranker failed",
      },
      { status: 500 },
    );
  }

  // 5) Persist rank
  await admin
    .from("applications")
    .update({
      match_score: rank.parsed.overall_score,
      match_breakdown: {
        skill_breakdown: rank.parsed.skill_breakdown,
        gaps: rank.parsed.gaps,
        strengths: rank.parsed.strengths,
        recommendation: rank.parsed.recommendation,
      } as unknown as never,
      match_reasoning: rank.parsed.match_reasoning,
    })
    .eq("id", app.id);

  // 6) Trace
  await admin.from("agent_traces").insert({
    tenant_id: DEMO_TENANT_ID,
    agent: "cv-import",
    ref_table: "applications",
    ref_id: app.id,
    output: {
      filename: file.name,
      score: rank.parsed.overall_score,
      recommendation: rank.parsed.recommendation,
    } as unknown as never,
    status: "ok",
  });

  return Response.json({
    candidate_id: candidateRow.id,
    application_id: app.id,
    full_name: cv.parsed.full_name,
    seniority: cv.parsed.seniority,
    country: cv.parsed.country,
    score: rank.parsed.overall_score,
    recommendation: rank.parsed.recommendation,
    filename: file.name,
  });
}
