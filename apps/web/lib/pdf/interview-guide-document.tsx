import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type InterviewQuestion = {
  question: string;
  intent: string;
  time_minutes: number;
  what_to_look_for: string[];
  good_answer_signals: string[];
  weak_answer_signals: string[];
  red_flag_signals: string[];
};
type Guide = {
  estimated_total_minutes: number;
  sections: Array<{
    id: string;
    label: string;
    questions: InterviewQuestion[];
  }>;
  practical_case_context: string;
  practical_case_subprompts: string[];
};

export type InterviewGuidePdfProps = {
  jobTitle: string;
  companyName: string;
  modality: string;
  guide: Guide;
};

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
  h3: {
    fontSize: 11,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  meta: { color: "#6b7280", fontSize: 9 },
  qTitle: {
    fontSize: 10,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  questionCard: {
    marginTop: 6,
    padding: 8,
    border: "1pt solid #e5e7eb",
    borderRadius: 4,
  },
  intent: { color: "#4b5563", fontStyle: "italic", marginBottom: 6 },
  twoCol: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  colLabelGood: { color: "#059669", fontSize: 8, marginBottom: 2 },
  colLabelWeak: { color: "#d97706", fontSize: 8, marginBottom: 2 },
  colLabelRed: { color: "#dc2626", fontSize: 8, marginBottom: 2 },
  colLabelLook: { color: "#374151", fontSize: 8, marginBottom: 2 },
  bullet: { marginBottom: 1 },
  caseBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
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

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <Text style={{ color: "#9ca3af", fontStyle: "italic" }}>—</Text>;
  }
  return (
    <View>
      {items.map((it, i) => (
        <Text key={i} style={styles.bullet}>
          · {it}
        </Text>
      ))}
    </View>
  );
}

export function InterviewGuideDocument(props: InterviewGuidePdfProps) {
  const { guide } = props;
  return (
    <Document title={`Guía — ${props.jobTitle}`} author="TalentForge AI">
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{props.jobTitle}</Text>
        <Text style={styles.meta}>
          {props.companyName} · {props.modality} · {guide.estimated_total_minutes}{" "}
          min estimados
        </Text>
        <Text style={styles.meta}>Guía para reclutador no técnico</Text>

        {guide.sections.map((s, sIdx) => (
          <View key={s.id} wrap={true}>
            <Text style={styles.h2}>
              {sIdx + 1}. {s.label}
            </Text>
            {s.questions.map((q, qIdx) => (
              <View key={qIdx} style={styles.questionCard} wrap={false}>
                <Text style={styles.qTitle}>
                  {sIdx + 1}.{qIdx + 1} {q.question}{" "}
                  <Text
                    style={{ color: "#6b7280", fontFamily: "Helvetica" }}
                  >
                    ({q.time_minutes} min)
                  </Text>
                </Text>
                <Text style={styles.intent}>{q.intent}</Text>

                <View>
                  <Text style={styles.colLabelLook}>Buscar</Text>
                  <BulletList items={q.what_to_look_for} />
                </View>

                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.colLabelGood}>Respuesta sólida</Text>
                    <BulletList items={q.good_answer_signals} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.colLabelWeak}>Respuesta débil</Text>
                    <BulletList items={q.weak_answer_signals} />
                  </View>
                </View>
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.colLabelRed}>Red flags</Text>
                  <BulletList items={q.red_flag_signals} />
                </View>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.h2}>Caso práctico</Text>
        <View style={styles.caseBox}>
          <Text style={{ marginBottom: 6 }}>{guide.practical_case_context}</Text>
          <Text style={styles.h3}>Sub-prompts</Text>
          {guide.practical_case_subprompts.map((p, i) => (
            <Text key={i} style={styles.bullet}>
              {i + 1}. {p}
            </Text>
          ))}
        </View>

        <Text style={styles.footer}>
          TalentForge AI · guía generada {new Date().toLocaleDateString("es-MX")}
        </Text>
      </Page>
    </Document>
  );
}
