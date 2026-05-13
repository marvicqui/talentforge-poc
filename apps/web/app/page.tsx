import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          PoC en construcción
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          TalentForge AI
        </h1>
        <p className="text-lg text-muted-foreground">
          Reclutamiento técnico con agentes de IA: análisis de vacantes,
          ranking de candidatos, entrevistas y outreach por WhatsApp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/try-it-now"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Probar con tu propia vacante
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Entrar al demo
          </Link>
        </div>
        <p className="text-xs text-muted-foreground pt-8">
          Fase 0: scaffolding. Las pantallas reales llegan en Fase 3+.
        </p>
      </div>
    </main>
  );
}
