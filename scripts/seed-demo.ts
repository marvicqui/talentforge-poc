/**
 * Fase 2 seed — pobla Supabase Cloud con:
 *   - 4 vacantes (jobs) + embeddings
 *   - 30 candidatos (candidates) + perfiles + embeddings
 *   - 30 applications (relación candidato↔vacante con stage)
 *
 * Idempotente: si una vacante o candidato ya existe (por slug/email), se
 * actualiza. Las applications se mergean por (job_id, candidate_id).
 *
 * Uso:
 *   pnpm seed
 *   pnpm seed --reset            # también limpia tablas afectadas primero
 *
 * Requiere .env.local con:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY.
 */
import dotenv from "dotenv";
import { resolve } from "node:path";
import WebSocket from "ws";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@talentforge/db";

import { CANDIDATES } from "./seed/candidates";
import { JOBS } from "./seed/jobs";
import {
  createEmbeddingClient,
  pgvectorLiteral,
} from "./seed/embeddings";
import type { CandidateFixture, JobFixture } from "./seed/types";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

function getSupabase(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    // Node 20 ships no global WebSocket. We never use Realtime in seeds but
    // SupabaseClient still constructs RealtimeClient eagerly, so provide ws.
    realtime: { transport: WebSocket as unknown as never },
  });
}

function jobEmbeddingText(j: JobFixture): string {
  return [
    `Title: ${j.title}`,
    `Company: ${j.company_name}`,
    `Modality: ${j.modality}`,
    `Location: ${j.location ?? "-"}`,
    `English min: ${j.english_min_cefr}`,
    `Salary USD/mes: ${j.salary_min_usd}-${j.salary_max_usd}`,
    "",
    j.description_raw,
  ].join("\n");
}

function candidateEmbeddingText(c: CandidateFixture): string {
  const skills = c.skills
    .map((s) => `${s.name} (${s.years_experience}y)`)
    .join(", ");
  const exp = c.experience
    .map(
      (e) =>
        `- ${e.role} @ ${e.company} (${e.start}—${e.end ?? "present"}): ${e.description}`,
    )
    .join("\n");
  return [
    `Seniority: ${c.seniority}`,
    `English: ${c.english_cefr}`,
    `Country: ${c.country}`,
    `Skills: ${skills}`,
    "",
    "Summary:",
    c.summary,
    "",
    "Experience:",
    exp,
  ].join("\n");
}

async function maybeReset(supabase: SupabaseClient<Database>): Promise<void> {
  if (!process.argv.includes("--reset")) return;
  console.log("[reset] truncating applications, candidate_profiles, candidates, jobs ...");
  // Order matters due to FKs. RLS is bypassed because we use service_role.
  for (const t of [
    "applications",
    "candidate_profiles",
    "candidates",
    "jobs",
  ] as const) {
    const { error } = await supabase
      .from(t)
      .delete()
      .eq("tenant_id", DEMO_TENANT_ID);
    if (error) throw new Error(`Failed truncating ${t}: ${error.message}`);
  }
}

async function seedJobs(
  supabase: SupabaseClient<Database>,
  embeddings: ReturnType<typeof createEmbeddingClient>,
): Promise<Map<string, string>> {
  console.log("[jobs] computing embeddings for 4 jobs ...");
  const vecs = await embeddings.embedMany(JOBS.map(jobEmbeddingText));

  console.log("[jobs] upserting ...");
  const rows = JOBS.map((j, i) => ({
    tenant_id: DEMO_TENANT_ID,
    title: j.title,
    company_name: j.company_name,
    description_raw: j.description_raw,
    modality: j.modality,
    location: j.location,
    salary_min_usd: j.salary_min_usd,
    salary_max_usd: j.salary_max_usd,
    english_min_cefr: j.english_min_cefr,
    status: "active" as const,
    embedding: pgvectorLiteral(vecs[i]!) as unknown as never,
    // Keep slug in parsed_jd for join lookup; parsed_jd jsonb is also the
    // place where the Job Analyzer Agent will write later.
    parsed_jd: { slug: j.slug, source: "seed-demo" } as unknown as never,
  }));

  // Use the slug-stored-in-parsed_jd to fetch existing rows first to keep
  // idempotency without modifying the migration (no unique constraint on slug).
  const slugToId = new Map<string, string>();
  for (const row of rows) {
    const slug = (row.parsed_jd as { slug: string }).slug;

    const { data: existing } = await supabase
      .from("jobs")
      .select("id")
      .eq("tenant_id", DEMO_TENANT_ID)
      .filter("parsed_jd->>slug", "eq", slug)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("jobs")
        .update(row)
        .eq("id", existing.id);
      if (error) throw new Error(`update job ${slug}: ${error.message}`);
      slugToId.set(slug, existing.id);
    } else {
      const { data: inserted, error } = await supabase
        .from("jobs")
        .insert(row)
        .select("id")
        .single();
      if (error || !inserted) {
        throw new Error(`insert job ${slug}: ${error?.message ?? "no row"}`);
      }
      slugToId.set(slug, inserted.id);
    }
  }
  console.log(`[jobs] ✓ ${slugToId.size} jobs in DB`);
  return slugToId;
}

async function seedCandidates(
  supabase: SupabaseClient<Database>,
  embeddings: ReturnType<typeof createEmbeddingClient>,
  jobSlugToId: Map<string, string>,
): Promise<void> {
  console.log("[candidates] computing embeddings for 30 candidates ...");
  const vecs = await embeddings.embedMany(
    CANDIDATES.map(candidateEmbeddingText),
  );

  console.log("[candidates] upserting candidates + profiles + applications ...");
  let idx = 0;
  for (const c of CANDIDATES) {
    const candidateRow = {
      tenant_id: DEMO_TENANT_ID,
      full_name: c.full_name,
      email: c.email,
      phone_e164: c.phone_e164,
      linkedin_url: c.linkedin_url,
      country: c.country,
      city: c.city,
      english_cefr: c.english_cefr,
      seniority: c.seniority,
      gender: c.gender,
      university: c.university,
    };

    // Upsert candidate by (tenant_id, email) which the migration declares unique.
    const { data: candidate, error: cErr } = await supabase
      .from("candidates")
      .upsert(candidateRow, { onConflict: "tenant_id,email" })
      .select("id")
      .single();
    if (cErr || !candidate) {
      throw new Error(`upsert candidate ${c.email}: ${cErr?.message}`);
    }

    const profileRow = {
      candidate_id: candidate.id,
      summary: c.summary,
      skills: c.skills as unknown as never,
      experience: c.experience as unknown as never,
      embedding: pgvectorLiteral(vecs[idx]!) as unknown as never,
    };
    const { error: pErr } = await supabase
      .from("candidate_profiles")
      .upsert(profileRow, { onConflict: "candidate_id" });
    if (pErr) {
      throw new Error(`upsert profile ${c.email}: ${pErr.message}`);
    }

    const jobId = jobSlugToId.get(c.job_slug);
    if (!jobId) {
      throw new Error(`Candidate ${c.email} references unknown job ${c.job_slug}`);
    }
    const appRow = {
      tenant_id: DEMO_TENANT_ID,
      job_id: jobId,
      candidate_id: candidate.id,
      stage: c.stage,
      status: "open" as const,
    };
    const { error: aErr } = await supabase
      .from("applications")
      .upsert(appRow, { onConflict: "job_id,candidate_id" });
    if (aErr) {
      throw new Error(`upsert application ${c.email}: ${aErr.message}`);
    }

    idx++;
  }
  console.log(`[candidates] ✓ ${CANDIDATES.length} candidates seeded`);
}

async function reportCounts(supabase: SupabaseClient<Database>): Promise<void> {
  // candidate_profiles has no tenant_id column (joins through candidates).
  const tablesWithTenant = ["jobs", "candidates", "applications"] as const;
  const counts: Record<string, number | null> = {};
  for (const t of tablesWithTenant) {
    const { count } = await supabase
      .from(t)
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", DEMO_TENANT_ID);
    counts[t] = count;
  }
  const { count: profileCount } = await supabase
    .from("candidate_profiles")
    .select("*", { count: "exact", head: true });
  counts["candidate_profiles"] = profileCount;

  console.log("[verify] counts (tenant=demo):", counts);

  const expected = {
    jobs: 4,
    candidates: 30,
    candidate_profiles: 30,
    applications: 30,
  };
  for (const [t, want] of Object.entries(expected)) {
    if (counts[t] !== want) {
      throw new Error(
        `Expected ${want} in ${t}, found ${counts[t]}. Seed verification failed.`,
      );
    }
  }
  console.log("[verify] ✓ all expected counts match");
}

async function main(): Promise<void> {
  const supabase = getSupabase();
  const embeddings = createEmbeddingClient();

  await maybeReset(supabase);
  const slugToId = await seedJobs(supabase, embeddings);
  await seedCandidates(supabase, embeddings, slugToId);
  await reportCounts(supabase);
  console.log("[seed] done ✓");
}

main().catch((err: unknown) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
