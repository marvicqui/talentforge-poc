import Link from "next/link";

import { TryItForm } from "./try-it-form";

export const metadata = { title: "Pruébalo con tu propia vacante — TalentForge AI" };

export default function TryItNowPage() {
  const calendlyUrl = process.env.SALES_CALENDLY_URL?.trim() || null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <header className="space-y-3">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ← Volver
          </Link>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Pruébalo con tu propia vacante
          </h1>
          <p className="text-base text-muted-foreground">
            Pega una Job Description y nuestro agente genera el{" "}
            <strong className="text-foreground">Ideal Candidate Profile</strong>{" "}
            en segundos. Sin login, sin tarjeta.
          </p>
        </header>
        <TryItForm calendlyUrl={calendlyUrl} />
      </div>
    </main>
  );
}
