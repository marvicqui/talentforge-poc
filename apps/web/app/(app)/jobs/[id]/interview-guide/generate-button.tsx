"use client";

import { useFormState, useFormStatus } from "react-dom";

import { regenerateGuide, type ActionState } from "./actions";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      {pending ? "Generando… (≈30s)" : children}
    </button>
  );
}

export function GenerateGuideButton({
  jobId,
  hasGuide,
}: {
  jobId: string;
  hasGuide: boolean;
}) {
  const [state, action] = useFormState<ActionState, FormData>(
    regenerateGuide,
    null,
  );
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="jobId" value={jobId} />
      <SubmitButton>
        {hasGuide ? "Regenerar guía" : "Generar guía de entrevista"}
      </SubmitButton>
      {state ? (
        <p
          className={`text-xs ${state.ok ? "text-emerald-600" : "text-destructive"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
