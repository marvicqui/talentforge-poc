// Shared types for the seed fixtures. The output shape mirrors the
// public.* tables in supabase/migrations/20260512230400_init.sql.

export type Modality = "remote" | "hybrid" | "onsite";
export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Seniority = "junior" | "mid" | "senior" | "staff" | "principal";
export type Stage =
  | "new"
  | "interested"
  | "contacted"
  | "scheduled"
  | "interviewed"
  | "recommended"
  | "rejected"
  | "hired";

export type JobFixture = {
  slug: string;
  title: string;
  company_name: string;
  description_raw: string;
  modality: Modality;
  location: string | null;
  salary_min_usd: number;
  salary_max_usd: number;
  english_min_cefr: Cefr;
};

export type SkillEntry = { name: string; years_experience: number };
export type ExperienceEntry = {
  company: string;
  role: string;
  start: string; // YYYY-MM
  end: string | null; // YYYY-MM or null for present
  description: string;
};

export type CandidateFixture = {
  // For the job-candidate join (which job this candidate is being considered for).
  job_slug: string;
  stage: Stage;
  full_name: string;
  email: string;
  phone_e164: string;
  linkedin_url: string;
  country: string;
  city: string;
  english_cefr: Cefr;
  seniority: Seniority;
  // Demo-only realism fields — ignored by the LLM (see docs/bias-mitigation.md).
  gender: "f" | "m" | "nb";
  university: string;
  // Profile
  summary: string;
  skills: SkillEntry[];
  experience: ExperienceEntry[];
};
