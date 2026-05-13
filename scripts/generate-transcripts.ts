/**
 * Generate 12 interview transcripts (3 per job × 4 jobs).
 *
 * For each job, the 3 `recommended` applications are ordered by match_score
 * descending and mapped to calibrations: strong_yes, yes, maybe_no.
 *
 * Persists:
 *   - interviews row (status='completed', scheduled_at ~10-25 days ago,
 *     duration_minutes from transcript duration).
 *   - transcripts row (segments JSON, raw_text concatenated).
 *   - links interviews.transcript_id back.
 *
 * Usage:
 *   pnpm transcripts                     # generate all missing
 *   pnpm transcripts --force             # regenerate all 12
 *   pnpm transcripts --only <job_slug>   # restrict to one job
 */
import dotenv from "dotenv";
import { resolve } from "node:path";
import WebSocket from "ws";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@talentforge/db";

import {
  generateTranscript,
  transcriptToRawText,
  withAbsoluteTimestamps,
  type TranscriptCalibration,
} from "./seed/transcript-generator";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

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
  if (!url || !key) throw new Error("Supabase envs missing");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket as unknown as never },
  });
}

type ApplicationRow = {
  id: string;
  match_score: number | null;
  job_id: string;
  candidate_id: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    description_raw: string;
    english_min_cefr: string | null;
    parsed_jd: unknown;
  } | null;
  candidates: {
    id: string;
    full_name: string;
    country: string | null;
    seniority: string | null;
    english_cefr: string | null;
    candidate_profiles: {
      summary: string | null;
      skills: unknown;
    } | null;
  } | null;
};

async function loadRecommendedByJob(
  supabase: SupabaseClient<Database>,
  filterSlug: string | null,
): Promise<Map<string, ApplicationRow[]>> {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `id, match_score, job_id, candidate_id,
       jobs (id, title, company_name, description_raw, english_min_cefr, parsed_jd),
       candidates (id, full_name, country, seniority, english_cefr,
                   candidate_profiles (summary, skills))`,
    )
    .eq("tenant_id", DEMO_TENANT_ID)
    .eq("stage", "recommended");

  if (error || !data) throw new Error(`load recommended: ${error?.message}`);

  const byJob = new Map<string, ApplicationRow[]>();
  for (const r of data as ApplicationRow[]) {
    if (!r.jobs) continue;
    if (filterSlug) {
      const parsed = r.jobs.parsed_jd as { slug?: string } | null;
      if (parsed?.slug !== filterSlug) continue;
    }
    const arr = byJob.get(r.jobs.id) ?? [];
    arr.push(r);
    byJob.set(r.jobs.id, arr);
  }
  // Sort each job's recommended by score desc (nulls last).
  for (const apps of byJob.values()) {
    apps.sort(
      (a, b) =>
        (b.match_score ?? -Infinity) - (a.match_score ?? -Infinity),
    );
  }
  return byJob;
}

const CALIBRATIONS: TranscriptCalibration[] = ["strong_yes", "yes", "maybe_no"];

function pickTargetMinutes(cal: TranscriptCalibration): number {
  // Mild variation so the transcripts feel different even before content.
  if (cal === "strong_yes") return 35; // longest, deepest
  if (cal === "yes") return 32;
  return 28; // maybe_no — candidate runs shorter
}

function scheduledDate(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString();
}

async function processOne(
  supabase: SupabaseClient<Database>,
  app: ApplicationRow,
  cal: TranscriptCalibration,
  offsetDays: number,
  force: boolean,
): Promise<{ ok: boolean; reason?: string }> {
  const job = app.jobs;
  const cand = app.candidates;
  if (!job || !cand || !cand.candidate_profiles) {
    return { ok: false, reason: "missing join data" };
  }
  const profile = cand.candidate_profiles;

  // Idempotency: see if there's already a completed interview for this pair.
  const { data: existing } = await supabase
    .from("interviews")
    .select("id, transcript_id, status")
    .eq("candidate_id", cand.id)
    .eq("job_id", job.id)
    .maybeSingle();
  if (existing && !force && existing.transcript_id) {
    return { ok: true, reason: "already exists (skip)" };
  }

  const targetMinutes = pickTargetMinutes(cal);
  const transcript = await generateTranscript({
    jobTitle: job.title,
    jobCompany: job.company_name,
    jobDescription: job.description_raw,
    jobEnglishMinCefr: job.english_min_cefr,
    candidate: {
      full_name: cand.full_name,
      seniority: cand.seniority,
      english_cefr: cand.english_cefr,
      country: cand.country,
      skills:
        (Array.isArray(profile.skills)
          ? (profile.skills as Array<{ name: string; years_experience: number }>)
          : []),
      summary: profile.summary ?? "",
    },
    calibration: cal,
    targetMinutes,
  });

  const absolute = withAbsoluteTimestamps(transcript);
  const rawText = transcriptToRawText(transcript);
  const durationMinutes = Math.max(
    15,
    Math.round(absolute.totalDurationMs / 60000),
  );

  // Upsert interview row first so we can attach the transcript by FK.
  let interviewId: string;
  if (existing) {
    const { error } = await supabase
      .from("interviews")
      .update({
        status: "completed",
        scheduled_at: scheduledDate(offsetDays),
        duration_minutes: durationMinutes,
        transcript_id: null, // reset so we can re-link below
      })
      .eq("id", existing.id);
    if (error) throw new Error(`update interview: ${error.message}`);
    interviewId = existing.id;
  } else {
    const { data: ins, error } = await supabase
      .from("interviews")
      .insert({
        tenant_id: DEMO_TENANT_ID,
        candidate_id: cand.id,
        job_id: job.id,
        status: "completed",
        scheduled_at: scheduledDate(offsetDays),
        duration_minutes: durationMinutes,
      })
      .select("id")
      .single();
    if (error || !ins) throw new Error(`insert interview: ${error?.message}`);
    interviewId = ins.id;
  }

  // Upsert transcript by interview_id (which is UNIQUE in the migration).
  const { data: tx, error: txErr } = await supabase
    .from("transcripts")
    .upsert(
      {
        interview_id: interviewId,
        language: transcript.language,
        segments: absolute.segments as unknown as never,
        raw_text: rawText,
      },
      { onConflict: "interview_id" },
    )
    .select("id")
    .single();
  if (txErr || !tx) throw new Error(`upsert transcript: ${txErr?.message}`);

  // Link.
  const { error: linkErr } = await supabase
    .from("interviews")
    .update({ transcript_id: tx.id })
    .eq("id", interviewId);
  if (linkErr) throw new Error(`link transcript: ${linkErr.message}`);

  // Light trace.
  await supabase.from("agent_traces").insert({
    tenant_id: DEMO_TENANT_ID,
    agent: "interview-transcript-generator",
    ref_table: "transcripts",
    ref_id: tx.id,
    input_redacted: {
      job_title: job.title,
      calibration: cal,
      target_minutes: targetMinutes,
    } as unknown as never,
    output: {
      language: transcript.language,
      segments_count: absolute.segments.length,
      duration_minutes: durationMinutes,
    } as unknown as never,
    status: "ok",
  });

  return { ok: true, reason: `${transcript.segments.length} segments, ${durationMinutes}min, ${cal}` };
}

async function main(): Promise<void> {
  const supabase = getSupabase();
  const onlyArg = arg("only");
  const filterSlug = typeof onlyArg === "string" ? onlyArg : null;
  const force = arg("force") === true;

  const byJob = await loadRecommendedByJob(supabase, filterSlug);
  const jobIds = Array.from(byJob.keys());
  console.log(
    `[transcripts] ${jobIds.length} job(s) with recommended applications`,
  );

  let ok = 0;
  let fail = 0;
  let offsetDays = 8;
  for (const jobId of jobIds) {
    const apps = byJob.get(jobId)!;
    const useApps = apps.slice(0, CALIBRATIONS.length);
    for (let i = 0; i < useApps.length; i++) {
      const app = useApps[i]!;
      const cal = CALIBRATIONS[i]!;
      const title = app.jobs?.title?.slice(0, 30).padEnd(30) ?? "—";
      const name = app.candidates?.full_name?.slice(0, 26).padEnd(26) ?? "—";
      const t0 = Date.now();
      try {
        const r = await processOne(supabase, app, cal, offsetDays, force);
        const dt = Date.now() - t0;
        if (r.ok) {
          ok++;
          console.log(
            `[ok ] ${title} | ${name} | ${cal.padEnd(10)} | ${r.reason} [${dt}ms]`,
          );
        } else {
          fail++;
          console.log(`[skp] ${title} | ${name} | ${cal} | ${r.reason}`);
        }
      } catch (err: unknown) {
        fail++;
        const message = err instanceof Error ? err.message : "unknown";
        console.error(`[fail] ${title} | ${name} | ${cal}: ${message}`);
      }
      offsetDays += 2; // space scheduled dates a bit
    }
  }
  console.log(`[transcripts] done — ok=${ok} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((err: unknown) => {
  console.error("[transcripts] fatal:", err);
  process.exit(1);
});
