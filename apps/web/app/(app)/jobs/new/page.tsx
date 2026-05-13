import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { NewJobForm } from "./new-job-form";

export const metadata = { title: "Nueva vacante — TalentForge AI" };

export default async function NewJobPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Crear vacante
          </h1>
          <p className="text-sm text-muted-foreground">
            Pega tu JD completa. Al guardar, se calcula el embedding y vas
            directo a la pantalla de carga de CVs.
          </p>
        </header>
        <NewJobForm />
      </div>
    </main>
  );
}
