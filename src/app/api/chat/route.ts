import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, question_text, lesson_objectives } = await req.json();

    // Vercel AI SDK handles multi-turn beautifully but Gemini strictly refuses 
    // an initial assistant message. We filter it out carefully.
    const safeMessages = messages.filter((m: any) => m.id !== 'welcome');

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an AI Tutor for a School Management System. Your goal is to guide students through quiz questions or lesson concepts.

Constraints: Never give the final answer directly during an active quiz. Use the Socratic Method: ask guiding questions, provide hints, simplify complex terminology, and explain the underlying concepts (e.g., historical context or logic rules).

Context for this interaction:
- Current Target: "${question_text}"
- Lesson Content/Objectives: "${lesson_objectives}"

Language: Respond in a mix of Somali and English (or based on the question's language) to ensure clarity. 
Translate complex terms into Somali but keep academic terms in English where appropriate.

Tone: Encouraging, academic, and supportive. Use "Tusmo AI" as your identity.`,
      messages: safeMessages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[CHAT-API-ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
