-- Migración inicial — Fase 1
-- Crea schema completo de la PoC (Sección 8 del prompt).
-- Tablas, índices IVF Flat sobre embeddings, RLS activa con policies permisivas
-- para el demo tenant.

-- ============================================================================
-- 0. Extensiones
-- ============================================================================
create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "vector";    -- pgvector
create extension if not exists "pg_trgm";   -- fuzzy search (búsqueda por skill)

-- ============================================================================
-- 1. Helper: trigger updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- 2. Tablas
-- ============================================================================

-- 2.1 tenants
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

-- 2.2 users (perfil extendido; auth.users sigue siendo la fuente de verdad)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'member' check (role in ('owner','admin','member','guest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_tenant on public.users(tenant_id);
create trigger trg_users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

-- 2.3 jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  company_name text not null,
  description_raw text not null,
  parsed_jd jsonb,
  ideal_profile jsonb,
  embedding vector(1536),
  status text not null default 'active' check (status in ('draft','active','paused','closed')),
  modality text not null check (modality in ('remote','hybrid','onsite')),
  location text,
  salary_min_usd integer,
  salary_max_usd integer,
  english_min_cefr text check (english_min_cefr in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_jobs_tenant on public.jobs(tenant_id);
create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_jobs_embedding on public.jobs
  using ivfflat (embedding vector_cosine_ops) with (lists = 10);
create trigger trg_jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

-- 2.4 candidates
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone_e164 text,
  linkedin_url text,
  country text,
  city text,
  english_cefr text check (english_cefr in ('A1','A2','B1','B2','C1','C2')),
  seniority text check (seniority in ('junior','mid','senior','staff','principal')),
  -- Campos sólo para realismo del demo. Sanitizados antes de pasar al LLM
  -- (ver packages/agents/rankers/sanitize.ts y docs/bias-mitigation.md).
  gender text,
  university text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);
create index if not exists idx_candidates_tenant on public.candidates(tenant_id);
create trigger trg_candidates_updated_at before update on public.candidates
  for each row execute function public.set_updated_at();

-- 2.5 candidate_profiles
create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.candidates(id) on delete cascade,
  summary text,
  skills jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_candidate_profiles_embedding on public.candidate_profiles
  using ivfflat (embedding vector_cosine_ops) with (lists = 10);
create trigger trg_candidate_profiles_updated_at before update on public.candidate_profiles
  for each row execute function public.set_updated_at();

-- 2.6 applications (relación candidato↔vacante con scoring)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  match_score numeric(5,2),
  match_breakdown jsonb,
  match_reasoning text,
  stage text not null default 'new' check (stage in (
    'new','interested','contacted','scheduled','interviewed','recommended','rejected','hired'
  )),
  status text not null default 'open' check (status in ('open','paused','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);
create index if not exists idx_applications_tenant on public.applications(tenant_id);
create index if not exists idx_applications_job on public.applications(job_id);
create index if not exists idx_applications_candidate on public.applications(candidate_id);
create index if not exists idx_applications_stage on public.applications(stage);
create trigger trg_applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

-- 2.7 conversations (hilos de Twilio por candidato)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','email','sms')),
  state text not null default 'open' check (state in ('open','awaiting_reply','closed')),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_conversations_tenant on public.conversations(tenant_id);
create index if not exists idx_conversations_candidate on public.conversations(candidate_id);
create trigger trg_conversations_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

-- 2.8 outreach_messages
create table if not exists public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('outbound','inbound')),
  channel text not null default 'whatsapp' check (channel in ('whatsapp','email','sms')),
  content text not null,
  status text not null default 'queued' check (status in (
    'queued','sent','delivered','read','failed','simulated','received'
  )),
  twilio_sid text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_outreach_messages_conversation on public.outreach_messages(conversation_id);
create index if not exists idx_outreach_messages_twilio_sid on public.outreach_messages(twilio_sid);
create trigger trg_outreach_messages_updated_at before update on public.outreach_messages
  for each row execute function public.set_updated_at();

-- 2.9 interviews
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  scheduled_at timestamptz,
  duration_minutes integer,
  status text not null default 'scheduled' check (status in (
    'scheduled','in_progress','completed','no_show','cancelled'
  )),
  transcript_id uuid,  -- FK se agrega más abajo (forward reference)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_interviews_tenant on public.interviews(tenant_id);
create index if not exists idx_interviews_candidate on public.interviews(candidate_id);
create index if not exists idx_interviews_job on public.interviews(job_id);
create trigger trg_interviews_updated_at before update on public.interviews
  for each row execute function public.set_updated_at();

-- 2.10 transcripts
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null unique references public.interviews(id) on delete cascade,
  language text not null default 'es' check (language in ('es','en','mixed')),
  segments jsonb not null default '[]'::jsonb,
  raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_transcripts_updated_at before update on public.transcripts
  for each row execute function public.set_updated_at();

-- FK desde interviews.transcript_id (se agrega aquí porque hay dependencia circular)
alter table public.interviews
  add constraint interviews_transcript_id_fkey
  foreign key (transcript_id) references public.transcripts(id) on delete set null;

-- 2.11 interview_reports
create table if not exists public.interview_reports (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null unique references public.interviews(id) on delete cascade,
  english_level text check (english_level in ('A1','A2','B1','B2','C1','C2')),
  english_breakdown jsonb,
  technical_score jsonb,
  softskill_score jsonb,
  red_flags jsonb default '[]'::jsonb,
  strengths jsonb default '[]'::jsonb,
  summary text,
  recommendation text check (recommendation in ('strong_yes','yes','maybe','no','strong_no')),
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_interview_reports_updated_at before update on public.interview_reports
  for each row execute function public.set_updated_at();

-- 2.12 agent_traces
create table if not exists public.agent_traces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  agent text not null,
  ref_table text,
  ref_id uuid,
  input_redacted jsonb,
  output jsonb,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(10,6),
  status text not null default 'ok' check (status in ('ok','error','timeout')),
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists idx_agent_traces_agent on public.agent_traces(agent);
create index if not exists idx_agent_traces_tenant_created on public.agent_traces(tenant_id, created_at desc);

-- ============================================================================
-- 3. RLS — policies simples para PoC
-- ============================================================================
-- Estrategia: cualquier usuario autenticado puede leer todo dentro del tenant demo.
-- Writes pasan por service_role (server actions/seeds) que bypassa RLS.
-- Multi-tenancy hardened queda fuera de scope (ver docs/roadmap-v2.md).

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'tenants','users','jobs','candidates','candidate_profiles',
      'applications','conversations','outreach_messages','interviews',
      'transcripts','interview_reports','agent_traces'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'drop policy if exists "%s_select_authenticated" on public.%I',
      t, t
    );
    execute format(
      'create policy "%s_select_authenticated" on public.%I for select to authenticated using (true)',
      t, t
    );
  end loop;
end $$;

-- ============================================================================
-- 4. Seed mínimo: tenant demo
-- ============================================================================
insert into public.tenants (id, slug, name)
values ('00000000-0000-0000-0000-000000000001', 'demo', 'TalentForge Demo')
on conflict (slug) do nothing;
