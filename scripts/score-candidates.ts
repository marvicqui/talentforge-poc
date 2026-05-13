/**
 * Bulk-score the 30 applications using the Candidate Ranker.
 *
 * Persists into applications:
 *   match_score (numeric 0-100), match_breakdown jsonb, match_reasoning text.
 * Also writes one row per call into agent_traces with the sanitized input,
 * full output, latency, tokens (when available) and a simple cost estimate.
 *
 * Usage:
 *   pnpm score
 *   pnpm score --only ai-ml-engineer-lumina-labs    # by job slug
 *   pnpm score --resume                              # skip apps that already have a score
 */
import dotenv from "dotenv";
import { resolve } from "node:path";
import WebSocket from "ws";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { rankCandidate, type JobForRanker } from "@talentforge/agents";
import type { Database } from "@talentforge/db";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
// Haiku 4.5 list price (input/output per 1M tokens). Used only for trace cost
// estimation; refresh if model pricing changes.
const COST_INPUT_PER_M = 0.8;
const COST_OUTPUT_PER_M = 4.0;

function arg(name: string): string | true | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  const next = process.argv[idx + 1];
  if (next && !next.startsWith("--")) return next;
  return true;
}

function getSupabase(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase envs missing in .env.local");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket as unknown as never },
  });
}

async function loadApplications(
  supabase: SupabaseClient<Database>,
  filterSlug: string | null,
  resume: boolean,
) {
  let q = supabase
    .from("applications")
    .select(
      `id, match_score, job_id, candidate_id,
       jobs (id, title, company_name, description_raw, modality,
             english_min_cefr, salary_min_usd, salary_max_usd, parsed_jd),
       candidates (id, full_name, email, country, city, english_cefr,
                   seniority, gender, university,
                   candidate_profiles (summary, skills, experience))`,
    )
    .eq("tenant_id", DEMO_TENANT_ID);

  const { data, error } = await q;
  if (error || !data) throw new Error(`load apps: ${error?.message}`);

  type Row = (typeof data)[number];
  let rows = data as Row[];

  if (filterSlug) {
    rows = rows.filter((r) => {
      const parsed = r.jobs?.parsed_jd as { slug?: string } | null | undefined;
      return parsed?.slug === filterSlug;
    });
  }
  if (resume) {
    rows = rows.filter((r) => r.match_score === null);
  }
  return rows;
}

async function main(): Promise<void> {
  const supabase = getSupabase();
  const onlyArg = arg("only");
  const filterSlug = typeof onlyArg === "string" ? onlyArg : null;
  const resume = arg("resume") === true;

  const apps = await loadApplications(supabase, filterSlug, resume);
  console.log(`[score] ${apps.length} application(s) to score`);

  let okCount = 0;
  let failCount = 0;
  for (const [i, app] of apps.entries()) {
    const job = app.jobs;
    const cand = app.candidates;
    if (!job || !cand) {
      console.warn(`[skip] app ${app.id}: missing join data`);
      continue;
    }
    const profile = cand.candidate_profiles;
    if (!profile) {
      console.warn(`[skip] app ${app.id}: no profile`);
      continue;
    }

    const jobForRanker: JobForRanker = {
      title: job.title,
      company_name: job.company_name,
      description_raw: job.description_raw,
      modality: job.modality,
      english_min_cefr: job.english_min_cefr,
      salary_min_usd: job.salary_min_usd,
      salary_max_usd: job.salary_max_usd,
    };

    const t0 = Date.now();
    try {
      const result = await rankCandidate({
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
      });
      const latencyMs = Date.now() - t0;

      // Update application with match_score / match_breakdown / match_reasoning.
      const { error: upErr } = await supabase
        .from("applications")
        .update({
          match_score: result.parsed.overall_score,
          match_breakdown: {
            skill_breakdown: result.parsed.skill_breakdown,
            gaps: result.parsed.gaps,
            strengths: result.parsed.strengths,
            recommendation: result.parsed.recommendation,
          } as unknown as never,
          match_reasoning: result.parsed.match_reasoning,
        })
        .eq("id", app.id);
      if (upErr) throw new Error(`update app: ${upErr.message}`);

      // Approximate token + cost (we used messages.create non-stream; usage info
      // is in the SDK response, but we don't have it here without re-doing the
      // call. Trace stores latency only — refine later if useful.)
      await supabase.from("agent_traces").insert({
        tenant_id: DEMO_TENANT_ID,
        agent: "candidate-ranker",
        ref_table: "applications",
        ref_id: app.id,
        input_redacted: { job_title: job.title, sanitized: result.sanitizedInput } as unknown as never,
        output: result.parsed as unknown as never,
        latency_ms: latencyMs,
        status: "ok",
      });

      okCount++;
      const stagePad = String(i + 1).padStart(2, " ");
      console.log(
        `[${stagePad}/${apps.length}] ${job.title.slice(0, 32).padEnd(32)} → score ${result.parsed.overall_score} (${result.parsed.recommendation}) [${latencyMs}ms]`,
      );
    } catch (err: unknown) {
      failCount++;
      const message = err instanceof Error ? err.message : "unknown";
      console.error(`[fail] app ${app.id}: ${message}`);
      await supabase.from("agent_traces").insert({
        tenant_id: DEMO_TENANT_ID,
        agent: "candidate-ranker",
        ref_table: "applications",
        ref_id: app.id,
        latency_ms: Date.now() - t0,
        status: "error",
        error_message: message,
      });
    }
  }

  console.log(`[score] done — ok=${okCount} fail=${failCount}`);
  void COST_INPUT_PER_M; // referenced for future cost calc
  void COST_OUTPUT_PER_M;
  if (failCount > 0) process.exit(1);
}

main().catch((err: unknown) => {
  console.error("[score] fatal:", err);
  process.exit(1);
});
