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

    // Vercel AI SDK handles multi-turn beautifully but Gemini strictly refuses 
    // an initial assistant message. We filter it out carefully.
    const safeMessages = messages.filter((m: any) => m.id !== 'welcome');
    console.log(`[CHAT-DEBUG] Sending ${safeMessages.length} messages to Gemini. Input: "${messages[messages.length-1]?.content.slice(0, 50)}..."`);

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: `Halkan waxaa jooga Tusmo AI Tutor. Magacaaga waa Tusmo AI.
Hada waxaad caawineysaa arday cashar baranaya.

MAUDUCA casharka: ${lesson_objectives}
SU'AASHA ardayga (hadii ay jirto): ${question_text}

CONSTRAINTS:
1. Ha siin ardayga jawaabta tooska ah haddii ay tahay imtixaan ama weydiin.
2. Isticmaal habka loo yaqaan 'Socratic Method': weydii su'aalo hage u ah, siiya tilmaamo, fududee hadalka.
3. Luqaddu waa Somali iyo English oo la isku daray si ardaygu u fahmo.
4. Ha isticmaalin erayo adag, hadii aad isticmaashidna u turjun.

Jawaabtaadu ha ahaato mid dhiirigelin leh (Encouraging).`,
      messages: safeMessages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[CHAT-API-ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
