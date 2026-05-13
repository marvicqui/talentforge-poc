import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company_name")
    .eq("id", params.id)
    .maybeSingle();
  if (!job) return new Response("Job not found", { status: 404 });

  const { data: apps } = await supabase
    .from("applications")
    .select(
      `id, match_score, match_breakdown, match_reasoning, stage, status,
       candidates (full_name, email, phone_e164, country, city,
                   english_cefr, seniority, linkedin_url)`,
    )
    .eq("job_id", params.id)
    .order("match_score", { ascending: false, nullsFirst: false });

  const headers = [
    "candidate_name",
    "email",
    "phone_e164",
    "country",
    "city",
    "english_cefr",
    "seniority",
    "linkedin_url",
    "stage",
    "match_score",
    "recommendation",
    "match_reasoning",
    "top_strengths",
    "top_gaps",
  ];

  const rows: string[] = [headers.join(",")];

  type Breakdown = {
    recommendation?: string;
    strengths?: string[];
    gaps?: string[];
  };

  for (const a of apps ?? []) {
    const c = a.candidates;
    if (!c) continue;
    const b = (a.match_breakdown ?? null) as Breakdown | null;
    rows.push(
      [
        csvEscape(c.full_name),
        csvEscape(c.email),
        csvEscape(c.phone_e164),
        csvEscape(c.country),
        csvEscape(c.city),
        csvEscape(c.english_cefr),
        csvEscape(c.seniority),
        csvEscape(c.linkedin_url),
        csvEscape(a.stage),
        csvEscape(a.match_score),
        csvEscape(b?.recommendation),
        csvEscape(a.match_reasoning),
        csvEscape((b?.strengths ?? []).slice(0, 3).join(" | ")),
        csvEscape((b?.gaps ?? []).slice(0, 3).join(" | ")),
      ].join(","),
    );
  }

  const filename = `ranking-${job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=0",
    },
  });
}
