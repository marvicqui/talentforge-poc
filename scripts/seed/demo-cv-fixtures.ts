// Sintéticos para "Demo preset CVs". Pensados para una vacante de backend
// Python / fintech LATAM, pero el agente parsea cualquier CV razonable.
// Genéramos 6 perfiles con calidad diversa para que el demo muestre spread
// de scores: 2 fuertes, 2 medianos, 2 débiles.

export type DemoCvFixture = {
  filename: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Array<{ role: string; company: string; period: string; bullets: string[] }>;
  education: string;
  english: string;
};

export const DEMO_CVS: DemoCvFixture[] = [
  {
    filename: "valeria-rojas.pdf",
    full_name: "Valeria Rojas Mendoza",
    email: "valeria.rojas@protonmail.com",
    phone: "+525511223344",
    location: "Ciudad de México, México",
    english: "C1",
    summary:
      "Senior Backend Engineer con 7 años de experiencia construyendo APIs Python en producción para fintechs de pagos. Lideró el sistema de transacciones idempotentes en Konfío que procesaba 8K TPS en su pico. Apasionada por PostgreSQL avanzado y por escribir código que la persona a las 3 AM no tenga que despertar.",
    skills: [
      "Python (7)",
      "FastAPI (5)",
      "PostgreSQL (7) — query plans, replicación lógica, particionamiento",
      "Kafka (4) en producción",
      "Docker (6), Kubernetes (3)",
      "gRPC (2), OpenTelemetry (2)",
      "Sistemas distribuidos: idempotencia, exactly-once",
      "Pytest, integration tests con testcontainers",
    ],
    experience: [
      {
        role: "Senior Backend Engineer",
        company: "Klar (neobanca)",
        period: "2022-03 — Presente",
        bullets: [
          "Diseñó el servicio de transacciones idempotentes (Python + Postgres + Kafka) que pasó de 800 a 5,200 TPS en 14 meses.",
          "Lideró migración de 8 servicios de monolito a microservicios con feature flagging.",
          "Mentoría a 2 mid engineers; promovida a Senior 2 en 2024.",
        ],
      },
      {
        role: "Backend Engineer → Senior",
        company: "Konfío",
        period: "2018-06 — 2022-02",
        bullets: [
          "Construyó el pipeline de scoring crediticio en Python (FastAPI + scikit-learn).",
          "Owner del subsistema de cobranza con 2M+ usuarios.",
        ],
      },
    ],
    education: "Ing. en Sistemas Computacionales, ITAM (2017)",
  },
  {
    filename: "ramiro-cossio.pdf",
    full_name: "Ramiro Cossío Tagle",
    email: "ramiro.cossio@gmail.com",
    phone: "+541133557799",
    location: "Buenos Aires, Argentina",
    english: "B2",
    summary:
      "Backend Senior con 6 años de experiencia, especializado en sistemas de pagos B2B. Trabajó 4 años en dLocal durante su escalado pre-IPO; sólido en Postgres y eventual consistency. Habla inglés B2 funcional para reuniones técnicas con teams remotos.",
    skills: [
      "Python (6)",
      "FastAPI (4), Flask (2)",
      "PostgreSQL (6)",
      "Kafka (3)",
      "Redis (4)",
      "Docker (5)",
      "AWS EKS (3)",
      "Terraform (3)",
      "Pytest, hypothesis",
    ],
    experience: [
      {
        role: "Senior Backend Engineer",
        company: "Pomelo",
        period: "2023-02 — Presente",
        bullets: [
          "Servicios de tokenización de tarjetas (PCI scope). Owner del módulo de tokens.",
          "Optimizó query de búsqueda de transacciones de 4s a 80ms con partitioning + índices BRIN.",
        ],
      },
      {
        role: "Backend Engineer",
        company: "dLocal",
        period: "2019-08 — 2023-01",
        bullets: [
          "Equipo de Settlements: liquidaciones para 30+ países LATAM.",
          "Migró de monolito Java a microservicios Python con Kafka.",
        ],
      },
    ],
    education: "Lic. en Sistemas, UTN Buenos Aires (2018)",
  },
  {
    filename: "lucas-mendez.pdf",
    full_name: "Lucas Méndez Aguirre",
    email: "lucas.mendez.a@duck.com",
    phone: "+5713334455",
    location: "Bogotá, Colombia",
    english: "B2",
    summary:
      "Backend Engineer con 4 años de experiencia, los últimos 2 en una scaleup colombiana de logística. Sólido con Python + FastAPI pero menos exposición a sistemas de pagos. Buen comunicador, inglés B2 con vocabulario técnico amplio.",
    skills: [
      "Python (4)",
      "FastAPI (3)",
      "Django (2)",
      "PostgreSQL (4)",
      "Redis (3)",
      "Docker (3)",
      "GitHub Actions",
      "Pytest",
    ],
    experience: [
      {
        role: "Backend Engineer",
        company: "Frubana",
        period: "2022-04 — Presente",
        bullets: [
          "Servicios de matching entre productores y comercios (Python + Postgres).",
          "Implementó retries idempotentes en webhook handlers (sin payment context).",
        ],
      },
      {
        role: "Backend Engineer Junior",
        company: "Globant",
        period: "2020-08 — 2022-03",
        bullets: [
          "Cuentas client-facing US, principalmente Django.",
        ],
      },
    ],
    education: "Ing. de Sistemas, Universidad Nacional de Colombia (2020)",
  },
  {
    filename: "andrea-paredes.pdf",
    full_name: "Andrea Paredes Cervantes",
    email: "andrea.paredes@hey.com",
    phone: "+5219988776655",
    location: "Guadalajara, México",
    english: "B1",
    summary:
      "Mid backend con 4.5 años de experiencia, mayormente Django + DRF para SaaS B2B. Excelente con APIs REST y permisos por rol; menos experiencia con Kafka o sistemas distribuidos. Inglés B1 funcional para lectura y mensajes async.",
    skills: [
      "Python (5)",
      "Django (4), DRF (4)",
      "PostgreSQL (4)",
      "Celery + Redis (3)",
      "Docker (3)",
      "Pytest",
      "Sentry para observability",
    ],
    experience: [
      {
        role: "Backend Engineer",
        company: "Trato",
        period: "2021-06 — Presente",
        bullets: [
          "Producto SaaS B2B; mantiene 35+ endpoints de la API principal.",
          "Owner del módulo de auditoría: 200K eventos/día.",
        ],
      },
      {
        role: "Backend Junior",
        company: "Wizeline",
        period: "2019-09 — 2021-05",
        bullets: [
          "Equipo de plataforma interna; trabajos rotativos en varias cuentas.",
        ],
      },
    ],
    education: "Ing. en Sistemas, Tec de Monterrey campus Guadalajara (2019)",
  },
  {
    filename: "jose-vargas.pdf",
    full_name: "José Vargas Quintana",
    email: "jose.vargas.q@gmail.com",
    phone: "+59891234567",
    location: "Montevideo, Uruguay",
    english: "B1",
    summary:
      "Developer junior-mid con 3 años de experiencia. Comenzó en una empresa local de e-commerce y se mudó a contracting remoto hace 1 año. Conoce Python básico-medio; experiencia limitada con producción a escala. Buena actitud, busca senior team que lo mentoree.",
    skills: [
      "Python (3)",
      "FastAPI (1)",
      "Flask (2)",
      "PostgreSQL (2)",
      "MySQL (3)",
      "Docker (1)",
      "Pytest",
    ],
    experience: [
      {
        role: "Backend Developer (contractor)",
        company: "Varios clientes US",
        period: "2024-02 — Presente",
        bullets: [
          "3 proyectos cortos en Python; uno con FastAPI.",
        ],
      },
      {
        role: "Junior Developer",
        company: "DotMe Tech",
        period: "2022-03 — 2024-01",
        bullets: [
          "E-commerce local; mantenimiento de monolito en Flask + MySQL.",
        ],
      },
    ],
    education: "Lic. en Computación, Universidad de la República (2022)",
  },
  {
    filename: "carla-figueroa.pdf",
    full_name: "Carla Figueroa Bermúdez",
    email: "carla.figueroa@protonmail.com",
    phone: "+50688998877",
    location: "San José, Costa Rica",
    english: "A2",
    summary:
      "Senior con 6 años en Python pero el cuello de botella claro es el inglés A2. Trabajó casi todo en empresas locales tropicales; muy fuerte técnicamente en Django y reportería. Buscando rol remoto donde el inglés no sea bloqueante o donde haya plan de mejora con clases pagadas.",
    skills: [
      "Python (6)",
      "Django (6)",
      "PostgreSQL (5)",
      "PyTest (4)",
      "Redis (3)",
      "Sin Kafka",
      "Sin gRPC",
    ],
    experience: [
      {
        role: "Tech Lead Backend",
        company: "Pura Vida SaaS",
        period: "2021-08 — Presente",
        bullets: [
          "Equipo de 4 ingenieros; mantiene API monolítica Django.",
          "Owner del subsistema de reportería con queries complejas.",
        ],
      },
      {
        role: "Backend Senior",
        company: "Costa Rica Software",
        period: "2018-04 — 2021-07",
        bullets: [
          "Migración de PHP a Python para varios módulos.",
        ],
      },
    ],
    education: "Ing. de Sistemas, Universidad de Costa Rica (2017)",
  },
];
