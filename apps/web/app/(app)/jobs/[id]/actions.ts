"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function deleteJobAction(
  formData: FormData,
): Promise<{ message: string } | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Sesión expirada." };

  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) return { message: "Falta jobId." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("tenant_id", DEMO_TENANT_ID);
  if (error) return { message: `Error al eliminar: ${error.message}` };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
