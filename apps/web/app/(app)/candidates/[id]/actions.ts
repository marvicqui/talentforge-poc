"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function deleteCandidateAction(
  formData: FormData,
): Promise<{ message: string } | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Sesión expirada." };

  const candidateId = String(formData.get("candidateId") ?? "");
  const returnJobId = String(formData.get("returnJobId") ?? "");
  if (!candidateId) return { message: "Falta candidateId." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("candidates")
    .delete()
    .eq("id", candidateId)
    .eq("tenant_id", DEMO_TENANT_ID);
  if (error) return { message: `Error al eliminar: ${error.message}` };

  revalidatePath("/dashboard");
  if (returnJobId) {
    revalidatePath(`/jobs/${returnJobId}`);
    redirect(`/jobs/${returnJobId}`);
  }
  redirect("/dashboard");
}
