import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, type ReactNode } from "react";
import hero from "@/assets/hero.jpg";
import { analyzeJob } from "@/lib/ai/analyze.functions";
import type { Analysis } from "@/lib/ai/analyze.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntelliHire — AI Fake Job Offer Detector" },
      { name: "description", content: "Paste a job description and IntelliHire's transformer-based NLP tells you if it's real or fake — with explainable AI showing exactly why." },
      { property: "og:title", content: "IntelliHire — AI Fake Job Offer Detector" },
      { property: "og:description", content: "Transformer NLP + explainable AI to spot fraudulent job postings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SAMPLE = `URGENT HIRING!! Work From Home Data Entry Executive. Earn $5,000 per week with no experience required! Only 2 hours a day. Limited slots available, apply today. To confirm your position, pay a one-time registration fee of $99 for training kit. Contact our HR manager on WhatsApp +1 555 0199 or email hr.globaljobs2026@gmail.com. No interview needed.`;

function tone(w: number) {
  if (w > 0.15) return "bg-destructive/25 border-b-2 border-destructive";
  if (w < -0.15) return "bg-safe/20 border-b-2 border-safe";
  return "bg-warn/15 border-b-2 border-warn";
}

function Highlighted({ text, signals }: { text: string; signals: Analysis["signals"] }) {
  const parts = useMemo(() => {
    const ranges: { s: number; e: number; i: number }[] = [];
    const lower = text.toLowerCase();
    signals.forEach((sig, i) => {
      const idx = lower.indexOf(sig.phrase.toLowerCase());
      if (idx >= 0 && !ranges.some((r) => idx < r.e && idx + sig.phrase.length > r.s))
        ranges.push({ s: idx, e: idx + sig.phrase.length, i });
    });
    ranges.sort((a, b) => a.s - b.s);
    const out: ReactNode[] = [];
    let pos = 0;
    ranges.forEach((r) => {
      if (r.s > pos) out.push(text.slice(pos, r.s));
      out.push(
        <mark key={r.s} title={signals[r.i].explanation} className={`rounded-sm px-0.5 text-foreground ${tone(signals[r.i].weight)}`}>
          {text.slice(r.s, r.e)}
          <sup className="ml-0.5 font-mono text-[10px] text-muted-foreground">{r.i + 1}</sup>
        </mark>,
      );
      pos = r.e;
    });
    out.push(text.slice(pos));
    return out;
  }, [text, signals]);
  return <p className="whitespace-pre-wrap font-mono text-sm leading-7">{parts}</p>;
}

function Index() {
  const analyze = useServerFn(analyzeJob);
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const r = await analyze({ data: { text } });
      setResult(r);
      setAnalyzed(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const verdictColor =
    result?.verdict === "fake" ? "text-destructive" : result?.verdict === "legitimate" ? "text-safe" : "text-warn";

  return (
    <main className="min-h-screen">
      <header className="relative overflow-hidden border-b">
        <img src={hero} alt="" width={1280} height={768} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Transformer NLP · Explainable AI</p>
          <h1 className="mt-4 font-display text-6xl font-semibold md:text-7xl">IntelliHire</h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Paste any job posting. We read it like a fraud analyst would — and show you every word that tipped the scale.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="jd" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Job description</label>
            <button onClick={() => setText(SAMPLE)} className="font-mono text-xs text-primary underline-offset-4 hover:underline">
              Try a sample scam
            </button>
          </div>
          <textarea
            id="jd"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job posting here…"
            className="mt-3 h-80 w-full resize-none rounded-md border bg-card p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={run}
            disabled={loading || text.trim().length < 40}
            className="mt-4 w-full rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Analysing tokens…" : "Detect fraud"}
          </button>
          {text.trim().length > 0 && text.trim().length < 40 && (
            <p className="mt-2 text-xs text-muted-foreground">Paste a bit more text (at least 40 characters).</p>
          )}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>

        <div className="rounded-md border bg-card p-6">
          {!result ? (
            <div className="flex h-full min-h-80 items-center justify-center text-center text-muted-foreground">
              {loading ? "Running classification and attribution…" : "Your verdict and explanation will appear here."}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Verdict</p>
                  <p className={`font-display text-5xl font-semibold capitalize ${verdictColor}`}>{result.verdict}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Fraud probability</p>
                  <p className="font-mono text-4xl">{result.fakeProbability}%</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gradient-to-r from-safe via-warn to-destructive" style={{ width: `${result.fakeProbability}%` }} />
              </div>
              <p className="text-sm leading-relaxed">{result.summary}</p>

              <div>
                <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Feature contributions</p>
                <div className="space-y-2">
                  {result.features.map((f) => (
                    <div key={f.name} className="grid grid-cols-[9rem_1fr] items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{f.name}</span>
                      <div className="relative h-3 rounded-sm bg-muted">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                        <div
                          className={`absolute inset-y-0 ${f.score >= 0 ? "left-1/2 bg-destructive" : "right-1/2 bg-safe"}`}
                          style={{ width: `${Math.abs(f.score) * 50}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex justify-between pl-36 font-mono text-[10px] text-muted-foreground">
                  <span>← legitimate</span><span>fake →</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {result && (
        <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-2">
          <div className="rounded-md border bg-card p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Token attribution map</p>
            <Highlighted text={analyzed} signals={result.signals} />
          </div>
          <div className="rounded-md border bg-card p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Why the model decided this</p>
            <ol className="space-y-4">
              {result.signals.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{s.category}</span>
                      <span className={`font-mono text-xs ${s.weight > 0 ? "text-destructive" : "text-safe"}`}>
                        {s.weight > 0 ? "+" : ""}{s.weight.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">"{s.phrase}"</p>
                    <p className="mt-1 text-sm">{s.explanation}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </main>
  );
}
