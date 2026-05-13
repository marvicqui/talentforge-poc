"use server";

import { revalidatePath } from "next/cache";

import { generateInterviewGuide } from "@talentforge/agents";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string } | null;

export async function regenerateGuide(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Sesión expirada." };
  }

  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) return { ok: false, message: "Falta jobId." };

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "id, title, company_name, description_raw, modality, english_min_cefr, ideal_profile",
    )
    .eq("id", jobId)
    .maybeSingle();
  if (error || !job) {
    return { ok: false, message: "Vacante no encontrada." };
  }

  try {
    const result = await generateInterviewGuide({
      job: {
        title: job.title,
        company_name: job.company_name,
        description_raw: job.description_raw,
        modality: job.modality,
        english_min_cefr: job.english_min_cefr,
      },
    });

    const currentProfile =
      (job.ideal_profile as Record<string, unknown> | null) ?? {};
    const nextProfile = {
      ...currentProfile,
      interview_guide: result.parsed,
      interview_guide_generated_at: new Date().toISOString(),
    };

    // Use admin client because RLS for INSERT/UPDATE is not relaxed for
    // authenticated; we already proved auth above.
    const admin = createAdminClient();
    const { error: upErr } = await admin
      .from("jobs")
      .update({ ideal_profile: nextProfile as unknown as never })
      .eq("id", jobId);
    if (upErr) {
      return { ok: false, message: `Error al guardar: ${upErr.message}` };
    }

    revalidatePath(`/jobs/${jobId}/interview-guide`);
    revalidatePath(`/jobs/${jobId}`);
    return { ok: true, message: "Guía generada." };
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : "Error desconocido.";
    // Detect known transient failures (JSON truncation, schema mismatch) and
    // surface a friendlier message inviting a retry.
    if (
      /Unterminated string|Unexpected end of JSON|Expected.*received/i.test(raw)
    ) {
      return {
        ok: false,
        message:
          "La IA cortó la respuesta antes de tiempo. Volvé a intentar (no consume otra cuota si funciona la 2da).",
      };
    }
    return { ok: false, message: `Error: ${raw}` };
  }
}
