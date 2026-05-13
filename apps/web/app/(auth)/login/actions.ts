"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
// Fixed demo password — intentionally non-secret. Anyone with the link can sign in
// as the demo user; that's the point of the public demo button.
const DEMO_PASSWORD = "demo-pa55-talentforge";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type ActionState = { ok: boolean; message: string } | null;

export async function sendMagicLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, message: "Email inválido." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl()}/auth/callback`,
    },
  });
  if (error) {
    return { ok: false, message: `Error: ${error.message}` };
  }
  return {
    ok: true,
    message: `Te enviamos un magic link a ${email}. Revisa tu bandeja.`,
  };
}

export async function signInAsDemo(): Promise<void> {
  const demoEmail =
    process.env.DEMO_USER_EMAIL ?? "demo@talentforge.ai";
  const admin = createAdminClient();

  // 1. Ensure demo user exists in auth.users (idempotent).
  const { data: list } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  let demoUserId = list.users.find((u) => u.email === demoEmail)?.id;

  if (!demoUserId) {
    const created = await admin.auth.admin.createUser({
      email: demoEmail,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: "Demo Recruiter" },
    });
    if (created.error || !created.data.user) {
      throw new Error(
        `No se pudo crear el usuario demo: ${created.error?.message ?? "unknown"}`,
      );
    }
    demoUserId = created.data.user.id;
  }

  // 2. Upsert the profile row in public.users so it has tenant_id.
  await admin.from("users").upsert(
    {
      id: demoUserId,
      tenant_id: DEMO_TENANT_ID,
      email: demoEmail,
      display_name: "Demo Recruiter",
      role: "owner",
    },
    { onConflict: "id" },
  );

  // 3. Sign in with password against the regular SSR client so cookies are set.
  const supabase = createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: DEMO_PASSWORD,
  });
  if (signInErr) {
    throw new Error(`No se pudo iniciar sesión: ${signInErr.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
