"use client";

import { useFormState, useFormStatus } from "react-dom";

import { createJob, type CreateJobState } from "./actions";

const SAMPLE_JD = `# Senior Backend Engineer (Python) — Acme Pagos

Acme Pagos es una fintech mexicana que procesa $4B USD/año en pagos B2B.
Buscamos un Senior Backend Engineer para escalar nuestra plataforma de
transacciones a 10x sin perder confiabilidad.

## Responsabilidades
- Diseñar y mantener servicios Python (FastAPI) que procesan miles de TPS.
- Optimizar PostgreSQL: índices, particionamiento, replicación lógica.
- Implementar mensajería asincrónica con Kafka.

## Must-haves
- 5+ años con Python en producción.
- PostgreSQL avanzado.
- Inglés B2+ para reuniones con stakeholders en EU.

## Modalidad
Remoto LATAM.

## Oferta
- USD 5,000-7,500/mes según experiencia.
- Stock options.`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      {pending ? "Creando..." : "Crear vacante y subir CVs →"}
    </button>
  );
}

export function NewJobForm() {
  const [state, action] = useFormState<CreateJobState, FormData>(createJob, null);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título de la vacante" name="title" required placeholder="Senior Backend Engineer" />
        <Field label="Empresa" name="company_name" required placeholder="Acme Pagos" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field as="select" label="Modalidad" name="modality" required>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
          <option value="onsite">Presencial</option>
        </Field>
        <Field label="Locación (opcional)" name="location" placeholder="CDMX, Remoto LATAM…" />
        <Field as="select" label="Inglés mínimo (opcional)" name="english_min_cefr">
          <option value="">—</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Salario mín USD/mes (opcional)" name="salary_min_usd" type="number" placeholder="4000" />
        <Field label="Salario máx USD/mes (opcional)" name="salary_max_usd" type="number" placeholder="7000" />
      </div>
      <label className="block">
        <span className="text-sm font-medium text-foreground">
          Job Description completa
        </span>
        <textarea
          name="description_raw"
          required
          rows={16}
          defaultValue={SAMPLE_JD}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Pega aquí la JD completa..."
        />
      </label>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          La JD se guarda. Después subes los CVs y la IA hace el match.
        </p>
        <SubmitButton />
      </div>
      {state && !state.ok ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
  as = "input",
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  as?: "input" | "select";
  children?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {as === "select" ? (
        <select
          name={name}
          required={required}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {children}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </label>
  );
}
