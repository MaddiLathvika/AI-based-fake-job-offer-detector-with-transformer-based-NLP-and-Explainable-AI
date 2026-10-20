import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const analyzeJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(40).max(12000) }).parse(d))
  .handler(async ({ data }) => {
    const { analyzePosting } = await import("./analyze.server");
    return analyzePosting(data.text);
  });
