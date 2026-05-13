import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata = { title: "Login — TalentForge AI" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ← Volver
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Entrar
          </h1>
          <p className="text-sm text-muted-foreground">
            Recibe un magic link por email o entra directo al demo.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
