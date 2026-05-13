import { z } from "zod";
import { analyzeJob } from "@talentforge/agents";

export const runtime = "nodejs";
// Allow up to ~30s per analysis (Vercel hobby limit on Node functions).
export const maxDuration = 30;

const BodySchema = z.object({
  description: z.string().min(40).max(15000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parse.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const { description } = parse.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };
      try {
        for await (const event of analyzeJob({
          description,
          signal: request.signal,
        })) {
          send(event);
          if (event.type === "done" || event.type === "error") break;
        }
      } catch (err: unknown) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
