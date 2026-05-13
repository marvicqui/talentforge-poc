// Small UI helpers reused by the jobs/candidates views.

export function fmtSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  if (min && max && min !== max) return `USD ${min}-${max}/mes`;
  return `USD ${(min ?? max)?.toLocaleString()}/mes`;
}

export function fmtModality(m: string): string {
  switch (m) {
    case "remote":
      return "Remoto";
    case "hybrid":
      return "Híbrido";
    case "onsite":
      return "Presencial";
    default:
      return m;
  }
}

export function fmtStage(s: string): string {
  switch (s) {
    case "new":
      return "Nuevo";
    case "interested":
      return "Interesado";
    case "contacted":
      return "Contactado";
    case "scheduled":
      return "Agendado";
    case "interviewed":
      return "Entrevistado";
    case "recommended":
      return "Recomendado";
    case "rejected":
      return "Rechazado";
    case "hired":
      return "Contratado";
    default:
      return s;
  }
}

export function fmtRecommendation(r: string | null | undefined): string {
  switch (r) {
    case "strong_yes":
      return "Strong yes";
    case "yes":
      return "Yes";
    case "maybe":
      return "Maybe";
    case "no":
      return "No";
    case "strong_no":
      return "Strong no";
    default:
      return "—";
  }
}

export function scoreColorClass(score: number | null | undefined): string {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 85) return "bg-emerald-600 text-white";
  if (score >= 70) return "bg-emerald-500/80 text-white";
  if (score >= 50) return "bg-amber-500 text-white";
  return "bg-destructive text-destructive-foreground";
}

export function recColorClass(r: string | null | undefined): string {
  switch (r) {
    case "strong_yes":
      return "bg-emerald-600 text-white";
    case "yes":
      return "bg-emerald-500/80 text-white";
    case "maybe":
      return "bg-amber-500 text-white";
    case "no":
    case "strong_no":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}
