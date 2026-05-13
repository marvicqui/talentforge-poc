"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { computeEmbedding } from "@/lib/embeddings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const InputSchema = z.object({
  title: z.string().min(4),
  company_name: z.string().min(2),
  modality: z.enum(["remote", "hybrid", "onsite"]),
  location: z.string().optional(),
  salary_min_usd: z.coerce.number().int().min(0).max(50000).optional(),
  salary_max_usd: z.coerce.number().int().min(0).max(50000).optional(),
  english_min_cefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  description_raw: z.string().min(80, "La descripción debe tener al menos 80 caracteres."),
});

export type CreateJobState = { ok: boolean; message: string } | null;

export async function createJob(
  _prev: CreateJobState,
  formData: FormData,
): Promise<CreateJobState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesión expirada." };

  const raw = Object.fromEntries(formData.entries());
  const parse = InputSchema.safeParse(raw);
  if (!parse.success) {
    return {
      ok: false,
      message: parse.error.errors.map((e) => e.message).join(" · "),
    };
  }
  const v = parse.data;

  // Compute embedding for the JD so future searches/matching work immediately.
  let embedding: string | null = null;
  try {
    const text = [
      `Title: ${v.title}`,
      `Company: ${v.company_name}`,
      `Modality: ${v.modality}`,
      `Location: ${v.location ?? "-"}`,
      `English min: ${v.english_min_cefr ?? "-"}`,
      `Salary USD/mes: ${v.salary_min_usd ?? "?"}-${v.salary_max_usd ?? "?"}`,
      "",
      v.description_raw,
    ].join("\n");
    embedding = await computeEmbedding(text);
  } catch {
    // optional; persistence proceeds
  }

  const admin = createAdminClient();
  const { data: job, error } = await admin
    .from("jobs")
    .insert({
      tenant_id: DEMO_TENANT_ID,
      title: v.title,
      company_name: v.company_name,
      description_raw: v.description_raw,
      modality: v.modality,
      location: v.location ?? null,
      salary_min_usd: v.salary_min_usd ?? null,
      salary_max_usd: v.salary_max_usd ?? null,
      english_min_cefr: v.english_min_cefr ?? null,
      status: "active",
      embedding: (embedding ?? null) as unknown as never,
      parsed_jd: { source: "create-job-form" } as unknown as never,
    })
    .select("id")
    .single();
  if (error || !job) {
    return { ok: false, message: `Error al crear la vacante: ${error?.message}` };
  }

  revalidatePath("/dashboard");
  redirect(`/jobs/${job.id}/import`);
}
