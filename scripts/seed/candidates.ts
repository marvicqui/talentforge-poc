import type { CandidateFixture } from "./types";

// 30 candidates distributed per Section 7.2 of the prompt:
//   Job 1 (AI/ML)     — 8 candidates
//   Job 2 (Azure)     — 7 candidates
//   Job 3 (DevOps)    — 8 candidates
//   Job 4 (Full-Stack)— 7 candidates
// Each candidate has a summary, 8-15 skills with years_experience, and 3-5
// experience entries. Genders are mixed; demo-only realism fields (name,
// gender, university) are stored but the Candidate Ranker wrapper redacts
// them before any LLM call (see docs/bias-mitigation.md).

export const CANDIDATES: CandidateFixture[] = [
  // ════════════════════════════════════════════════════════════════════════
  // JOB 1 — Senior AI/ML Engineer (GenAI) @ Lumina Labs
  //   Distribución: 2 mid, 4 senior, 2 staff
  //   CEFR: 1 A2, 2 B1, 2 B2, 2 C1, 1 C2
  //   Stages: 3 recommended, 1 interviewed, 2 scheduled, 1 interested, 1 new
  // ════════════════════════════════════════════════════════════════════════
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "recommended",
    full_name: "Mariana Castillo Vargas",
    email: "mariana.castillo@protonmail.com",
    phone_e164: "+525551234567",
    linkedin_url: "https://www.linkedin.com/in/mariana-castillo-vargas-ml/",
    country: "MX",
    city: "Ciudad de México",
    english_cefr: "C1",
    seniority: "staff",
    gender: "f",
    university: "ITAM",
    summary:
      "Staff AI Engineer con 8 años de experiencia construyendo sistemas ML en producción para fintechs de LATAM. Lideró el equipo de credit scoring en Konfío durante 4 años, donde diseñó pipelines de feature engineering y un sistema de model registry interno antes de que MLflow fuera estándar. Los últimos 18 meses ha dirigido tres iniciativas de GenAI en una fintech mid-size: un asistente de cobranza con RAG sobre conversaciones históricas, un agente que clasifica disputas de chargeback con function-calling y evaluation suite propia con 1,200 ejemplos golden. Migró el stack de LangChain a LangGraph cuando el equipo creció a 5 ingenieros porque la observabilidad de los pasos del agente se volvió crítica. Tiene opiniones fuertes sobre evals — escribió un blogpost interno sobre 'LLM-as-a-judge gotchas' que se compartió como onboarding doc. Habla inglés C1, ha presentado en MLOps World 2024 y MLOps Mexico City. Busca un equipo donde pueda combinar trabajo IC profundo con mentoring; le motiva fintech porque hay restricciones de costo, latencia y compliance que filtran las soluciones serias de las decorativas.",
    skills: [
      { name: "Python", years_experience: 8 },
      { name: "PyTorch", years_experience: 6 },
      { name: "LangChain", years_experience: 2 },
      { name: "LangGraph", years_experience: 1 },
      { name: "RAG", years_experience: 2 },
      { name: "Pinecone", years_experience: 2 },
      { name: "pgvector", years_experience: 1 },
      { name: "MLflow", years_experience: 5 },
      { name: "FastAPI", years_experience: 6 },
      { name: "Kubernetes", years_experience: 4 },
      { name: "LLM evaluation", years_experience: 2 },
      { name: "Prompt engineering", years_experience: 2 },
    ],
    experience: [
      {
        company: "Klar (fintech)",
        role: "Staff AI Engineer",
        start: "2024-06",
        end: null,
        description:
          "Lidera la práctica de GenAI: 3 sistemas en producción (asistente de cobranza con RAG, clasificación de disputas, generación de resúmenes para analistas). Definió el eval framework y el playbook de incident response para LLMs.",
      },
      {
        company: "Konfío",
        role: "Senior ML Engineer → Tech Lead Credit Risk",
        start: "2020-03",
        end: "2024-05",
        description:
          "Construyó el sistema de credit scoring v2 sobre XGBoost + features de bureau. Diseñó pipelines reproducibles y un model registry interno antes de adoptar MLflow.",
      },
      {
        company: "Wizeline",
        role: "Data Scientist",
        start: "2017-08",
        end: "2020-02",
        description:
          "Proyectos de NLP clásico para clientes enterprise: clasificación de tickets, extracción de entidades.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "recommended",
    full_name: "Diego Salazar Mendoza",
    email: "d.salazar.mendoza@gmail.com",
    phone_e164: "+523312345678",
    linkedin_url: "https://www.linkedin.com/in/diego-salazar-mendoza/",
    country: "MX",
    city: "Guadalajara",
    english_cefr: "B2",
    seniority: "senior",
    gender: "m",
    university: "Tec de Monterrey campus Guadalajara",
    summary:
      "Senior AI Engineer con 6 años de experiencia, los últimos 2 enfocado en GenAI productivo. Trabajó en Wizeline como Senior ML Engineer en un equipo que entregó tres proyectos RAG para clientes US: uno de support automation para una compañía de SaaS, uno de doc Q&A para una farmacéutica y uno híbrido (RAG + tools) para un retailer. Tiene un pragmatismo notable: prefiere pgvector sobre Pinecone cuando la escala lo permite, y considera que el hype de agentes auto-recursivos suele esconder problemas reales de retrieval. Antes de Wizeline trabajó dos años en una startup donde fine-tuneó un modelo BERT para clasificación de sentiment en español; aprendió la diferencia entre fine-tuning útil y fine-tuning como cargo cult. Es contributor menor de LlamaIndex (3 PRs mergeadas). Su inglés B2 le alcanza para reuniones técnicas — escribir documentos formales le toma más tiempo. Busca un rol donde pueda ownear un sistema de inicio a fin sin tantos clientes simultáneos.",
    skills: [
      { name: "Python", years_experience: 6 },
      { name: "LangChain", years_experience: 2 },
      { name: "LlamaIndex", years_experience: 2 },
      { name: "RAG", years_experience: 2 },
      { name: "pgvector", years_experience: 2 },
      { name: "Qdrant", years_experience: 1 },
      { name: "PyTorch", years_experience: 3 },
      { name: "HuggingFace", years_experience: 3 },
      { name: "FastAPI", years_experience: 4 },
      { name: "Docker", years_experience: 5 },
      { name: "AWS Bedrock", years_experience: 1 },
    ],
    experience: [
      {
        company: "Wizeline",
        role: "Senior ML Engineer",
        start: "2022-09",
        end: null,
        description:
          "3 proyectos RAG client-facing. Definió plantillas reusables internas para evaluación con golden sets de cliente.",
      },
      {
        company: "Devot (startup)",
        role: "ML Engineer",
        start: "2020-05",
        end: "2022-08",
        description:
          "Fine-tuning de BERT español para sentiment + sistema de clasificación de tickets en producción.",
      },
      {
        company: "Tata Consultancy Services",
        role: "Data Engineer",
        start: "2018-06",
        end: "2020-04",
        description:
          "Pipelines ETL en Spark para un cliente del sector retail.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "recommended",
    full_name: "Camila Fernández Aguirre",
    email: "camila.fernandez.aguirre@gmail.com",
    phone_e164: "+541145678901",
    linkedin_url: "https://www.linkedin.com/in/camila-fernandez-aguirre/",
    country: "AR",
    city: "Buenos Aires",
    english_cefr: "B1",
    seniority: "senior",
    gender: "f",
    university: "Universidad de Buenos Aires (UBA)",
    summary:
      "Senior AI Engineer con 5 años de experiencia. Llegó a GenAI desde data engineering: pasó dos años en Mercado Libre construyendo pipelines de feature store para modelos de recomendación, y los últimos 2 años en una startup de Buenos Aires especializada en assistants conversacionales para customer support. Su fortaleza es la sistematización de evaluations — armó un harness propio en Python que corre 4 tipos de eval (regresión, factuality LLM-judge, latencia P99, costo) en CI/CD. Tiene experiencia con LangSmith para tracing y opinión clara sobre cuándo agregar memory a un agente (rara vez). No tiene experiencia con fine-tuning más allá de tutoriales; lo declara honestamente. Su inglés B1 funciona bien en escrito y mensajes async, pero en reuniones largas se cansa. Busca empresas donde la calidad del evaluation sea un valor real, no un checkbox.",
    skills: [
      { name: "Python", years_experience: 5 },
      { name: "LangChain", years_experience: 2 },
      { name: "LangSmith", years_experience: 1 },
      { name: "RAG", years_experience: 2 },
      { name: "OpenAI API", years_experience: 2 },
      { name: "Anthropic API", years_experience: 1 },
      { name: "pgvector", years_experience: 1 },
      { name: "LLM evaluation", years_experience: 2 },
      { name: "Airflow", years_experience: 3 },
      { name: "PostgreSQL", years_experience: 4 },
    ],
    experience: [
      {
        company: "Botzilla (startup)",
        role: "Senior ML Engineer",
        start: "2023-02",
        end: null,
        description:
          "Asistente conversacional B2B con foco en customer support. Diseñó el harness de evals que corre en cada PR.",
      },
      {
        company: "Mercado Libre",
        role: "Data Engineer → ML Engineer",
        start: "2021-01",
        end: "2023-01",
        description:
          "Feature store para modelos de recomendación. Aprendió a operar pipelines a escala (decenas de millones de eventos/día).",
      },
      {
        company: "Globant",
        role: "Data Engineer Junior",
        start: "2019-06",
        end: "2020-12",
        description:
          "Proyectos cliente: ETLs y dashboards en Looker.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "interviewed",
    full_name: "Ricardo Pinheiro Alves",
    email: "ricardo.pinheiro@outlook.com",
    phone_e164: "+5511987654321",
    linkedin_url: "https://www.linkedin.com/in/ricardo-pinheiro-alves/",
    country: "BR",
    city: "São Paulo",
    english_cefr: "C2",
    seniority: "staff",
    gender: "m",
    university: "Universidade de São Paulo (USP)",
    summary:
      "Staff/Principal AI Engineer con 10 años de experiencia, doctorado en ciencias de la computación con tesis en aprendizaje por refuerzo. Trabajó en Itaú como Tech Lead del equipo de NLP durante 3 años, donde construyó sistemas para extracción de información en contratos jurídicos. Los últimos 3 años en Nubank, primero como Senior y promovido a Staff en 18 meses: lideró el equipo de risk-modeling que aplicó GenAI para auditoría de decisiones de modelos opacos. Su inglés es nativo (vivió 4 años en Estados Unidos durante el doctorado). Tiene gusto por presentar arquitecturas a audiencias técnicas y no técnicas; ha dado charlas en Strata y Big Data LDN. Su preocupación con muchos roles que ve en LATAM es la falta de profundidad técnica en el equipo de pares; busca un lugar donde haya al menos otros 2-3 Staff con quienes intercambiar feedback duro.",
    skills: [
      { name: "Python", years_experience: 10 },
      { name: "PyTorch", years_experience: 7 },
      { name: "TensorFlow", years_experience: 5 },
      { name: "LangChain", years_experience: 2 },
      { name: "RAG", years_experience: 2 },
      { name: "Fine-tuning", years_experience: 4 },
      { name: "HuggingFace", years_experience: 4 },
      { name: "MLflow", years_experience: 4 },
      { name: "Weights & Biases", years_experience: 3 },
      { name: "Kubernetes", years_experience: 5 },
      { name: "vLLM", years_experience: 1 },
    ],
    experience: [
      {
        company: "Nubank",
        role: "Senior → Staff AI Engineer",
        start: "2022-04",
        end: null,
        description:
          "Lidera workstream de risk modeling con GenAI. Promovido a Staff en 18 meses.",
      },
      {
        company: "Itaú Unibanco",
        role: "Tech Lead NLP",
        start: "2019-01",
        end: "2022-03",
        description:
          "Extracción de información en contratos. Equipo de 6 personas.",
      },
      {
        company: "USP — doctorado",
        role: "PhD Researcher",
        start: "2015-03",
        end: "2018-12",
        description:
          "Tesis en RL aplicado a robótica. Estancia de 1 año en Carnegie Mellon.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "scheduled",
    full_name: "Andrés Torres Quintero",
    email: "atorresq@hey.com",
    phone_e164: "+5713456789",
    linkedin_url: "https://www.linkedin.com/in/andres-torres-quintero/",
    country: "CO",
    city: "Bogotá",
    english_cefr: "C1",
    seniority: "senior",
    gender: "m",
    university: "Universidad de los Andes",
    summary:
      "Senior AI Engineer con 6 años de experiencia. Comenzó como backend engineer (3 años en Rappi) y migró a ML cuando se sumó al equipo de logística predictiva: forecasting de demanda y routing. Los últimos 2.5 años ha trabajado en un consultora pequeña de Bogotá especializada en GenAI para retail, con clientes en Colombia y Perú. Su perfil es muy producto-céntrico: empuja por hacer A/B tests rigurosos y aborrece los demos que no se traducen en métricas. Tiene buena experiencia con prompt engineering en español neutro (clave para LATAM) y ha entrenado a reclutadores no técnicos en cómo armar golden sets útiles. Su inglés C1 es sólido. Busca un equipo más grande para crecer hacia un rol de Staff; le seducen las fintechs con problemas de scoring que combinen lo clásico (XGBoost) con LLMs.",
    skills: [
      { name: "Python", years_experience: 6 },
      { name: "LangChain", years_experience: 2 },
      { name: "OpenAI API", years_experience: 2 },
      { name: "Anthropic API", years_experience: 1 },
      { name: "XGBoost", years_experience: 4 },
      { name: "scikit-learn", years_experience: 5 },
      { name: "FastAPI", years_experience: 4 },
      { name: "Docker", years_experience: 5 },
      { name: "GCP Vertex AI", years_experience: 2 },
      { name: "Prompt engineering", years_experience: 2 },
    ],
    experience: [
      {
        company: "Foundry AI (consultora)",
        role: "Senior ML Engineer",
        start: "2023-01",
        end: null,
        description:
          "Proyectos GenAI para retail en Colombia y Perú. Tech lead de 2 ingenieros junior.",
      },
      {
        company: "Rappi",
        role: "Backend Engineer → ML Engineer",
        start: "2020-04",
        end: "2022-12",
        description:
          "Equipo de logística predictiva: forecasting de demanda, ETA prediction.",
      },
      {
        company: "Globant",
        role: "Backend Developer",
        start: "2018-09",
        end: "2020-03",
        description:
          "Microservicios en Node.js para clientes US.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "scheduled",
    full_name: "Lucía Mamani Quispe",
    email: "lucia.mamani@gmail.com",
    phone_e164: "+51998765432",
    linkedin_url: "https://www.linkedin.com/in/lucia-mamani-quispe-ai/",
    country: "PE",
    city: "Lima",
    english_cefr: "B2",
    seniority: "mid",
    gender: "f",
    university: "Universidad Nacional de Ingeniería (Lima)",
    summary:
      "Mid AI Engineer con 4 años de experiencia. Estudió ingeniería de sistemas en la UNI Lima y trabajó dos años en una consultora local antes de unirse a Yape (BCP) en 2022, donde está actualmente como ML Engineer en el equipo de risk. Trabaja con XGBoost para credit scoring y desde hace 8 meses se sumó al esfuerzo de GenAI para automatizar el análisis de explicaciones de modelos. Tiene mucha curiosidad y aprende rápido: aprendió LangChain en un mes para un proyecto interno y ya tiene una librería propia de patrones reusables. Su inglés B2 es bueno; consume contenido técnico en inglés todos los días pero a veces siente que los hablantes nativos rápidos le complican. Busca crecer a Senior en un equipo donde haya mentorship técnico real (no solo Slack); su prioridad es desarrollo profesional sobre salario.",
    skills: [
      { name: "Python", years_experience: 4 },
      { name: "LangChain", years_experience: 1 },
      { name: "RAG", years_experience: 1 },
      { name: "XGBoost", years_experience: 3 },
      { name: "scikit-learn", years_experience: 4 },
      { name: "FastAPI", years_experience: 3 },
      { name: "Docker", years_experience: 3 },
      { name: "PostgreSQL", years_experience: 3 },
      { name: "AWS SageMaker", years_experience: 2 },
    ],
    experience: [
      {
        company: "Yape (BCP)",
        role: "ML Engineer",
        start: "2022-09",
        end: null,
        description:
          "Credit scoring models y, desde 2024, GenAI para explicabilidad y análisis de outputs de modelos.",
      },
      {
        company: "Sapia Consultores",
        role: "Data Analyst → Junior ML Engineer",
        start: "2020-07",
        end: "2022-08",
        description:
          "Proyectos client-facing: dashboards y modelos sencillos de churn.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "interested",
    full_name: "Sebastián Aguilar Reyes",
    email: "seb.aguilar@duck.com",
    phone_e164: "+524422345678",
    linkedin_url: "https://www.linkedin.com/in/sebastian-aguilar-reyes-ai/",
    country: "MX",
    city: "Querétaro",
    english_cefr: "B1",
    seniority: "mid",
    gender: "m",
    university: "Universidad Autónoma de Querétaro",
    summary:
      "Mid ML Engineer con 4 años de experiencia. Empezó como backend Python en una empresa local de logística (3 años) y se cambió a ML hace 14 meses al unirse a una startup de Querétaro que trabaja con visión computacional para retail. Allí construyó pipelines de inferencia para detección de productos en góndola usando YOLOv8. Recientemente exploró RAG por curiosidad propia con un side-project que indexa la documentación de la empresa con pgvector + GPT-4o-mini; lo presentó en una lightning talk interna. Su inglés B1 es lo más débil de su perfil: lee bien pero le cuesta hablar en reuniones largas. Está abiertamente buscando subir a una compañía más grande donde haya seniors fuertes que lo empujen; no le importa si arranca como mid mientras haya camino claro.",
    skills: [
      { name: "Python", years_experience: 4 },
      { name: "PyTorch", years_experience: 1 },
      { name: "YOLO/computer vision", years_experience: 1 },
      { name: "LangChain", years_experience: 1 },
      { name: "RAG", years_experience: 1 },
      { name: "pgvector", years_experience: 1 },
      { name: "FastAPI", years_experience: 3 },
      { name: "Docker", years_experience: 4 },
      { name: "PostgreSQL", years_experience: 4 },
    ],
    experience: [
      {
        company: "Visiona (startup)",
        role: "ML Engineer",
        start: "2024-04",
        end: null,
        description:
          "Pipelines de inferencia para visión computacional en retail.",
      },
      {
        company: "ShipLogic",
        role: "Backend Engineer",
        start: "2021-05",
        end: "2024-03",
        description:
          "APIs Python (Flask y FastAPI), automatización de procesos logísticos.",
      },
    ],
  },
  {
    job_slug: "ai-ml-engineer-lumina-labs",
    stage: "new",
    full_name: "Elena Romero Aguirre",
    email: "elenaromeroa@gmail.com",
    phone_e164: "+528112345678",
    linkedin_url: "https://www.linkedin.com/in/elena-romero-aguirre/",
    country: "MX",
    city: "Monterrey",
    english_cefr: "A2",
    seniority: "senior",
    gender: "f",
    university: "Tec de Monterrey",
    summary:
      "Senior ML Engineer con 7 años de experiencia, casi toda en Tec de Monterrey como Investigadora y luego en una spinoff de la misma universidad enfocada en analítica de manufactura. Ha publicado 4 papers en conferencias regionales sobre detección de anomalías en líneas de producción. Su exposición a GenAI llegó tarde: empezó hace 6 meses con un piloto interno usando OpenAI API. No tiene experiencia profunda con RAG en producción, pero su matemática es muy sólida y su comprensión de evals es transferible. El cuello de botella claro de su perfil es el inglés: A2, apenas funcional para leer documentación. Sería necesario que el equipo aceptara comunicación principalmente en español o que ella se comprometa a un plan de mejora con clases. Busca cambio porque su empresa actual no va a invertir más en GenAI y ella sí quiere construir en esa dirección.",
    skills: [
      { name: "Python", years_experience: 7 },
      { name: "scikit-learn", years_experience: 6 },
      { name: "PyTorch", years_experience: 4 },
      { name: "OpenAI API", years_experience: 1 },
      { name: "Statistical modeling", years_experience: 7 },
      { name: "FastAPI", years_experience: 3 },
      { name: "PostgreSQL", years_experience: 4 },
      { name: "Docker", years_experience: 3 },
    ],
    experience: [
      {
        company: "ManuAI (spinoff Tec)",
        role: "Senior ML Engineer",
        start: "2021-08",
        end: null,
        description:
          "Detección de anomalías en líneas de manufactura; piloto GenAI para clasificación de incidentes (2024).",
      },
      {
        company: "Tec de Monterrey — investigación",
        role: "Investigadora Asociada",
        start: "2018-03",
        end: "2021-07",
        description:
          "Investigación aplicada en analítica de manufactura. 4 papers en conferencias regionales.",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // JOB 2 — Cloud Solutions Architect Azure @ Cresta Digital
  //   Distribución: 2 mid, 4 senior, 1 principal
  //   CEFR: 1 B1, 2 B2, 3 C1, 1 C2
  //   Stages: 3 recommended, 1 interviewed, 1 scheduled, 1 contacted, 1 new
  // ════════════════════════════════════════════════════════════════════════
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "recommended",
    full_name: "Patricia Velasco Ortiz",
    email: "pat.velasco@protonmail.com",
    phone_e164: "+525544556677",
    linkedin_url: "https://www.linkedin.com/in/patricia-velasco-ortiz/",
    country: "MX",
    city: "Ciudad de México",
    english_cefr: "C1",
    seniority: "principal",
    gender: "f",
    university: "Instituto Politécnico Nacional",
    summary:
      "Principal Cloud Architect con 11 años de experiencia, 7 en Azure. Pasó 5 años en Accenture liderando migraciones para clientes financieros mexicanos (Banorte, GFInbursa, Inbursa Seguros), y los últimos 3 años en BBVA México como Lead Architect de la práctica interna. Tiene experiencia diseñando Landing Zones para 15+ clientes según CAF, incluyendo escenarios complejos con ExpressRoute, federación de identidades B2B/B2C y multi-suscripción policy-driven con Azure Policy. Co-escribió las plantillas internas de Terraform de BBVA que hoy usan 4 equipos. Certificada AZ-104, AZ-305, AZ-400 (todas vigentes 2024) y SC-100. Su inglés C1 es robusto — presenta en comités técnicos con clientes US. Busca volver a la consultoría porque extraña la variedad de problemas y porque quiere construir una práctica con más libertad de diseño que en una banca.",
    skills: [
      { name: "Azure", years_experience: 7 },
      { name: "Terraform", years_experience: 5 },
      { name: "Bicep", years_experience: 3 },
      { name: "Landing Zones (CAF)", years_experience: 5 },
      { name: "Entra ID", years_experience: 6 },
      { name: "ExpressRoute", years_experience: 4 },
      { name: "AKS", years_experience: 3 },
      { name: "Azure Policy", years_experience: 5 },
      { name: "Defender for Cloud", years_experience: 3 },
      { name: "Sentinel", years_experience: 2 },
      { name: "FinOps", years_experience: 2 },
    ],
    experience: [
      {
        company: "BBVA México",
        role: "Lead Cloud Architect",
        start: "2021-09",
        end: null,
        description:
          "Liderazgo de práctica interna Azure. Plantillas Terraform reutilizadas en 4 equipos.",
      },
      {
        company: "Accenture",
        role: "Senior Cloud Consultant → Architect",
        start: "2016-06",
        end: "2021-08",
        description:
          "5 años de migraciones financieras. Banorte, GFInbursa, Inbursa Seguros.",
      },
      {
        company: "Softtek",
        role: "Cloud Engineer",
        start: "2013-04",
        end: "2016-05",
        description:
          "Migraciones a Azure cuando Azure era aún temprano en LATAM.",
      },
    ],
  },
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "recommended",
    full_name: "Felipe Cuevas Larraín",
    email: "felipe.cuevas.l@gmail.com",
    phone_e164: "+56987654321",
    linkedin_url: "https://www.linkedin.com/in/felipe-cuevas-larrain/",
    country: "CL",
    city: "Santiago",
    english_cefr: "C2",
    seniority: "senior",
    gender: "m",
    university: "Pontificia Universidad Católica de Chile",
    summary:
      "Senior Cloud Architect con 7 años de experiencia, todos en Microsoft y partners. Trabajó 4 años en Microsoft Consulting Services Chile como Cloud Solution Architect, donde acompañó migraciones de retail y banca. Los últimos 3 años en una consultora boutique que él co-fundó y vendió en 2024. Su inglés es bilingüe nativo — estudió secundaria en Australia. Está certificado AZ-104 + AZ-305 + AZ-400 + AZ-500 (todas vigentes). Su firma técnica es diseños extremadamente bien documentados, casi obsesivos con HLD/LLD, y un enfoque pragmático sobre cuándo no usar AKS (prefiere App Service para muchos workloads). Quiere volver a la consultoría grande con cuentas regionales LATAM porque su experiencia chilena se siente saturada para él.",
    skills: [
      { name: "Azure", years_experience: 7 },
      { name: "Terraform", years_experience: 5 },
      { name: "Bicep", years_experience: 4 },
      { name: "Landing Zones (CAF)", years_experience: 5 },
      { name: "AKS", years_experience: 4 },
      { name: "Entra ID", years_experience: 6 },
      { name: "Azure DevOps", years_experience: 5 },
      { name: "GitHub Actions", years_experience: 3 },
      { name: "Sentinel", years_experience: 2 },
      { name: "Cost Management/FinOps", years_experience: 3 },
    ],
    experience: [
      {
        company: "CloudCraft Consulting (co-founder)",
        role: "Principal Cloud Architect",
        start: "2021-04",
        end: "2024-12",
        description:
          "Co-fundador. Vendida a una consultora mid en 2024. Clientes retail y banca regional.",
      },
      {
        company: "Microsoft Consulting Services Chile",
        role: "Cloud Solution Architect",
        start: "2017-03",
        end: "2021-03",
        description:
          "Migraciones a Azure para retail y banca. Mentor de la práctica regional.",
      },
    ],
  },
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "recommended",
    full_name: "Roberto Núñez Acevedo",
    email: "roberto.nunez.a@outlook.com",
    phone_e164: "+5742345678",
    linkedin_url: "https://www.linkedin.com/in/roberto-nunez-acevedo/",
    country: "CO",
    city: "Medellín",
    english_cefr: "C1",
    seniority: "senior",
    gender: "m",
    university: "Universidad EAFIT",
    summary:
      "Senior Cloud Architect con 6 años en Azure, principalmente del lado banca colombiana. Trabajó 4 años en Bancolombia diseñando arquitecturas para canales digitales y los últimos 2 en una fintech regional (Movii) donde lidera la práctica de plataforma. Tiene fuerte experiencia con AKS productivo (no solo POC) y con migración mainframe-to-cloud por un proyecto Cobol → Azure que duró 14 meses. Certificado AZ-104 + AZ-305 (vigentes) y trabajando hacia AZ-400. Su inglés C1 funciona muy bien en reuniones; presenta en banca con confianza. Busca volver a consultoría para tener variedad y crecer hacia un rol Principal.",
    skills: [
      { name: "Azure", years_experience: 6 },
      { name: "Terraform", years_experience: 4 },
      { name: "Bicep", years_experience: 2 },
      { name: "Landing Zones (CAF)", years_experience: 4 },
      { name: "AKS", years_experience: 4 },
      { name: "Mainframe migration", years_experience: 1 },
      { name: "Entra ID", years_experience: 5 },
      { name: "Azure DevOps", years_experience: 5 },
      { name: "Defender for Cloud", years_experience: 3 },
      { name: "ExpressRoute", years_experience: 3 },
    ],
    experience: [
      {
        company: "Movii (fintech)",
        role: "Lead Platform Architect",
        start: "2023-02",
        end: null,
        description:
          "Liderazgo de práctica de plataforma. Cuentas con OpenBanking BCRA.",
      },
      {
        company: "Bancolombia",
        role: "Cloud Architect",
        start: "2019-05",
        end: "2023-01",
        description:
          "Canales digitales. Proyecto mainframe Cobol → Azure (14 meses).",
      },
      {
        company: "Sofka Technologies",
        role: "DevOps Engineer",
        start: "2017-08",
        end: "2019-04",
        description:
          "Pipelines CI/CD para clientes US.",
      },
    ],
  },
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "interviewed",
    full_name: "Adriana Solís Pérez",
    email: "adriana.solis.pz@gmail.com",
    phone_e164: "+523322112233",
    linkedin_url: "https://www.linkedin.com/in/adriana-solis-perez/",
    country: "MX",
    city: "Guadalajara",
    english_cefr: "B2",
    seniority: "senior",
    gender: "f",
    university: "Universidad de Guadalajara",
    summary:
      "Senior Cloud Engineer/Architect con 6 años en Azure. Trabajó 3 años en Wizeline en la práctica de cloud y los últimos 3 en una corporación manufacturera en GDL como Lead Cloud Architect. Tiene experiencia construyendo Landing Zones con CAF para varios negocios de la corporación. Su área más sólida es networking enterprise y compliance; tiene menos exposición a AKS productivo (sólo proyectos pequeños) y eso lo declara abiertamente. Certificada AZ-104 y AZ-305 (vigentes). Su inglés B2 es funcional para reuniones técnicas pero le cuesta cuando los clientes son hablantes nativos rápidos. Buscó este rol porque quiere volver a consultoría para ver más industrias.",
    skills: [
      { name: "Azure", years_experience: 6 },
      { name: "Terraform", years_experience: 4 },
      { name: "Bicep", years_experience: 2 },
      { name: "Landing Zones (CAF)", years_experience: 3 },
      { name: "Entra ID", years_experience: 5 },
      { name: "ExpressRoute", years_experience: 4 },
      { name: "Azure Policy", years_experience: 4 },
      { name: "AKS", years_experience: 1 },
      { name: "Defender for Cloud", years_experience: 2 },
    ],
    experience: [
      {
        company: "Grupo Industrial Tepeyac",
        role: "Lead Cloud Architect",
        start: "2022-01",
        end: null,
        description:
          "Landing Zones para 4 unidades de negocio. Migración progresiva de SAP on-prem a Azure.",
      },
      {
        company: "Wizeline",
        role: "Cloud Engineer → Senior",
        start: "2019-06",
        end: "2021-12",
        description:
          "Cuentas cloud Azure para clientes US y MX.",
      },
    ],
  },
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "scheduled",
    full_name: "Mauricio Ibarra León",
    email: "mauricio.ibarra@gmail.com",
    phone_e164: "+526644556677",
    linkedin_url: "https://www.linkedin.com/in/mauricio-ibarra-leon/",
    country: "MX",
    city: "Tijuana",
    english_cefr: "C1",
    seniority: "senior",
    gender: "m",
    university: "CETYS Universidad",
    summary:
      "Senior Cloud Architect con 7 años en Microsoft Azure. Trabajó 5 años en empresas frontera MX/US (sector aerospace y manufactura), lo que le dio mucha exposición a contextos bilingües y a estándares de compliance (NIST 800-171, ITAR). Últimos 2 años en una consultora regional. Tiene experiencia con Landing Zones, Sentinel, Defender for Cloud y FinOps practitioner certification. Es metódico al diseñar runbooks operativos y le gusta dejar documentación que los clientes pueden mantener sin él. Certificado AZ-104 + AZ-305 + AZ-500. Su inglés C1 es muy bueno por años de trabajo con clientes US. Quiere ahora un rol con menos clientes simultáneos para profundizar.",
    skills: [
      { name: "Azure", years_experience: 7 },
      { name: "Terraform", years_experience: 5 },
      { name: "Bicep", years_experience: 3 },
      { name: "Sentinel", years_experience: 3 },
      { name: "Defender for Cloud", years_experience: 3 },
      { name: "Landing Zones (CAF)", years_experience: 4 },
      { name: "FinOps", years_experience: 2 },
      { name: "Compliance (NIST)", years_experience: 4 },
      { name: "Entra ID", years_experience: 5 },
    ],
    experience: [
      {
        company: "NorthCloud Consulting",
        role: "Senior Cloud Consultant",
        start: "2023-03",
        end: null,
        description:
          "Cuentas aerospace y manufactura frontera MX/US.",
      },
      {
        company: "Aeromex Defense (cliente)",
        role: "Cloud Engineer",
        start: "2018-08",
        end: "2023-02",
        description:
          "Equipos internos cloud para múltiples plantas; compliance NIST/ITAR.",
      },
    ],
  },
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "contacted",
    full_name: "Valeria Castaño Restrepo",
    email: "valeria.castano@hey.com",
    phone_e164: "+5715678901",
    linkedin_url: "https://www.linkedin.com/in/valeria-castano-restrepo/",
    country: "CO",
    city: "Bogotá",
    english_cefr: "B2",
    seniority: "mid",
    gender: "f",
    university: "Universidad Nacional de Colombia",
    summary:
      "Mid Cloud Engineer con 4 años de experiencia. Trabajó 2 años como engineer junior en una telco colombiana, luego se mudó a Globant donde estuvo otros 2 años en proyectos cloud para clientes US y EU. Tiene experiencia operativa con Terraform y Azure pero su exposición a diseño de Landing Zones es limitada (1 proyecto, en pareja con un Senior). Certificada AZ-104 (vigente). Está estudiando para AZ-305. Su inglés B2 es funcional pero en reuniones largas se cansa. Busca un Step-up a Senior con un equipo donde haya un Principal que la mentoree.",
    skills: [
      { name: "Azure", years_experience: 4 },
      { name: "Terraform", years_experience: 3 },
      { name: "Azure DevOps", years_experience: 3 },
      { name: "Entra ID", years_experience: 3 },
      { name: "AKS", years_experience: 1 },
      { name: "PowerShell", years_experience: 4 },
      { name: "Python", years_experience: 2 },
    ],
    experience: [
      {
        company: "Globant",
        role: "Cloud Engineer",
        start: "2022-04",
        end: null,
        description:
          "Cuentas cloud US y EU; proyecto Landing Zone en pareja con Senior.",
      },
      {
        company: "Tigo (UNE-EPM)",
        role: "Junior Cloud Engineer",
        start: "2020-07",
        end: "2022-03",
        description:
          "Operación de cloud Azure interno; pipelines CI/CD básicos.",
      },
    ],
  },
  {
    job_slug: "cloud-architect-azure-cresta",
    stage: "new",
    full_name: "Iván Mendoza Salinas",
    email: "ivan.mendoza.salinas@duck.com",
    phone_e164: "+528113344556",
    linkedin_url: "https://www.linkedin.com/in/ivan-mendoza-salinas/",
    country: "MX",
    city: "Monterrey",
    english_cefr: "B1",
    seniority: "mid",
    gender: "m",
    university: "UANL",
    summary:
      "Mid Azure Engineer con 5 años, todos en una corporación industrial MTY. Sólido en operación: día a día con Azure, escribió bastante PowerShell, configura Entra ID + Conditional Access. Pero su exposición a diseño greenfield de Landing Zones es nula — siempre heredó arquitecturas. No tiene certificaciones vigentes (las dejó vencer en 2023). Su inglés B1 es funcional para lectura y mensajes; en reuniones le cuesta. Aplicó porque quiere salir de la corporación y entrar a consultoría. Es honestamente más junior de lo que el rol busca; sería un stretch.",
    skills: [
      { name: "Azure", years_experience: 5 },
      { name: "PowerShell", years_experience: 5 },
      { name: "Entra ID", years_experience: 4 },
      { name: "Azure DevOps", years_experience: 4 },
      { name: "Terraform", years_experience: 1 },
    ],
    experience: [
      {
        company: "Grupo Hierros del Norte",
        role: "Azure Engineer",
        start: "2020-02",
        end: null,
        description:
          "Operación cloud interno; soporte a equipos de aplicaciones.",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // JOB 3 — Senior DevOps / Platform Engineer @ Volcán Commerce
  //   Distribución: 1 mid, 5 senior, 2 staff
  //   CEFR: 1 A2, 1 B1, 3 B2, 2 C1, 1 C2
  //   Stages: 3 recommended, 2 scheduled, 2 interested, 1 new
  // ════════════════════════════════════════════════════════════════════════
  {
    job_slug: "devops-platform-volcan",
    stage: "recommended",
    full_name: "Joaquín Iribarren Suárez",
    email: "joaquin.iribarren@protonmail.com",
    phone_e164: "+541198765432",
    linkedin_url: "https://www.linkedin.com/in/joaquin-iribarren-suarez/",
    country: "AR",
    city: "Buenos Aires",
    english_cefr: "C2",
    seniority: "staff",
    gender: "m",
    university: "Universidad Tecnológica Nacional (UTN)",
    summary:
      "Staff Platform Engineer con 10 años de experiencia. Pasó 5 años en Mercado Libre construyendo herramientas internas de la plataforma (CLI de squads, runtime de deploys), donde fue promovido de Senior a Staff. Los últimos 4 años en una scaleup de e-commerce headless con equipo de 12 platform engineers, donde lidera CI/CD y observability. Tiene experiencia profunda con ArgoCD, Helm y un opinión muy formada sobre service mesh (Istio sí para multi-tenancy, Linkerd sí para simplicidad). Co-autor de un capítulo en un libro sobre Kubernetes patterns publicado por O'Reilly. Inglés nativo después de 3 años trabajando con teams en Berlín. Busca volver a un rol de IC profundo con menos people management.",
    skills: [
      { name: "Kubernetes", years_experience: 8 },
      { name: "ArgoCD", years_experience: 4 },
      { name: "Helm", years_experience: 6 },
      { name: "Terraform", years_experience: 7 },
      { name: "Prometheus + Grafana", years_experience: 7 },
      { name: "Loki", years_experience: 3 },
      { name: "Istio", years_experience: 3 },
      { name: "EKS", years_experience: 5 },
      { name: "GKE", years_experience: 5 },
      { name: "Go", years_experience: 5 },
      { name: "Python", years_experience: 7 },
      { name: "GitHub Actions", years_experience: 4 },
    ],
    experience: [
      {
        company: "Headlessify (scaleup)",
        role: "Senior → Staff Platform Engineer",
        start: "2021-02",
        end: null,
        description:
          "Lidera CI/CD y observability. Co-autor de un capítulo de O'Reilly Kubernetes Patterns.",
      },
      {
        company: "Mercado Libre",
        role: "Senior → Staff Platform Engineer",
        start: "2016-04",
        end: "2021-01",
        description:
          "Herramientas internas (CLI, runtime de deploys) usadas por 200+ ingenieros.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "recommended",
    full_name: "Sofía Bermúdez Lara",
    email: "sofia.bermudez.lara@gmail.com",
    phone_e164: "+525532245567",
    linkedin_url: "https://www.linkedin.com/in/sofia-bermudez-lara/",
    country: "MX",
    city: "Ciudad de México",
    english_cefr: "C1",
    seniority: "senior",
    gender: "f",
    university: "UNAM",
    summary:
      "Senior Platform Engineer con 6 años. Pasó 3 años en Kavak operando la plataforma Kubernetes (EKS + GKE) durante el período de hipercrecimiento. Los últimos 3 años en Cornershop by Uber liderando una sub-team de observability y oncall culture. Construyó el playbook de incident response que la compañía sigue hoy, incluyendo un sistema de severity tiering basado en customer impact. Tiene mucho cariño por SLI/SLO y aborrece cuando los equipos los tratan como decorativos. Su inglés C1 funciona muy bien. Le interesa la cultura de ownership y blameless postmortems — el principal factor de búsqueda.",
    skills: [
      { name: "Kubernetes", years_experience: 6 },
      { name: "EKS", years_experience: 4 },
      { name: "GKE", years_experience: 3 },
      { name: "Terraform", years_experience: 5 },
      { name: "Helm", years_experience: 5 },
      { name: "ArgoCD", years_experience: 3 },
      { name: "Prometheus + Grafana", years_experience: 5 },
      { name: "Loki", years_experience: 3 },
      { name: "Tempo", years_experience: 2 },
      { name: "Incident response", years_experience: 4 },
      { name: "Python", years_experience: 5 },
      { name: "Go", years_experience: 2 },
    ],
    experience: [
      {
        company: "Cornershop by Uber",
        role: "Senior Platform Engineer",
        start: "2022-03",
        end: null,
        description:
          "Lidera observability + oncall culture. Definió el playbook de incident response.",
      },
      {
        company: "Kavak",
        role: "DevOps Engineer → Senior",
        start: "2019-07",
        end: "2022-02",
        description:
          "Hipercrecimiento Kubernetes; pasó de 15 a 200+ servicios en plataforma.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "recommended",
    full_name: "Tomás Errázuriz Donoso",
    email: "tomas.errazuriz@gmail.com",
    phone_e164: "+59899887766",
    linkedin_url: "https://www.linkedin.com/in/tomas-errazuriz-donoso/",
    country: "UY",
    city: "Montevideo",
    english_cefr: "B2",
    seniority: "staff",
    gender: "m",
    university: "Universidad de la República (Uruguay)",
    summary:
      "Staff DevOps con 9 años de experiencia. Trabajó 4 años en dLocal (fintech UY) durante su escalado pre-IPO, donde diseñó la migración de monolito a Kubernetes para 80+ servicios. Los últimos 4 años en una scaleup de Buenos Aires donde lidera plataforma. Tiene experiencia con Flux (no ArgoCD) y prefiere argumentar caso por caso cuál usar. Contributor regular a varias herramientas CNCF (3 PRs mergeadas a Flux). Su inglés B2 es funcional para reuniones técnicas pero confiesa que con clientes UK le cuesta el accent. Busca un equipo donde pueda combinar trabajo IC profundo con liderazgo técnico.",
    skills: [
      { name: "Kubernetes", years_experience: 7 },
      { name: "Flux", years_experience: 3 },
      { name: "Helm", years_experience: 6 },
      { name: "Terraform", years_experience: 6 },
      { name: "Prometheus + Grafana", years_experience: 6 },
      { name: "Loki", years_experience: 3 },
      { name: "EKS", years_experience: 4 },
      { name: "GKE", years_experience: 3 },
      { name: "Go", years_experience: 4 },
      { name: "Python", years_experience: 5 },
      { name: "Linkerd", years_experience: 2 },
    ],
    experience: [
      {
        company: "Bisturí Tech (scaleup AR)",
        role: "Staff Platform Engineer",
        start: "2021-09",
        end: null,
        description:
          "Plataforma multi-tenant en GKE. Contributor a Flux.",
      },
      {
        company: "dLocal",
        role: "Senior DevOps",
        start: "2017-04",
        end: "2021-08",
        description:
          "Migración monolito → Kubernetes en pre-IPO.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "scheduled",
    full_name: "Gabriela Ríos Espinoza",
    email: "gabi.rios@duck.com",
    phone_e164: "+523322998877",
    linkedin_url: "https://www.linkedin.com/in/gabriela-rios-espinoza/",
    country: "MX",
    city: "Guadalajara",
    english_cefr: "B2",
    seniority: "senior",
    gender: "f",
    university: "Tec de Monterrey",
    summary:
      "Senior DevOps con 6 años. Pasó 2 años en una consultora pequeña y los últimos 4 en una empresa de e-commerce MX (no muy grande) operando Kubernetes y ArgoCD. Sólida operativamente; menos experiencia construyendo herramientas internas (CLI/SDKs) que el rol pide. Inglés B2 con buena fluidez en reuniones técnicas. Busca una scaleup más grande para crecer hacia Staff.",
    skills: [
      { name: "Kubernetes", years_experience: 5 },
      { name: "ArgoCD", years_experience: 3 },
      { name: "Helm", years_experience: 4 },
      { name: "Terraform", years_experience: 4 },
      { name: "Prometheus + Grafana", years_experience: 4 },
      { name: "EKS", years_experience: 3 },
      { name: "Python", years_experience: 4 },
      { name: "Bash", years_experience: 6 },
    ],
    experience: [
      {
        company: "Comercia.mx",
        role: "DevOps → Senior DevOps",
        start: "2021-08",
        end: null,
        description:
          "Operación de plataforma e-commerce; rotación oncall.",
      },
      {
        company: "DigitalGroove",
        role: "DevOps Engineer",
        start: "2019-05",
        end: "2021-07",
        description:
          "Consultoría DevOps a clientes mid de MX.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "scheduled",
    full_name: "Hernán Calderón Vélez",
    email: "hernan.calderon@hey.com",
    phone_e164: "+5722334455",
    linkedin_url: "https://www.linkedin.com/in/hernan-calderon-velez/",
    country: "CO",
    city: "Cali",
    english_cefr: "B2",
    seniority: "senior",
    gender: "m",
    university: "Universidad del Valle",
    summary:
      "Senior DevOps con 7 años. Trabajó 4 años en Rappi durante el escalado, principalmente en el equipo de infra para el vertical de Restaurants. Últimos 3 años en una empresa colombiana de logística que vende a retailers regionales. Tiene buena cobertura de tooling pero menos experiencia con observability profunda (Tempo/Loki). Inglés B2. Le interesa un rol más cerca de la plataforma fundacional vs. infra de app squad.",
    skills: [
      { name: "Kubernetes", years_experience: 6 },
      { name: "Helm", years_experience: 5 },
      { name: "Terraform", years_experience: 5 },
      { name: "GitHub Actions", years_experience: 4 },
      { name: "Prometheus + Grafana", years_experience: 5 },
      { name: "EKS", years_experience: 4 },
      { name: "Python", years_experience: 5 },
      { name: "Bash", years_experience: 7 },
      { name: "ArgoCD", years_experience: 2 },
    ],
    experience: [
      {
        company: "Logística Andina",
        role: "Senior DevOps",
        start: "2022-01",
        end: null,
        description:
          "Plataforma para SaaS de logística B2B.",
      },
      {
        company: "Rappi",
        role: "DevOps Engineer",
        start: "2018-06",
        end: "2021-12",
        description:
          "Vertical Restaurants: infra, deploys, oncall.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "interested",
    full_name: "Renata Aceves Bermúdez",
    email: "renata.aceves@protonmail.com",
    phone_e164: "+522223334455",
    linkedin_url: "https://www.linkedin.com/in/renata-aceves-bermudez/",
    country: "MX",
    city: "Puebla",
    english_cefr: "B1",
    seniority: "mid",
    gender: "f",
    university: "BUAP",
    summary:
      "Mid DevOps con 4 años. Empezó como SysAdmin Linux en una empresa de hosting y los últimos 2.5 años en una scaleup pequeña operando Kubernetes con GKE. Conoce Helm y Terraform a nivel funcional. Su inglés B1 es funcional para mensajes; en reuniones largas se cansa. Es honestamente más junior de lo que un Senior pide; sería stretch. Su motivación principal es buscar mentorship técnico fuerte.",
    skills: [
      { name: "Kubernetes", years_experience: 3 },
      { name: "Helm", years_experience: 2 },
      { name: "Terraform", years_experience: 2 },
      { name: "GKE", years_experience: 2 },
      { name: "Prometheus + Grafana", years_experience: 2 },
      { name: "Linux", years_experience: 5 },
      { name: "Bash", years_experience: 4 },
      { name: "Python", years_experience: 3 },
    ],
    experience: [
      {
        company: "MiniMerk SaaS",
        role: "DevOps Engineer",
        start: "2022-08",
        end: null,
        description:
          "Operación Kubernetes en GKE para SaaS B2B regional.",
      },
      {
        company: "HostMex",
        role: "SysAdmin Linux",
        start: "2020-04",
        end: "2022-07",
        description:
          "Operación de hosting compartido + VPS.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "interested",
    full_name: "Esteban Quintana Aguilar",
    email: "esteban.q@gmail.com",
    phone_e164: "+543415667788",
    linkedin_url: "https://www.linkedin.com/in/esteban-quintana-aguilar/",
    country: "AR",
    city: "Rosario",
    english_cefr: "C1",
    seniority: "senior",
    gender: "m",
    university: "Universidad Nacional de Rosario",
    summary:
      "Senior SRE/DevOps con 6 años. Trabajó 3 años en una fintech argentina y los últimos 3 en una empresa de gaming con operación 24/7. Su perfil tiene fortaleza marcada en incident response y SLO/SLI; participó en 30+ postmortems. Tiene menos exposición a IaC complejo (Terraform a nivel funcional, no a nivel de módulos custom). Inglés C1. Quiere un equipo donde la operación esté madura y pueda enfocarse en mejorar dev experience.",
    skills: [
      { name: "Kubernetes", years_experience: 5 },
      { name: "Prometheus + Grafana", years_experience: 6 },
      { name: "Loki", years_experience: 3 },
      { name: "SLO/SLI", years_experience: 4 },
      { name: "Incident response", years_experience: 5 },
      { name: "Terraform", years_experience: 3 },
      { name: "Helm", years_experience: 4 },
      { name: "GitHub Actions", years_experience: 3 },
      { name: "Python", years_experience: 5 },
    ],
    experience: [
      {
        company: "GameOps Studio",
        role: "Senior SRE",
        start: "2022-04",
        end: null,
        description:
          "Operación 24/7 de servidores de juego; SLOs por región.",
      },
      {
        company: "Ualá",
        role: "DevOps Engineer",
        start: "2019-06",
        end: "2022-03",
        description:
          "Equipo de plataforma en fintech argentina.",
      },
    ],
  },
  {
    job_slug: "devops-platform-volcan",
    stage: "new",
    full_name: "Norma Castañeda Pulido",
    email: "norma.castaneda@duck.com",
    phone_e164: "+571122334455",
    linkedin_url: "https://www.linkedin.com/in/norma-castaneda-pulido/",
    country: "CO",
    city: "Bogotá",
    english_cefr: "A2",
    seniority: "senior",
    gender: "f",
    university: "Universidad Distrital Francisco José de Caldas",
    summary:
      "Senior DevOps con 6 años en banca colombiana (Banco de Bogotá). Tiene experiencia operando Kubernetes, Helm y Jenkins (no GitHub Actions). Su contexto es muy regulado: poca migración a tooling moderno. El cuello de botella claro es el inglés A2 — sería problemático en un equipo que documenta y se comunica en inglés. Aplicó por iniciativa propia buscando salir del sector banca tradicional.",
    skills: [
      { name: "Kubernetes", years_experience: 5 },
      { name: "Helm", years_experience: 4 },
      { name: "Jenkins", years_experience: 6 },
      { name: "Terraform", years_experience: 3 },
      { name: "Prometheus", years_experience: 3 },
      { name: "Linux", years_experience: 8 },
    ],
    experience: [
      {
        company: "Banco de Bogotá",
        role: "DevOps Engineer → Senior",
        start: "2019-02",
        end: null,
        description:
          "Operación de plataformas internas; rigor regulatorio.",
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  // JOB 4 — Senior Full-Stack TS @ Brújula Health
  //   Distribución: 1 mid, 5 senior, 1 staff
  //   CEFR: 2 B1, 2 B2, 2 C1, 1 C2
  //   Stages: 3 recommended, 1 interviewed, 1 contacted, 1 interested, 1 new
  // ════════════════════════════════════════════════════════════════════════
  {
    job_slug: "fullstack-ts-brujula",
    stage: "recommended",
    full_name: "Daniela Espinosa Mancilla",
    email: "dani.espinosa@hey.com",
    phone_e164: "+525511223344",
    linkedin_url: "https://www.linkedin.com/in/daniela-espinosa-mancilla/",
    country: "MX",
    city: "Ciudad de México",
    english_cefr: "C2",
    seniority: "staff",
    gender: "f",
    university: "ITAM",
    summary:
      "Staff Full-Stack Engineer con 9 años de experiencia, todo en TypeScript. Trabajó 4 años en una healthtech de SF (remoto), donde lideró el rewrite del módulo de claims procesando 600K transacciones/día. Los últimos 5 años en Cornershop by Uber liderando un squad de checkout. Tiene experiencia profunda con Next.js App Router desde la beta — escribió un blogpost de adopción interno que se compartió cross-team. Su inglés es nativo después de 8 años trabajando con teams de US. Quiere volver a healthtech porque el dominio le motiva más que e-commerce.",
    skills: [
      { name: "TypeScript", years_experience: 9 },
      { name: "Next.js (App Router)", years_experience: 3 },
      { name: "React Server Components", years_experience: 3 },
      { name: "Node.js", years_experience: 9 },
      { name: "PostgreSQL", years_experience: 8 },
      { name: "Drizzle ORM", years_experience: 2 },
      { name: "Prisma", years_experience: 4 },
      { name: "tRPC", years_experience: 3 },
      { name: "Tailwind", years_experience: 4 },
      { name: "shadcn/ui", years_experience: 2 },
      { name: "Playwright", years_experience: 3 },
      { name: "Turborepo", years_experience: 3 },
    ],
    experience: [
      {
        company: "Cornershop by Uber",
        role: "Senior → Staff Engineer (Checkout)",
        start: "2020-04",
        end: null,
        description:
          "Lidera el squad de checkout. Adoptó Next.js App Router en producción.",
      },
      {
        company: "Coverify (healthtech SF)",
        role: "Senior Full-Stack",
        start: "2016-09",
        end: "2020-03",
        description:
          "Rewrite del módulo de claims (TypeScript end-to-end).",
      },
    ],
  },
  {
    job_slug: "fullstack-ts-brujula",
    stage: "recommended",
    full_name: "Pedro Granados Salazar",
    email: "pedro.granados@gmail.com",
    phone_e164: "+50688776655",
    linkedin_url: "https://www.linkedin.com/in/pedro-granados-salazar/",
    country: "CR",
    city: "San José",
    english_cefr: "C1",
    seniority: "senior",
    gender: "m",
    university: "Universidad de Costa Rica",
    summary:
      "Senior Full-Stack TS con 6 años. Trabajó en Globant 3 años para cuentas US y los últimos 3 en una scaleup de Costa Rica con producto B2B de gestión de clínicas (cercano al dominio target). Su perfil tiene buena cobertura: Next.js App Router en producción, Drizzle ORM, tests E2E con Playwright. Su inglés C1 es bueno. Le interesa healthtech porque ha trabajado en el dominio y le interesa profundizar.",
    skills: [
      { name: "TypeScript", years_experience: 6 },
      { name: "Next.js (App Router)", years_experience: 2 },
      { name: "React", years_experience: 6 },
      { name: "Node.js", years_experience: 6 },
      { name: "Drizzle ORM", years_experience: 2 },
      { name: "PostgreSQL", years_experience: 5 },
      { name: "tRPC", years_experience: 2 },
      { name: "Tailwind", years_experience: 3 },
      { name: "Playwright", years_experience: 2 },
      { name: "Jest", years_experience: 5 },
    ],
    experience: [
      {
        company: "ClinicaPlus (scaleup CR)",
        role: "Senior Full-Stack",
        start: "2022-04",
        end: null,
        description:
          "Producto B2B para gestión clínica; familiar con HIPAA-like compliance regional.",
      },
      {
        company: "Globant",
        role: "Full-Stack Engineer",
        start: "2019-06",
        end: "2022-03",
        description:
          "Cuentas client-facing US.",
      },
    ],
  },
  {
    job_slug: "fullstack-ts-brujula",
    stage: "recommended",
    full_name: "Laura Buitrago Marín",
    email: "laura.buitrago@protonmail.com",
    phone_e164: "+5751122334",
    linkedin_url: "https://www.linkedin.com/in/laura-buitrago-marin/",
    country: "CO",
    city: "Cartagena",
    english_cefr: "C1",
    seniority: "senior",
    gender: "f",
    university: "Universidad EAN",
    summary:
      "Senior Full-Stack TS con 6 años. Trabajó 4 años en una scaleup mexicana de logística y los últimos 2 en una healthtech estadounidense remota. Tiene fuerte experiencia con accesibilidad (WCAG AA): cofacilitó un audit de a11y completo de un producto B2C usado por adultos mayores. Next.js App Router desde 2023. Inglés C1, muy bueno para colaboración asíncrona con teams US/EU. Busca un rol con más liderazgo técnico.",
    skills: [
      { name: "TypeScript", years_experience: 6 },
      { name: "Next.js (App Router)", years_experience: 2 },
      { name: "React", years_experience: 6 },
      { name: "Node.js", years_experience: 6 },
      { name: "PostgreSQL", years_experience: 5 },
      { name: "Prisma", years_experience: 3 },
      { name: "Tailwind", years_experience: 4 },
      { name: "shadcn/ui", years_experience: 1 },
      { name: "Accessibility (WCAG AA)", years_experience: 3 },
      { name: "Playwright", years_experience: 2 },
    ],
    experience: [
      {
        company: "MedTouch Health (US, remoto)",
        role: "Senior Full-Stack",
        start: "2023-08",
        end: null,
        description:
          "Producto B2C de adherencia a tratamiento para adultos mayores. Liderazgo a11y.",
      },
      {
        company: "Skydropx",
        role: "Full-Stack Engineer → Senior",
        start: "2019-05",
        end: "2023-07",
        description:
          "API + dashboard para logística B2B.",
      },
    ],
  },
  {
    job_slug: "fullstack-ts-brujula",
    stage: "interviewed",
    full_name: "Iñaki Etxeberria Aguirre",
    email: "inaki.etxeberria@gmail.com",
    phone_e164: "+528144556677",
    linkedin_url: "https://www.linkedin.com/in/inaki-etxeberria-aguirre/",
    country: "MX",
    city: "Monterrey",
    english_cefr: "B2",
    seniority: "senior",
    gender: "m",
    university: "Tec de Monterrey campus Monterrey",
    summary:
      "Senior Full-Stack TS con 6 años. Trabajó 5 años en una scaleup mexicana de neobanca y el último año en una agency mid-size. Sólida experiencia con Next.js App Router y monorepos Turbo. Su inglés B2 es funcional pero no fluido — escribe muy bien, pero en reuniones largas se cansa. Es honesto sobre eso. Le interesa healthtech porque su madre trabajó en clínicas pequeñas y entiende el problema desde el usuario.",
    skills: [
      { name: "TypeScript", years_experience: 6 },
      { name: "Next.js (App Router)", years_experience: 2 },
      { name: "React", years_experience: 6 },
      { name: "Node.js", years_experience: 6 },
      { name: "PostgreSQL", years_experience: 5 },
      { name: "Drizzle ORM", years_experience: 1 },
      { name: "Tailwind", years_experience: 3 },
      { name: "Jest", years_experience: 5 },
      { name: "Turborepo", years_experience: 2 },
    ],
    experience: [
      {
        company: "WonderAgency",
        role: "Senior Full-Stack",
        start: "2024-02",
        end: null,
        description:
          "Producto SaaS para clientes mid de retail.",
      },
      {
        company: "Klar",
        role: "Full-Stack Engineer → Senior",
        start: "2019-05",
        end: "2024-01",
        description:
          "Producto consumer-facing de neobanca; equipo de 4.",
      },
    ],
  },
  {
    job_slug: "fullstack-ts-brujula",
    stage: "contacted",
    full_name: "Mariano Ferreyra Acuña",
    email: "mariano.ferreyra@duck.com",
    phone_e164: "+5841234567",
    linkedin_url: "https://www.linkedin.com/in/mariano-ferreyra-acuna/",
    country: "VE",
    city: "Caracas",
    english_cefr: "B1",
    seniority: "senior",
    gender: "m",
    university: "Universidad Central de Venezuela",
    summary:
      "Senior Full-Stack TS con 7 años. Trabajó 4 años en una empresa venezolana de SaaS B2B y los últimos 3 trabajando remoto para clientes US como freelancer. Pages Router de Next.js, no App Router (sólo experimentos). Inglés B1, mejor en escrito. Buscaría aprender App Router en el rol; está abierto a un onboarding más largo.",
    skills: [
      { name: "TypeScript", years_experience: 7 },
      { name: "Next.js (Pages Router)", years_experience: 4 },
      { name: "React", years_experience: 7 },
      { name: "Node.js", years_experience: 7 },
      { name: "PostgreSQL", years_experience: 5 },
      { name: "Prisma", years_experience: 4 },
      { name: "Tailwind", years_experience: 3 },
      { name: "Jest", years_experience: 5 },
    ],
    experience: [
      {
        company: "Freelance (clientes US)",
        role: "Senior Full-Stack",
        start: "2022-07",
        end: null,
        description:
          "Productos B2B; 3 clientes recurrentes US.",
      },
      {
        company: "Caracas SaaS Co.",
        role: "Full-Stack Engineer",
        start: "2018-04",
        end: "2022-06",
        description:
          "Producto B2B regional.",
      },
    ],
  },
  {
    job_slug: "fullstack-ts-brujula",
    stage: "interested",
    full_name: "Yolanda Pacheco Iturbide",
    email: "yolanda.pacheco@gmail.com",
    phone_e164: "+523323456789",
    linkedin_url: "https://www.linkedin.com/in/yolanda-pacheco-iturbide/",
    country: "MX",
    city: "Guadalajara",
    english_cefr: "B2",
    seniority: "senior",
    gender: "f",
    university: "Universidad de Guadalajara",
    summary:
      "Senior Full-Stack TS con 5 años. Trabajó 3 años en Wizeline para cuentas US y los últimos 2 en una startup mexicana de productividad. Sólida con React y Node.js, menos con Next.js App Router (1 proyecto pequeño). Inglés B2. Le interesa healthtech porque ha sido cuidadora familiar y le mueve el dominio.",
    skills: [
      { name: "TypeScript", years_experience: 5 },
      { name: "Next.js (App Router)", years_experience: 1 },
      { name: "React", years_experience: 5 },
      { name: "Node.js", years_experience: 5 },
      { name: "PostgreSQL", years_experience: 4 },
      { name: "Tailwind", years_experience: 3 },
      { name: "Jest", years_experience: 4 },
      { name: "Cypress", years_experience: 2 },
    ],
    experience: [
      {
        company: "ProductivIdad SaaS",
        role: "Senior Full-Stack",
        start: "2023-03",
        end: null,
        description:
          "Producto B2C de productividad personal.",
      },
      {
        company: "Wizeline",
        role: "Full-Stack Engineer",
        start: "2020-04",
        end: "2023-02",
        description:
          "Cuentas client-facing US.",
      },
    ],
  },
  {
    job_slug: "fullstack-ts-brujula",
    stage: "new",
    full_name: "Bruno Sandoval Mejía",
    email: "bruno.sandoval@hey.com",
    phone_e164: "+528334455667",
    linkedin_url: "https://www.linkedin.com/in/bruno-sandoval-mejia/",
    country: "MX",
    city: "Ciudad de México",
    english_cefr: "B1",
    seniority: "mid",
    gender: "m",
    university: "UAM Xochimilco",
    summary:
      "Mid Full-Stack TS con 3.5 años de experiencia. Empezó como frontend pero migró a full-stack en su empresa actual. Conoce Next.js App Router pero principalmente en projects pequeños internos. Inglés B1, mejor en escrito. Es honestamente mid; sería stretch para el rol. Aplicó por iniciativa propia buscando un step-up.",
    skills: [
      { name: "TypeScript", years_experience: 3 },
      { name: "Next.js (App Router)", years_experience: 1 },
      { name: "React", years_experience: 3 },
      { name: "Node.js", years_experience: 2 },
      { name: "PostgreSQL", years_experience: 2 },
      { name: "Tailwind", years_experience: 3 },
      { name: "Jest", years_experience: 2 },
    ],
    experience: [
      {
        company: "GestionApp (startup MX)",
        role: "Frontend → Full-Stack",
        start: "2021-09",
        end: null,
        description:
          "Web app B2C para gestión personal.",
      },
    ],
  },
];
