"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fmtRecommendation, recColorClass, scoreColorClass } from "@/lib/format";

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
type Report = {
  english_level: string;
  english_breakdown: EnglishBreakdown;
  technical_score: TechnicalScore[];
  softskill_score: SoftSkillScore;
  red_flags: FlagItem[];
  strengths: FlagItem[];
  summary: string;
  recommendation: string;
};

type Segment = {
  speaker: "interviewer" | "candidate";
  language: "es" | "en" | "mixed";
  start_ms: number;
  end_ms: number;
  text: string;
};

const TABS = ["resumen", "english", "tecnico", "soft", "redflags"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  resumen: "Resumen",
  english: "English",
  tecnico: "Técnico",
  soft: "Soft skills",
  redflags: "Red flags",
};

function fmtTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function InterviewReportView({
  segments,
  report,
  pdfHref,
}: {
  segments: Segment[];
  report: Report;
  pdfHref: string;
}) {
  const [tab, setTab] = useState<Tab>("resumen");
  const [highlightStart, setHighlightStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLOListElement>(null);

  const segmentByStart = useMemo(() => {
    const m = new Map<number, number>();
    segments.forEach((s, idx) => m.set(s.start_ms, idx));
    return m;
  }, [segments]);

  const goToQuote = useCallback(
    (startMs: number) => {
      setHighlightStart(startMs);
      const idx = segmentByStart.get(startMs);
      const el = containerRef.current?.querySelector<HTMLLIElement>(
        `[data-segment-start="${startMs}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (idx === undefined) {
        // Quote start_ms doesn't match a segment exactly; find nearest.
        let nearestStart = -1;
        for (const seg of segments) {
          if (seg.start_ms <= startMs && seg.start_ms > nearestStart) {
            nearestStart = seg.start_ms;
          }
        }
        if (nearestStart >= 0) {
          const near = containerRef.current?.querySelector<HTMLLIElement>(
            `[data-segment-start="${nearestStart}"]`,
          );
          near?.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightStart(nearestStart);
        }
      }
    },
    [segments, segmentByStart],
  );

  useEffect(() => {
    if (highlightStart == null) return;
    const t = setTimeout(() => setHighlightStart(null), 3500);
    return () => clearTimeout(t);
  }, [highlightStart]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] min-h-[70vh]">
      <TranscriptPanel
        segments={segments}
        highlightStart={highlightStart}
        listRef={containerRef}
      />
      <ReportPanel
        tab={tab}
        setTab={setTab}
        report={report}
        onQuote={goToQuote}
        pdfHref={pdfHref}
      />
    </div>
  );
}

function TranscriptPanel({
  segments,
  highlightStart,
  listRef,
}: {
  segments: Segment[];
  highlightStart: number | null;
  listRef: React.RefObject<HTMLOListElement>;
}) {
  return (
    <section className="rounded-md border border-border bg-card flex flex-col">
      <header className="border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
        Transcripción
      </header>
      <ol
        ref={listRef}
        className="overflow-y-auto max-h-[70vh] px-3 py-3 space-y-2 text-sm"
      >
        {segments.map((s) => {
          const isHi = highlightStart === s.start_ms;
          const isCand = s.speaker === "candidate";
          return (
            <li
              key={s.start_ms}
              data-segment-start={s.start_ms}
              className={
                "rounded-md border px-3 py-2 transition-colors " +
                (isHi
                  ? "border-amber-500 bg-amber-50 shadow"
                  : "border-transparent hover:border-border " +
                    (isCand ? "bg-secondary/30" : "bg-background"))
              }
            >
              <div className="flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
                <span className="tabular-nums">{fmtTime(s.start_ms)}</span>
                <span className="font-medium">
                  {s.speaker === "interviewer" ? "Entrevistador" : "Candidato"}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5">
                  {s.language}
                </span>
              </div>
              <p className="mt-1 text-card-foreground/90 whitespace-pre-line">
                {s.text}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ReportPanel({
  tab,
  setTab,
  report,
  onQuote,
  pdfHref,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  report: Report;
  onQuote: (ms: number) => void;
  pdfHref: string;
}) {
  return (
    <section className="rounded-md border border-border bg-card flex flex-col">
      <header className="border-b border-border px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-2.5 py-1 text-xs font-medium rounded-md " +
                (t === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
        <a
          href={pdfHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium underline text-muted-foreground hover:text-foreground"
        >
          Descargar PDF
        </a>
      </header>
      <div className="overflow-y-auto max-h-[70vh] px-4 py-4 text-sm">
        {tab === "resumen" ? (
          <SummaryTab report={report} onQuote={onQuote} />
        ) : null}
        {tab === "english" ? (
          <EnglishTab report={report} onQuote={onQuote} />
        ) : null}
        {tab === "tecnico" ? (
          <TechnicalTab report={report} onQuote={onQuote} />
        ) : null}
        {tab === "soft" ? <SoftTab report={report} onQuote={onQuote} /> : null}
        {tab === "redflags" ? (
          <RedFlagsTab report={report} onQuote={onQuote} />
        ) : null}
      </div>
    </section>
  );
}

function SummaryTab({
  report,
  onQuote,
}: {
  report: Report;
  onQuote: (ms: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={
            "rounded-full px-3 py-1 text-xs font-medium " +
            recColorClass(report.recommendation)
          }
        >
          {fmtRecommendation(report.recommendation)}
        </span>
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Inglés {report.english_level}
        </span>
      </div>
      <p className="text-card-foreground/90 leading-relaxed">{report.summary}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-600 mb-1">
            Fortalezas
          </p>
          <FlagList items={report.strengths} onQuote={onQuote} icon="✓" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-destructive mb-1">
            Red flags
          </p>
          <FlagList items={report.red_flags} onQuote={onQuote} icon="⚠" />
        </div>
      </div>
    </div>
  );
}

function EnglishTab({
  report,
  onQuote,
}: {
  report: Report;
  onQuote: (ms: number) => void;
}) {
  const eb = report.english_breakdown;
  const dims: Array<[string, ScoredDim]> = [
    ["Grammar", eb.grammar],
    ["Fluency", eb.fluency],
    ["Vocabulary", eb.vocabulary],
    ["Pronunciation", eb.pronunciation],
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Nivel CEFR
        </span>
        <span className="text-lg font-semibold text-foreground tabular-nums">
          {report.english_level}
        </span>
      </div>
      {!eb.assessed ? (
        <p className="text-xs italic text-muted-foreground">
          {eb.notes || "No hubo segmentos en inglés; se estimó desde el CEFR declarado."}
        </p>
      ) : null}
      {dims.map(([label, d]) => (
        <DimensionCard key={label} label={label} dim={d} onQuote={onQuote} />
      ))}
    </div>
  );
}

function TechnicalTab({
  report,
  onQuote,
}: {
  report: Report;
  onQuote: (ms: number) => void;
}) {
  return (
    <div className="space-y-3">
      {report.technical_score.map((t) => (
        <div
          key={t.skill}
          className="rounded-md border border-border bg-background p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-foreground">{t.skill}</p>
            <div
              className={
                "tabular-nums rounded-md px-2 py-0.5 text-xs font-medium " +
                scoreColorClass(t.score)
              }
            >
              {t.score}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.reasoning}</p>
          <QuoteList quotes={t.evidence_quotes} onQuote={onQuote} />
        </div>
      ))}
    </div>
  );
}

function SoftTab({
  report,
  onQuote,
}: {
  report: Report;
  onQuote: (ms: number) => void;
}) {
  const s = report.softskill_score;
  const dims: Array<[string, ScoredDim]> = [
    ["Comunicación", s.communication],
    ["Colaboración", s.collaboration],
    ["Resolución de problemas", s.problem_solving],
    ["Ownership", s.ownership],
  ];
  return (
    <div className="space-y-3">
      {dims.map(([label, d]) => (
        <DimensionCard key={label} label={label} dim={d} onQuote={onQuote} />
      ))}
    </div>
  );
}

function RedFlagsTab({
  report,
  onQuote,
}: {
  report: Report;
  onQuote: (ms: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-destructive mb-1">
          Red flags
        </p>
        <FlagList items={report.red_flags} onQuote={onQuote} icon="⚠" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-emerald-600 mb-1">
          Fortalezas
        </p>
        <FlagList items={report.strengths} onQuote={onQuote} icon="✓" />
      </div>
    </div>
  );
}

function DimensionCard({
  label,
  dim,
  onQuote,
}: {
  label: string;
  dim: ScoredDim;
  onQuote: (ms: number) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">{label}</p>
        <div
          className={
            "tabular-nums rounded-md px-2 py-0.5 text-xs font-medium " +
            scoreColorClass(dim.score)
          }
        >
          {dim.score}
        </div>
      </div>
      <QuoteList quotes={dim.evidence_quotes} onQuote={onQuote} />
    </div>
  );
}

function QuoteList({
  quotes,
  onQuote,
}: {
  quotes: EvidenceQuote[];
  onQuote: (ms: number) => void;
}) {
  if (!quotes || quotes.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1.5">
      {quotes.map((q, i) => (
        <li key={i}>
          <button
            onClick={() => onQuote(q.start_ms)}
            className="text-left text-xs text-card-foreground/80 italic hover:text-foreground border-l-2 border-border hover:border-amber-500 pl-2 transition-colors w-full"
          >
            <span className="tabular-nums text-[10px] text-muted-foreground mr-1">
              {fmtTime(q.start_ms)}
            </span>
            “{q.text}”
          </button>
        </li>
      ))}
    </ul>
  );
}

function FlagList({
  items,
  onQuote,
  icon,
}: {
  items: FlagItem[];
  onQuote: (ms: number) => void;
  icon: string;
}) {
  if (items.length === 0) {
    return <p className="text-xs italic text-muted-foreground">—</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((f, i) => (
        <li key={i}>
          <p className="text-sm text-card-foreground">
            {icon} {f.label}
          </p>
          {f.evidence_quote ? (
            <button
              onClick={() => onQuote(f.evidence_quote!.start_ms)}
              className="mt-0.5 text-left text-xs italic text-muted-foreground hover:text-foreground border-l-2 border-border hover:border-amber-500 pl-2 transition-colors w-full"
            >
              <span className="tabular-nums text-[10px] mr-1">
                {fmtTime(f.evidence_quote.start_ms)}
              </span>
              “{f.evidence_quote.text}”
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
