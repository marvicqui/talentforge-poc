import Link from "next/link";

export const metadata = { title: "Roadmap — TalentForge AI" };

const FEATURES = [
  {
    section: "Fuentes de candidatos",
    items: [
      { name: "LinkedIn Recruiter API", eta: "Q3" },
      { name: "Greenhouse / Lever sync bidireccional", eta: "Q3" },
      { name: "Workable + Ashby", eta: "Q4" },
      { name: "Importar CVs en bulk desde Drive/Dropbox", eta: "Q3" },
    ],
  },
  {
    section: "Análisis de entrevistas",
    items: [
      { name: "Upload de video/audio + Whisper diarización", eta: "Q3" },
      { name: "Integración Zoom / Google Meet / Teams", eta: "Q4" },
      { name: "Transcripción en tiempo real (live coaching)", eta: "Q4" },
    ],
  },
  {
    section: "Comunicación",
    items: [
      { name: "WhatsApp Business Cloud (templates aprobados)", eta: "Q3" },
      { name: "Email outbound + threading", eta: "Q3" },
      { name: "LinkedIn InMail (Sales Navigator)", eta: "Q4" },
      { name: "Inbox unificado por candidato", eta: "Q4" },
    ],
  },
  {
    section: "Agendamiento",
    items: [
      { name: "Google Calendar OAuth", eta: "Q3" },
      { name: "Outlook / MS Graph", eta: "Q4" },
      { name: "Buffer de slots + recordatorios automáticos", eta: "Q3" },
    ],
  },
  {
    section: "Plataforma",
    items: [
      { name: "Multi-tenancy hardened + audit log por tenant", eta: "Q3" },
      { name: "OAuth Google / Microsoft", eta: "Q3" },
      { name: "Roles + permisos granulares", eta: "Q3" },
      { name: "Webhooks salientes para BI / Slack", eta: "Q4" },
    ],
  },
  {
    section: "Calidad / data flywheel",
    items: [
      { name: "Re-ranking por feedback del recruiter", eta: "Q3" },
      { name: "A/B testing de Outreach Composer con métricas", eta: "Q3" },
      { name: "Eval framework abierto al cliente", eta: "Q4" },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Roadmap v2
          </h1>
          <p className="text-sm text-muted-foreground">
            Lo que viene en la versión productiva. Si tu equipo necesita
            cualquiera de estos antes, dilo en la primera llamada de
            descubrimiento — pueden subir en prioridad.
          </p>
        </header>

        <ol className="space-y-6">
          {FEATURES.map((s) => (
            <li
              key={s.section}
              className="rounded-md border border-border bg-card p-5"
            >
              <h2 className="text-base font-semibold text-card-foreground mb-3">
                {s.section}
              </h2>
              <ul className="space-y-2">
                {s.items.map((i) => (
                  <li
                    key={i.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{i.name}</span>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      {i.eta}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <section className="rounded-md border border-primary/40 bg-primary/5 p-5 text-center space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            ¿Necesitas un feature antes de la fecha?
          </h3>
          <p className="text-sm text-muted-foreground">
            Cliente design partner = priorización. Hablemos de tu caso.
          </p>
          <Link
            href="mailto:sales@talentforge.ai"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Hablemos →
          </Link>
        </section>
      </div>
    </main>
  );
}
