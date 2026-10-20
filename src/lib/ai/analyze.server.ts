import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

export const analysisSchema = z.object({
  verdict: z.enum(["fake", "suspicious", "legitimate"]),
  fakeProbability: z.number(),
  summary: z.string(),
  signals: z.array(
    z.object({
      phrase: z.string(),
      category: z.string(),
      weight: z.number(),
      explanation: z.string(),
    }),
  ),
  features: z.array(z.object({ name: z.string(), score: z.number() })),
});
export type Analysis = z.infer<typeof analysisSchema>;

const INSTRUCTIONS = `You are IntelliHire, a transformer-based NLP classifier for job-posting fraud with explainable-AI output.
Analyse the job posting and return:
- verdict: fake, suspicious, or legitimate.
- fakeProbability: 0-100, likelihood the posting is fraudulent.
- summary: 2 sentences explaining the decision in plain language.
- signals: 4-10 token-level attributions (like SHAP/attention). "phrase" MUST be an exact, verbatim substring copied from the posting (3-12 words). weight from -1 (strongly indicates legitimate) to +1 (strongly indicates fake). category e.g. "Payment request", "Unrealistic pay", "Vague role", "Contact channel", "Urgency", "Company details", "Requirements". explanation: one short sentence.
- features: exactly 6 feature contributions with score -1..1 (positive = pushes toward fake) named: "Salary realism", "Company verifiability", "Communication channel", "Upfront payment", "Language quality", "Urgency pressure".`;

export async function analyzePosting(text: string): Promise<Analysis> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    messages: [{ role: "user", content: `Job posting:\n"""\n${text}\n"""` }],
    output: Output.object({ schema: analysisSchema }),
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    const out = await result.output;
    const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
    return {
      ...out,
      fakeProbability: clamp(Math.round(out.fakeProbability), 0, 100),
      signals: out.signals.map((s) => ({ ...s, weight: clamp(s.weight, -1, 1) })),
      features: out.features.map((f) => ({ ...f, score: clamp(f.score, -1, 1) })),
    };
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e)) throw new Error("The analysis came back incomplete. Please try again.");
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 429) throw new Error("Too many requests right now. Please wait a moment and try again.");
    if (status === 402) throw new Error("AI credits are used up. Please add credits to continue.");
    throw e;
  }
}
