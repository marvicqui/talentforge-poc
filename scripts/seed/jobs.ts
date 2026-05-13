import type { JobFixture } from "./types";

export const JOBS: JobFixture[] = [
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "ai-ml-engineer-lumina-labs",
    title: "Senior AI/ML Engineer (GenAI)",
    company_name: "Lumina Labs",
    modality: "remote",
    location: "Remote LATAM",
    salary_min_usd: 5500,
    salary_max_usd: 8000,
    english_min_cefr: "B2",
    description_raw: `# Senior AI/ML Engineer (GenAI) — Lumina Labs

## Sobre la empresa
Lumina Labs es una fintech LATAM con sede en Ciudad de México que opera un marketplace de crédito embebido para pequeños comercios. Procesamos +2 millones de transacciones mensuales y construimos modelos propios para scoring, anti-fraude y experiencias conversacionales con clientes finales. Series B cerrada en 2025 con Kaszek e Y Combinator.

## El reto
Estamos formando un equipo nuevo de **Applied AI** que reportará al Head of Engineering. Buscamos un Senior AI/ML Engineer con foco en GenAI para diseñar y poner en producción aplicaciones basadas en LLMs — desde asistentes internos para soporte hasta agentes que automaticen partes del onboarding de comercios. Vas a trabajar end-to-end: definir el problema, prototipar con un eval-driven mindset, construir el pipeline, ponerlo a correr en producción y medir impacto.

## Responsabilidades
- Diseñar arquitecturas RAG, fine-tuning y agentes multi-step para casos de uso de negocio reales (no demos).
- Implementar pipelines reproducibles de evaluación: golden sets, regression suites, evals automáticas con LLM-as-a-judge cuando aplique.
- Operar el stack en producción: latencia, costo, observabilidad, A/B tests.
- Colaborar con producto, riesgo y compliance para asegurar que cada feature cumple con los lineamientos regulatorios locales (CNBV, INAI).
- Mentor a 1-2 engineers junior/mid que se sumarán al equipo en Q3.

## Must-haves
- 5+ años de experiencia en software backend (Python, Go o similar) y al menos 2 años en ML/AI en producción.
- Experiencia comprobable con LLMs en producción: RAG, function-calling, agentes; familiaridad con frameworks como LangChain, LlamaIndex o equivalentes.
- Vector DBs (Pinecone, Qdrant, pgvector) y patrones de retrieval (hybrid search, re-ranking).
- Prompt engineering robusto + evaluación sistemática (no "vibes-based").
- Inglés B2+ para comunicarte con partners de Estados Unidos.

## Nice-to-haves
- Fine-tuning de modelos open-source (PyTorch, HuggingFace).
- MLOps: MLflow, Weights & Biases, BentoML, vLLM.
- Experiencia previa en fintech o industria regulada.
- Contribuciones a open source.

## Tecnología
Python 3.12, FastAPI, Postgres, Redis, Kafka, AWS (EKS, S3, Bedrock), Terraform, GitHub Actions. LLMs propietarios (Anthropic, OpenAI) + open-source (Llama 3.1, Qwen) en infra propia para casos sensibles.

## Oferta
- Salario: USD 5,500-8,000/mes bruto, según experiencia. Contrato como contractor o nómina local (preferimos nómina).
- Stock options.
- 25 días de vacaciones, viernes cortos durante el verano.
- Presupuesto de USD 2,000 anuales para aprendizaje (cursos, libros, conferencias).
- Equipo de hardware nuevo cada 3 años.

## Proceso
1. Conversación con el reclutador (30 min).
2. Entrevista técnica con un Staff Engineer del equipo (60 min).
3. Take-home corto (≤6 horas): diseñar un eval framework para un RAG.
4. Panel final con Head of Engineering + CTO (90 min): arquitectura y fit cultural.
5. Decisión en 48 horas.
`,
  },

  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "cloud-architect-azure-cresta",
    title: "Cloud Solutions Architect — Azure",
    company_name: "Cresta Digital",
    modality: "hybrid",
    location: "CDMX",
    salary_min_usd: 4500,
    salary_max_usd: 7500,
    english_min_cefr: "B2",
    description_raw: `# Cloud Solutions Architect — Azure (Cresta Digital)

## Sobre la empresa
Cresta Digital es una consultora boutique con oficinas en CDMX y Monterrey. Acompañamos a corporativos de banca, retail y manufactura en su migración a la nube. Tenemos 90 ingenieros y la práctica de Azure es nuestro pilar más fuerte: somos Microsoft Gold Partner desde 2022 con designación Specialist en Infra and Database Migration to Azure.

## El reto
Estamos creciendo el equipo de arquitectura por dos cuentas nuevas en banca regional. Buscamos un Cloud Solutions Architect Senior con foco en Azure que pueda liderar diseños end-to-end de Landing Zones, governance, networking enterprise y migraciones complejas (incluyendo mainframe-to-cloud). El rol es client-facing: diseñas, presentas el diseño al cliente, lo defiendes en comités técnicos y supervisas la implementación con tu squad.

## Responsabilidades
- Diseñar Landing Zones siguiendo Microsoft Cloud Adoption Framework.
- Liderar talleres de descubrimiento y assessments con stakeholders del cliente.
- Definir arquitecturas para identidad (Entra ID, B2B, B2C), networking (vNet hub-spoke, ExpressRoute, VPN), security (Defender for Cloud, Sentinel, Key Vault) y datos (Azure SQL, Synapse, Cosmos).
- Producir documentación técnica: HLD, LLD, runbooks operativos.
- Coachear a Cloud Engineers mid sobre IaC (Terraform, Bicep) y CI/CD.
- Contribuir a la práctica interna: artefactos reutilizables, plantillas, capacitaciones internas.

## Must-haves
- 6+ años trabajando con infraestructura cloud, mínimo 4 con Azure.
- Certificaciones AZ-104 + AZ-305 (vigentes) o equivalentes demostrables.
- Experiencia diseñando Landing Zones (CAF) en cuentas enterprise.
- Terraform y/o Bicep en producción a escala.
- Networking: hub-spoke, ExpressRoute, NSG, Application Gateway, Front Door.
- Identity: Entra ID, MFA, Conditional Access, RBAC granular.
- Inglés B2+ para clientes multinacionales y partners.

## Nice-to-haves
- AZ-400 (DevOps).
- FinOps practitioner certification.
- Experiencia con AKS productivo (no solo POC).
- Migración mainframe-to-cloud o casos de regulación bancaria estricta.

## Tecnología
Azure (todo el ecosistema), Terraform, Bicep, Azure DevOps + GitHub Actions, PowerShell, Python para scripting, Defender + Sentinel para SecOps.

## Oferta
- Salario: USD 4,500-7,500/mes según experiencia, en nómina mexicana o contractor según preferencia del candidato.
- Bono anual de hasta 15% sobre target.
- Esquema híbrido: 2 días en oficina (Polanco) + 3 días home office.
- 20 días de vacaciones + días personales.
- Presupuesto de USD 1,500/año para certificaciones.

## Proceso
1. Screening con HR (30 min).
2. Sesión técnica con un Principal Architect (75 min): arquitectura abierta, networking, identidad.
3. Caso práctico con presentación (1 semana de preparación): diseño de Landing Zone para un cliente ficticio.
4. Panel con Partner + Director de Práctica (60 min): negocio, communication style, fit.
`,
  },

  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "devops-platform-volcan",
    title: "Senior DevOps / Platform Engineer",
    company_name: "Volcán Commerce",
    modality: "remote",
    location: "Remote LATAM",
    salary_min_usd: 4000,
    salary_max_usd: 6500,
    english_min_cefr: "B1",
    description_raw: `# Senior DevOps / Platform Engineer — Volcán Commerce

## Sobre la empresa
Volcán Commerce es la plataforma de e-commerce headless detrás de +1,500 marcas DTC en LATAM. Procesamos 18 millones de pedidos al año, picos de Hot Sale arriba de 4,000 RPS y operamos en seis países. Bootstrapping desde 2020, rentables desde 2023, equipo de 60 personas.

## El reto
La plataforma corre en Kubernetes multi-tenant en GCP y AWS. Queremos consolidar nuestra Platform Team — actualmente 4 personas — y subir el listón de developer experience. Buscamos un Senior DevOps/Platform Engineer que pueda dueñizar el ciclo CI/CD, observabilidad y la golden path para los squads de producto. Esto incluye SLOs, runbooks, mejora continua de la confiabilidad y participación en oncall rotativo (1 semana cada ~8).

## Responsabilidades
- Mantener y evolucionar la plataforma Kubernetes (EKS + GKE) con foco en multi-tenancy seguro y eficiente.
- Construir herramientas internas: CLI para devs, plantillas de servicios, GitOps con ArgoCD.
- Observabilidad: Prometheus + Grafana, Loki para logs, Tempo para tracing. Definir SLOs/SLIs por servicio crítico.
- Incident response: liderar postmortems blameless, mejorar runbooks.
- CI/CD: GitHub Actions optimizados; pipelines reproducibles con cachés bien configurados.
- Mentorship de 1-2 ingenieros mid en la propia Platform Team.

## Must-haves
- 5+ años en infra/DevOps en producción, 3+ con Kubernetes.
- Terraform avanzado y Helm en producción.
- Experiencia operando observability stacks (Prometheus + Grafana mínimo).
- Linux profundo, scripting cómodo (Python o Go).
- Cultura de SRE: SLI/SLO, incident response, postmortems.
- Inglés B1+ para documentación y conferencias (no es client-facing).

## Nice-to-haves
- ArgoCD o Flux en producción.
- Experiencia previa en e-commerce, retail o industrias con picos de tráfico.
- Contribuciones a CNCF projects.
- Service mesh (Istio, Linkerd) en producción.

## Tecnología
EKS, GKE, ArgoCD, Helm, Terraform, GitHub Actions, Prometheus + Grafana + Loki + Tempo, PostgreSQL, Redis, Kafka, Cloudflare. Go y Python para herramientas internas.

## Oferta
- Salario: USD 4,000-6,500/mes bruto. Contractor o nómina local.
- Stock options.
- 22 días de vacaciones, oncall pagado.
- Equipo de hardware al ingreso + USD 500/año para upgrades.
- Presupuesto de USD 1,200/año para conferencias o cursos.

## Proceso
1. Charla con People (30 min).
2. Entrevista técnica con un Staff Platform Engineer (90 min): Kubernetes, observabilidad, troubleshooting con escenarios reales.
3. System design (60 min): diseñar un componente de la plataforma; te llevas el problema antes para reflexionarlo.
4. Conversación con el Head of Platform y un EM de squad cliente (45 min).
`,
  },

  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: "fullstack-ts-brujula",
    title: "Senior Full-Stack Engineer (TypeScript)",
    company_name: "Brújula Health",
    modality: "remote",
    location: "Remote LATAM",
    salary_min_usd: 4000,
    salary_max_usd: 6500,
    english_min_cefr: "B2",
    description_raw: `# Senior Full-Stack Engineer (TypeScript) — Brújula Health

## Sobre la empresa
Brújula Health es una healthtech LATAM que digitaliza la operación de clínicas y consultorios. Atendemos a +800 clínicas y 12,000 profesionales de salud entre México, Colombia y Chile. Producto SaaS B2B + apps de paciente. Equipo de 45 personas, ingeniería de 18. Levantamos Series A en 2024 con Quona Capital.

## El reto
Vamos a reescribir el módulo de agenda + historia clínica electrónica con un foco fuerte en performance y UX. Buscamos un Senior Full-Stack TypeScript que pueda liderar técnicamente este pedazo del producto, trabajando muy de cerca con dos product designers, una product manager y otros tres ingenieros mid. El stack es TypeScript de punta a punta — Next.js (App Router) + Node + Postgres — y nos importa la calidad del código tanto como la velocidad de entrega.

## Responsabilidades
- Diseñar e implementar features full-stack: schema de DB, API tRPC, UI accesible con Server Components donde tenga sentido.
- Definir patrones que el resto del equipo va a seguir (testing, error handling, observabilidad).
- Code review en PRs del squad; mentoring activo.
- Trabajar con product para acortar ciclos de iteración: shipping pequeño, medible, reversible.
- Participar en oncall del squad (rotación cada ~10 semanas).

## Must-haves
- 5+ años con TypeScript en producción.
- Next.js con App Router en producción, Server Components, Server Actions.
- Postgres y un ORM moderno (Prisma o Drizzle).
- Diseño de APIs: tRPC, GraphQL o REST bien hecho.
- Testing real: Jest/Vitest + Playwright o Cypress.
- Accesibilidad básica (WCAG AA) — no decorativo: lo entendés y lo aplicás.
- Inglés B2+ para colaborar con designers en SF.

## Nice-to-haves
- Tailwind + shadcn/ui en producción.
- Experiencia con healthtech, compliance HIPAA o regulación local de datos médicos.
- Performance profiling en Node y Browser DevTools.
- Monorepos con Turbo o Nx.

## Tecnología
TypeScript, Next.js (App Router), tRPC, Drizzle ORM, PostgreSQL, Tailwind + shadcn/ui, Playwright, Vercel + AWS (lambdas para jobs pesados), Sentry, Datadog.

## Oferta
- Salario: USD 4,000-6,500/mes bruto. Contractor o nómina (CL, MX, CO).
- Stock options.
- 22 días de vacaciones.
- Presupuesto USD 1,500/año para learning + un offsite anual con todo el equipo.
- Equipo de hardware al ingreso.

## Proceso
1. Conversación con People (30 min).
2. Entrevista técnica con un Senior IC (75 min): TypeScript profundo + diseño de API + edge cases UI.
3. Pair programming en vivo (90 min): pequeña feature, te damos 24 horas para revisar el repo antes.
4. Conversación de producto con la PM del squad (45 min).
5. Charla final con CTO (30 min).
`,
  },
];
