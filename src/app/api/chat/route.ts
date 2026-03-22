import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, question_text, lesson_objectives } = await req.json();

    // Flatten history to avoid Gemini strict role alternation errors 
    // This provides the reliability the user wants by turning multi-turn into a single monolithic user prompt.
    const historyText = messages
      .map((m: any) => `${m.role === 'user' ? 'STUDENT' : 'AI TUTOR'}:\n${m.content}`)
      .join("\n\n---\n\n");

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are an AI Tutor for a School Management System. Your goal is to guide students through quiz questions or lesson concepts.

Constraints: Never give the final answer directly during an active quiz. Use the Socratic Method: ask guiding questions, provide hints, simplify complex terminology, and explain the underlying concepts (e.g., historical context or logic rules).

Context for this interaction:
- Current Target: "${question_text}"
- Lesson Content/Objectives: "${lesson_objectives}"

Language: Respond in a mix of Somali and English (or based on the question's language) to ensure clarity. 
Translate complex terms into Somali but keep academic terms in English where appropriate.

Tone: Encouraging, academic, and supportive. Use "Tusmo AI" as your identity. 

Read the conversation history below and provide the next AI TUTOR response. Do not include 'AI TUTOR:' in your response text.`,
      prompt: historyText,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error("[CHAT-API-ERROR]:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
