// Anti-bias sanitization for any data shipped to the Candidate Ranker LLM.
// Removes signals that the agent must NEVER use as scoring features:
//   - full_name, gender, age/dob, photo URL, university.
// See docs/bias-mitigation.md for the rationale.

const NAME_PLACEHOLDER = "<CANDIDATE>";
const UNIVERSITY_PLACEHOLDER = "<UNIVERSITY>";

export type SanitizedCandidate = {
  id: string;
  email_hash: string; // first 4 chars of email + domain length, for joinability in traces
  country: string | null;
  city: string | null;
  english_cefr: string | null;
  seniority: string | null;
  summary: string;
  skills: Array<{ name: string; years_experience: number }>;
  experience: Array<{
    company: string;
    role: string;
    start: string;
    end: string | null;
    description: string;
  }>;
};

export type RawCandidateForSanitize = {
  id: string;
  full_name: string;
  email: string;
  country: string | null;
  city: string | null;
  english_cefr: string | null;
  seniority: string | null;
  gender: string | null;
  university: string | null;
  profile: {
    summary: string | null;
    skills: unknown;
    experience: unknown;
  };
};

function maskFreeText(text: string, candidate: RawCandidateForSanitize): string {
  let out = text;

  // Mask the full name and each part of it (first, last) — case-insensitive.
  const parts = candidate.full_name
    .split(/\s+/)
    .filter((p) => p.length >= 3); // ignore "de", "la"
  // Replace longest tokens first to avoid partial replacements.
  for (const part of [candidate.full_name, ...parts].sort(
    (a, b) => b.length - a.length,
  )) {
    if (!part) continue;
    const re = new RegExp(escapeRegExp(part), "gi");
    out = out.replace(re, NAME_PLACEHOLDER);
  }

  if (candidate.university) {
    out = out.replace(
      new RegExp(escapeRegExp(candidate.university), "gi"),
      UNIVERSITY_PLACEHOLDER,
    );
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function emailHash(email: string): string {
  const [local, domain] = email.split("@");
  const safeLocal = (local ?? "").slice(0, 4);
  const domainLen = (domain ?? "").length;
  return `${safeLocal}***@(len=${domainLen})`;
}

export function sanitizeCandidate(c: RawCandidateForSanitize): SanitizedCandidate {
  const skills =
    Array.isArray(c.profile.skills)
      ? (c.profile.skills as Array<{ name: string; years_experience: number }>)
      : [];
  const experienceRaw =
    Array.isArray(c.profile.experience)
      ? (c.profile.experience as Array<{
          company: string;
          role: string;
          start: string;
          end: string | null;
          description: string;
        }>)
      : [];

  const summary = c.profile.summary ? maskFreeText(c.profile.summary, c) : "";
  const experience = experienceRaw.map((e) => ({
    ...e,
    description: maskFreeText(e.description ?? "", c),
  }));

  return {
    id: c.id,
    email_hash: emailHash(c.email),
    country: c.country,
    city: c.city,
    english_cefr: c.english_cefr,
    seniority: c.seniority,
    summary,
    skills,
    experience,
  };
}
