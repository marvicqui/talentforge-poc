/**
 * Bulk-analyze the 12 transcribed interviews and persist reports.
 *
 * For each completed interview that has a transcript:
 *   - calls Interview Analyzer Agent (single LLM call, max_tokens=5000)
 *   - upserts into interview_reports with the validated output
 *   - writes one row into agent_traces
 *
 * Usage:
 *   pnpm analyze                          # all missing
 *   pnpm analyze --force                  # re-analyze all
 *   pnpm analyze --only <job_slug>        # restrict to one job
 */
import dotenv from "dotenv";
import { resolve } from "node:path";
import WebSocket from "ws";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { analyzeInterview, type JobForInterviewAnalyzer } from "@talentforge/agents";
import type { Database } from "@talentforge/db";

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

async function main(): Promise<void> {
  const supabase = getSupabase();
  const force = arg("force") === true;
  const onlyArg = arg("only");
  const filterSlug = typeof onlyArg === "string" ? onlyArg : null;

  const { data: interviews, error } = await supabase
    .from("interviews")
    .select(
      `id, candidate_id, transcript_id, status,
       jobs (id, title, description_raw, english_min_cefr, parsed_jd),
       candidates (full_name)`,
    )
    .eq("tenant_id", DEMO_TENANT_ID)
    .eq("status", "completed");
  if (error || !interviews) throw new Error(`load interviews: ${error?.message}`);

  // Two FKs exist between interviews and transcripts (transcripts.interview_id
  // and interviews.transcript_id), which makes Postgrest reject the embedded
  // join without a hint. Fetch transcripts in a second query.
  const interviewIds = interviews.map((r) => r.id);
  const { data: tx } = await supabase
    .from("transcripts")
    .select("interview_id, language, segments")
    .in("interview_id", interviewIds);
  const transcriptsByInterview = new Map<
    string,
    { language: string; segments: unknown }
  >();
  for (const t of tx ?? []) {
    transcriptsByInterview.set(t.interview_id, {
      language: t.language,
      segments: t.segments,
    });
  }

  type BaseRow = (typeof interviews)[number];
  type Row = BaseRow & {
    transcripts: { language: string; segments: unknown } | null;
  };
  let rows: Row[] = interviews.map((r) => ({
    ...r,
    transcripts: transcriptsByInterview.get(r.id) ?? null,
  }));

  if (filterSlug) {
    rows = rows.filter((r) => {
      const p = r.jobs?.parsed_jd as { slug?: string } | null;
      return p?.slug === filterSlug;
    });
  }

  if (!force) {
    const ids = rows.map((r) => r.id);
    const { data: existingReports } = await supabase
      .from("interview_reports")
      .select("interview_id")
      .in("interview_id", ids);
    const reportedIds = new Set(
      (existingReports ?? []).map((r) => r.interview_id),
    );
    rows = rows.filter((r) => !reportedIds.has(r.id));
  }

  console.log(`[analyze] ${rows.length} interview(s) to analyze`);

  let ok = 0;
  let fail = 0;
  for (const [i, r] of rows.entries()) {
    const job = r.jobs;
    const cand = r.candidates;
    const transcript = r.transcripts;
    if (!job || !cand || !transcript) {
      console.warn(`[skip] interview ${r.id}: missing join data`);
      continue;
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
    if (segments.length === 0) {
      console.warn(`[skip] interview ${r.id}: empty transcript`);
      continue;
    }

    const jobForAnalyzer: JobForInterviewAnalyzer = {
      title: job.title,
      description_raw: job.description_raw,
      english_min_cefr: job.english_min_cefr,
    };

    const t0 = Date.now();
    try {
      const result = await analyzeInterview({
        job: jobForAnalyzer,
        transcript: {
          language: transcript.language as "es" | "en" | "mixed",
          segments,
        },
      });
      const latency = Date.now() - t0;

      const reportRow = {
        interview_id: r.id,
        english_level: result.parsed.english_level,
        english_breakdown: result.parsed.english_breakdown as unknown as never,
        technical_score: result.parsed.technical_score as unknown as never,
        softskill_score: result.parsed.softskill_score as unknown as never,
        red_flags: result.parsed.red_flags as unknown as never,
        strengths: result.parsed.strengths as unknown as never,
        summary: result.parsed.summary,
        recommendation: result.parsed.recommendation,
      };
      const { error: upErr } = await supabase
        .from("interview_reports")
        .upsert(reportRow, { onConflict: "interview_id" });
      if (upErr) throw new Error(`upsert report: ${upErr.message}`);

      await supabase.from("agent_traces").insert({
        tenant_id: DEMO_TENANT_ID,
        agent: "interview-analyzer",
        ref_table: "interview_reports",
        ref_id: r.id,
        latency_ms: latency,
        output: {
          english_level: result.parsed.english_level,
          recommendation: result.parsed.recommendation,
          n_technical: result.parsed.technical_score.length,
          n_red_flags: result.parsed.red_flags.length,
          n_strengths: result.parsed.strengths.length,
        } as unknown as never,
        status: "ok",
      });

      ok++;
      const idx = String(i + 1).padStart(2, " ");
      console.log(
        `[${idx}/${rows.length}] ${job.title.slice(0, 30).padEnd(30)} | ${cand.full_name.slice(0, 25).padEnd(25)} | ${result.parsed.english_level} | ${result.parsed.recommendation} [${latency}ms]`,
      );
    } catch (err: unknown) {
      fail++;
      const message = err instanceof Error ? err.message : "unknown";
      console.error(`[fail] interview ${r.id}: ${message}`);
      await supabase.from("agent_traces").insert({
        tenant_id: DEMO_TENANT_ID,
        agent: "interview-analyzer",
        ref_table: "interview_reports",
        ref_id: r.id,
        latency_ms: Date.now() - t0,
        status: "error",
        error_message: message,
      });
    }
  }

  console.log(`[analyze] done — ok=${ok} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((err: unknown) => {
  console.error("[analyze] fatal:", err);
  process.exit(1);
});
