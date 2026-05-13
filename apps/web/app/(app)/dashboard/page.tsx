import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — TalentForge AI" };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, role, tenant_id, email")
    .eq("id", user.id)
    .maybeSingle();

  const { count: jobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true });
  const { count: candidatesCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  return (
    <main className="min-h-screen px-6 py-12 bg-background">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Hola, {profile?.display_name ?? user.email}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile?.email} · rol: {profile?.role ?? "—"} · tenant:{" "}
              {profile?.tenant_id?.slice(0, 8) ?? "—"}
            </p>
          </div>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Vacantes</p>
            <p className="mt-1 text-3xl font-semibold text-card-foreground">
              {jobsCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Esperando seed (Fase 2).
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Candidatos</p>
            <p className="mt-1 text-3xl font-semibold text-card-foreground">
              {candidatesCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Esperando seed (Fase 2).
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Entrevistas</p>
            <p className="mt-1 text-3xl font-semibold text-card-foreground">0</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Llegan en Fase 5.
            </p>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          Fase 1 ✅ auth contra Supabase Cloud. Las pantallas reales llegan en
          Fase 3+.
        </p>
      </div>
    </main>
  );
}
