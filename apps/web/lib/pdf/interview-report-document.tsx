/* eslint-disable @next/next/no-img-element */
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type EvidenceQuote = { text: string; start_ms: number };
type ScoredDim = { score: number; evidence_quotes: EvidenceQuote[] };
type EnglishBreakdown = {
  assessed: boolean;
  notes: string;
  grammar: ScoredDim;
  fluency: ScoredDim;
  vocabulary: ScoredDim;
  pronunciation: ScoredDim;
};
type TechnicalScore = {
  skill: string;
  score: number;
  evidence_quotes: EvidenceQuote[];
  reasoning: string;
};
type SoftSkillScore = {
  communication: ScoredDim;
  collaboration: ScoredDim;
  problem_solving: ScoredDim;
  ownership: ScoredDim;
};
type FlagItem = { label: string; evidence_quote?: EvidenceQuote };

export type InterviewReportPdfProps = {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  declaredEnglish: string | null;
  report: {
    english_level: string;
    english_breakdown: EnglishBreakdown;
    technical_score: TechnicalScore[];
    softskill_score: SoftSkillScore;
    red_flags: FlagItem[];
    strengths: FlagItem[];
    summary: string;
    recommendation: string;
  };
};

function fmtTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function recLabel(r: string): string {
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
      return r;
  }
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1f2937", fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  h2: {
    fontSize: 13,
    marginTop: 14,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  meta: { color: "#6b7280", fontSize: 9 },
  badge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
    marginRight: 6,
  },
  badgeRow: { flexDirection: "row", marginTop: 6, marginBottom: 6 },
  paragraph: { marginTop: 4, lineHeight: 1.4 },
  quote: {
    marginTop: 2,
    color: "#4b5563",
    fontSize: 9,
    fontStyle: "italic",
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#d1d5db",
  },
  row: { flexDirection: "row", marginBottom: 4 },
  cellName: { flex: 2, fontFamily: "Helvetica-Bold" },
  cellScore: { flex: 1, textAlign: "right" },
  table: { marginTop: 4 },
  card: {
    marginTop: 6,
    padding: 8,
    border: "1pt solid #e5e7eb",
    borderRadius: 4,
  },
  flagItem: { marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

function recColor(r: string): string {
  if (r === "strong_yes") return "#059669";
  if (r === "yes") return "#10b981";
  if (r === "maybe") return "#f59e0b";
  if (r === "no" || r === "strong_no") return "#dc2626";
  return "#6b7280";
}

function scoreColor(s: number): string {
  if (s >= 85) return "#059669";
  if (s >= 70) return "#10b981";
  if (s >= 50) return "#f59e0b";
  return "#dc2626";
}

function Quote({ q }: { q: EvidenceQuote }) {
  return (
    <Text style={styles.quote}>
      [{fmtTime(q.start_ms)}] “{q.text}”
    </Text>
  );
}

function DimensionRow({ label, dim }: { label: string; dim: ScoredDim }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={styles.row}>
        <Text style={styles.cellName}>{label}</Text>
        <Text
          style={[styles.cellScore, { color: scoreColor(dim.score) }]}
        >
          {dim.score}
        </Text>
      </View>
      {(dim.evidence_quotes ?? []).slice(0, 2).map((q, i) => (
        <Quote key={i} q={q} />
      ))}
    </View>
  );
}

export function InterviewReportDocument(props: InterviewReportPdfProps) {
  const { report } = props;
  return (
    <Document
      title={`Reporte — ${props.candidateName}`}
      author="TalentForge AI"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{props.candidateName}</Text>
        <Text style={styles.meta}>
          {props.jobTitle} — {props.companyName}
        </Text>
        <Text style={styles.meta}>
          {props.scheduledAt
            ? new Date(props.scheduledAt).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—"}{" "}
          · {props.durationMinutes ?? "—"} min · Inglés declarado{" "}
          {props.declaredEnglish ?? "—"}
        </Text>

        <View style={styles.badgeRow}>
          <Text
            style={[
              styles.badge,
              { backgroundColor: recColor(report.recommendation) },
            ]}
          >
            {recLabel(report.recommendation)}
          </Text>
          <Text style={[styles.badge, { backgroundColor: "#374151" }]}>
            Inglés {report.english_level}
          </Text>
        </View>

        <Text style={styles.h2}>Resumen</Text>
        <Text style={styles.paragraph}>{report.summary}</Text>

        <Text style={styles.h2}>Inglés — Breakdown</Text>
        <View style={styles.table}>
          <DimensionRow label="Grammar" dim={report.english_breakdown.grammar} />
          <DimensionRow label="Fluency" dim={report.english_breakdown.fluency} />
          <DimensionRow
            label="Vocabulary"
            dim={report.english_breakdown.vocabulary}
          />
          <DimensionRow
            label="Pronunciation"
            dim={report.english_breakdown.pronunciation}
          />
        </View>

        <Text style={styles.h2}>Cobertura técnica</Text>
        {report.technical_score.map((t, i) => (
          <View key={i} style={styles.card} wrap={false}>
            <View style={styles.row}>
              <Text style={styles.cellName}>{t.skill}</Text>
              <Text
                style={[styles.cellScore, { color: scoreColor(t.score) }]}
              >
                {t.score}
              </Text>
            </View>
            <Text style={{ color: "#4b5563", marginTop: 2 }}>{t.reasoning}</Text>
            {(t.evidence_quotes ?? []).slice(0, 2).map((q, j) => (
              <Quote key={j} q={q} />
            ))}
          </View>
        ))}

        <Text style={styles.h2}>Soft skills</Text>
        <View style={styles.table}>
          <DimensionRow
            label="Comunicación"
            dim={report.softskill_score.communication}
          />
          <DimensionRow
            label="Colaboración"
            dim={report.softskill_score.collaboration}
          />
          <DimensionRow
            label="Resolución de problemas"
            dim={report.softskill_score.problem_solving}
          />
          <DimensionRow
            label="Ownership"
            dim={report.softskill_score.ownership}
          />
        </View>

        <Text style={styles.h2}>Fortalezas</Text>
        {report.strengths.length === 0 ? (
          <Text style={{ color: "#9ca3af", fontStyle: "italic" }}>—</Text>
        ) : (
          report.strengths.map((s, i) => (
            <View key={i} style={styles.flagItem}>
              <Text>✓ {s.label}</Text>
              {s.evidence_quote ? <Quote q={s.evidence_quote} /> : null}
            </View>
          ))
        )}

        <Text style={styles.h2}>Red flags</Text>
        {report.red_flags.length === 0 ? (
          <Text style={{ color: "#9ca3af", fontStyle: "italic" }}>—</Text>
        ) : (
          report.red_flags.map((s, i) => (
            <View key={i} style={styles.flagItem}>
              <Text>⚠ {s.label}</Text>
              {s.evidence_quote ? <Quote q={s.evidence_quote} /> : null}
            </View>
          ))
        )}

        <Text style={styles.footer}>
          TalentForge AI · reporte generado {new Date().toLocaleDateString("es-MX")}
        </Text>
      </Page>
    </Document>
  );
}
