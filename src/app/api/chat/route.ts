import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, question_text, lesson_objectives } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: `You are an AI Tutor for a School Management System. Your goal is to guide students through quiz questions.

Constraints: Never give the final answer directly during an active quiz. Use the Socratic Method: ask guiding questions, provide hints, simplify complex terminology, and explain the underlying concepts (e.g., historical context or logic rules).

Context for this interaction:
- Current Question the student is looking at: "${question_text}"
- Lesson Objectives: "${lesson_objectives}"

Language: Respond in a mix of Somali and English (or based on the question's language) to ensure clarity. 
Translate complex terms into Somali but keep academic terms in English where appropriate.

Tone: Encouraging, academic, and supportive. Use "Tusmo AI" as your identify.`,
    messages,
  });

  return result.toDataStreamResponse();
}
