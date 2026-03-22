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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format messages for Google Generative AI
    // We filter out the assistant role if it's the first message because Gemini is strict
    // although our frontend already handles this now.
    const history = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const result = await model.generateContentStream({
      contents: history,
      systemInstruction: {
        role: "system",
        parts: [{ text: `Magacaaga waa Tusmo AI. Waxaad tahay kaaliyaha ardayda koorsadan: "${lesson_objectives}".
        Current Activity: ${question_text}
        
        CONSTRAINTS:
        1. Ha siin jawaabta tooska ah.
        2. Isticmaal 'Socratic Method' (Su'aalo hage ah).
        3. Luqadda: Somali iyo English.` }]
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // useChat (ai package) expects tokens to be prefixed with '0:' for the stream protocol
              // or just the raw text if it's a simple text stream.
              // To be safe and compatible with useChat tokens:
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
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
