"use client";

import { useState, useTransition } from "react";

type Props = {
  /** Server action that performs the deletion. Returns null on success, { message } on error. */
  action: (formData: FormData) => Promise<{ message: string } | null>;
  /** Hidden form fields to include in the action call. */
  fields: Record<string, string>;
  /** Required text the user must type to confirm. */
  confirmText: string;
  /** Display label of the button. */
  label?: string;
  /** Visible warning copy. */
  warning: string;
};

export function DeleteWithConfirm({
  action,
  fields,
  confirmText,
  label = "Eliminar",
  warning,
}: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = typed.trim() === confirmText.trim();

  function submit() {
    if (!matches) {
      setError(`Escribe "${confirmText}" para confirmar.`);
      return;
    }
    setError(null);
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    startTransition(async () => {
      const result = await action(form);
      if (result?.message) {
        setError(result.message);
      }
      // On success, the server action calls redirect() and the page changes.
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md border border-destructive/40 bg-background px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
      >
        {label}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl space-y-4"
          >
            <h2 className="text-base font-semibold text-card-foreground">
              {label}
            </h2>
            <p className="text-sm text-foreground/80">{warning}</p>
            <label className="block">
              <span className="text-xs text-muted-foreground">
                Para confirmar, escribe{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                  {confirmText}
                </code>
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || !matches}
                className="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Eliminando…" : `Sí, ${label.toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
