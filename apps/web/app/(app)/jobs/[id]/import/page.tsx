import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ImportForm } from "./import-form";

export const metadata = { title: "Subir CVs — TalentForge AI" };

export default async function ImportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company_name")
    .eq("id", params.id)
    .maybeSingle();
  if (!job) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <Link
          href={`/jobs/${job.id}`}
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← {job.title}
        </Link>
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {job.company_name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Subir CVs para {job.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Suelta PDFs. La IA los parsea, los persiste como candidatos y los
            rankea contra esta vacante.
          </p>
        </header>
        <ImportForm jobId={job.id} jobTitle={job.title} />
      </div>
    </main>
  );
}
