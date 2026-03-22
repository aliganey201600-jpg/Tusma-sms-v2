import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("[CHAT-API-ERROR]: GEMINI_API_KEY is missing");
      return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
    }

    const { messages, question_text, lesson_objectives } = await req.json();

    console.log(`[CHAT-DEBUG] Processing ${messages.length} messages. User: ${messages[messages.length-1]?.content.slice(0, 30)}`);

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: `Magacaaga waa Tusmo AI. Waxaad tahay kaaliyaha ardayda koorsadan: "${lesson_objectives}".
Current Activity: ${question_text}

CONSTRAINTS:
1. Ha siin jawaabta tooska ah.
2. Isticmaal 'Socratic Method' (Su'aalo hage ah).
3. Luqadda: Somali iyo English.`,
      messages: messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[CHAT-API-ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
