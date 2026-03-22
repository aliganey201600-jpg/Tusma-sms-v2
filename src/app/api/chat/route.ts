import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500 });
    }

    const { messages, lesson_objectives, question_text } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const contents = messages.map((m: any, i: number) => {
      let text = m.content;
      if (i === 0) {
        // Prepend system context to the first message for maximum stability
        text = `Magacaaga waa Tusmo AI. Waxaad tahay kaaliyaha ardayda koorsadan: "${lesson_objectives}".
Current Activity: ${question_text}

CONSTRAINTS:
1. Ha siin jawaabta tooska ah.
2. Isticmaal 'Socratic Method' (Su'aalo hage ah).
3. Luqadda: Somali iyo English.

USER QUESTION:
${text}`;
      }
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text }]
      };
    });

    const streamingResponse = await model.generateContentStream({ contents });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamingResponse.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              // Standard Vercel AI SDK DataStream format: 0:"json-string-token"\n
              controller.enqueue(encoder.encode(`0:${JSON.stringify(chunkText)}\n`));
            }
          }
        } catch (e: any) {
          console.error("Stream reader error:", e);
          controller.enqueue(encoder.encode(`3:${JSON.stringify(e.message)}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[CHAT-API-ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
