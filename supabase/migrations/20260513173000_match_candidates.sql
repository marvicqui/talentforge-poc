-- RPC para búsqueda semántica de candidatos por similitud coseno contra
-- candidate_profiles.embedding (pgvector, 1536 dim, IVF Flat).
--
-- Se llama desde el cliente con:
--   supabase.rpc("match_candidate_profiles", {
--     query_embedding: <pgvector literal>,
--     match_count: 10
--   });

create or replace function public.match_candidate_profiles(
  query_embedding vector(1536),
  match_count int default 10
)
returns table (
  candidate_id uuid,
  similarity float
)
language sql
stable
as $$
  select
    cp.candidate_id,
    1 - (cp.embedding <=> query_embedding) as similarity
  from public.candidate_profiles cp
  where cp.embedding is not null
  order by cp.embedding <=> query_embedding
  limit match_count;
$$;

-- Allow authenticated users to invoke it (matches the read-only nature).
grant execute on function public.match_candidate_profiles(vector, int) to authenticated, service_role;
