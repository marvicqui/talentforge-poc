/**
 * Generates the 6 demo CV PDFs into apps/web/public/demo-cvs/.
 * Run once with `pnpm tsx scripts/generate-demo-cvs.ts`; the resulting PDFs are
 * committed so the runtime UI can just fetch them.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";

import { DEMO_CVS, type DemoCvFixture } from "./seed/demo-cv-fixtures";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, color: "#1f2937", fontFamily: "Helvetica" },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  h2: {
    fontSize: 12,
    marginTop: 14,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  meta: { color: "#6b7280", fontSize: 9, marginBottom: 8 },
  paragraph: { lineHeight: 1.4, marginBottom: 4 },
  bullet: { marginLeft: 10, marginBottom: 2 },
  jobTitle: { fontFamily: "Helvetica-Bold" },
  jobPeriod: { color: "#6b7280" },
});

function CvDocument({ cv }: { cv: DemoCvFixture }) {
  return React.createElement(
    Document,
    { author: "TalentForge AI", title: `CV — ${cv.full_name}` },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.h1 }, cv.full_name),
      React.createElement(
        Text,
        { style: styles.meta },
        `${cv.email} · ${cv.phone} · ${cv.location} · Inglés ${cv.english}`,
      ),

      React.createElement(Text, { style: styles.h2 }, "Resumen"),
      React.createElement(Text, { style: styles.paragraph }, cv.summary),

      React.createElement(Text, { style: styles.h2 }, "Skills"),
      ...cv.skills.map((s, i) =>
        React.createElement(Text, { key: i, style: styles.bullet }, `• ${s}`),
      ),

      React.createElement(Text, { style: styles.h2 }, "Experiencia"),
      ...cv.experience.flatMap((e, i) => [
        React.createElement(
          View,
          { key: `e${i}`, style: { marginTop: 6 } },
          React.createElement(Text, { style: styles.jobTitle }, e.role),
          React.createElement(
            Text,
            { style: styles.jobPeriod },
            `${e.company} · ${e.period}`,
          ),
          ...e.bullets.map((b, j) =>
            React.createElement(
              Text,
              { key: `e${i}b${j}`, style: styles.bullet },
              `• ${b}`,
            ),
          ),
        ),
      ]),

      React.createElement(Text, { style: styles.h2 }, "Educación"),
      React.createElement(Text, { style: styles.paragraph }, cv.education),
    ),
  );
}

async function main(): Promise<void> {
  const outDir = resolve(process.cwd(), "apps/web/public/demo-cvs");
  mkdirSync(outDir, { recursive: true });
  for (const cv of DEMO_CVS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await renderToBuffer(CvDocument({ cv }) as any);
    const path = resolve(outDir, cv.filename);
    writeFileSync(path, buf);
    console.log(`✓ ${cv.filename} (${buf.length} bytes)`);
  }
  console.log(`Done. ${DEMO_CVS.length} PDFs in ${outDir}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
