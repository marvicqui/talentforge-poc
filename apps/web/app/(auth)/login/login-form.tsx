"use client";

import { useFormState, useFormStatus } from "react-dom";

import { sendMagicLink, signInAsDemo, type ActionState } from "./actions";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      {pending ? "Enviando..." : children}
    </button>
  );
}

function DemoButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60 transition-colors"
    >
      {pending ? "Entrando..." : "Entrar como Demo (sin registro)"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(
    sendMagicLink,
    null,
  );

  return (
    <div className="w-full max-w-sm space-y-6">
      <form action={formAction} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="tu@empresa.com"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <SubmitButton>Enviarme magic link</SubmitButton>
        {state ? (
          <p
            className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}
          >
            {state.message}
          </p>
        ) : null}
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      <form action={signInAsDemo}>
        <DemoButton />
      </form>
    </div>
  );
}
