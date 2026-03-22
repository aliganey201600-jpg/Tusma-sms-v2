"use server"
// Deployment: v1.3.1 - SDK Live
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma"

async function callGemini(prompt: string, context: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "GEMINI_API_KEY is missing." };

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-1.5-flash as it is extremely fast and reliable for these tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert academic tutor for the Tusmo SMS platform. 
    Context of the current lesson:
    ---
    ${context}
    ---
    Student Question/Task: ${prompt}
    
    Provide clear, concise, and highly educational responses. Use Markdown for formatting. 
    CRITICAL: If the student asks in Somali or if the prompt is in Somali, you MUST respond in Somali. Keep a professional yet encouraging tone.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return { error: "AI returned an empty response. This might be due to safety filters." };
    }

    return { text };
  } catch (error: any) {
    console.error("AI Action: Fatal Error:", error);
    // Check for specific SDK errors
    if (error.message?.includes("API_KEY_INVALID")) {
      return { error: "Your AI API Key is invalid. Please check your .env settings." };
    }
    return { error: `AI Error: ${error.message || "Something went wrong while thinking."}` };
  }
}


export async function generateLessonSummary(lessonId: string) {
  console.log("AI Action: Generating summary for", lessonId)
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, content: true, objectives: true }
    })

    if (!lesson || !lesson.content) {
      return { 
        summary: `### 🎯 Quick Summary (Simulation Mode)\n\nThis module focuses on the core foundations of the subject. \n\n#### 🗝️ Key Takeaways:\n* **Core Methodology:** Understanding the primary frameworks.\n* **Integration:** How these concepts apply broadly.\n* **Mastery:** Focus on the objectives defined in the curriculum.` 
      }
    }

    // Try Gemini
    const prompt = `Generate a high-density executive summary for the lesson titled "${lesson.title}". Focus on key takeaways and conceptual synthesis. Response should be in the language of the lesson or Somali if preferred by the context.`;
    const res = await callGemini(prompt, lesson.content);

    if (res.text) {
      return { summary: res.text };
    }

    return { error: res.error || "AI Engine is currently unresponsive. Please check your GEMINI_API_KEY or network connection." };
  } catch (error: any) {
    console.error("AI Summary Error:", error)
    return { error: `AI System Error: ${error.message}` }
  }
}

export async function askAIQuestion(lessonId: string, question: string) {
  console.log(`AI Action: Live Question about ${lessonId}: "${question}"`)
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, content: true }
    })

    const context = lesson?.content || "No detailed content available yet.";
    const res = await callGemini(question, context);

    if (res.text) {
      return { answer: res.text };
    }

    return { error: res.error || "I'm having trouble connecting to my knowledge base right now. Please try again in a moment." };
  } catch (error: any) {
    console.error("AI Question Error:", error)
    return { error: `AI Assistant Error: ${error.message}` }
  }
}

export async function generateQuizQuestions(quizId: string, counts: Record<string, number>) {
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`AI Action: Generating ${totalCount} customized quiz questions for quiz`, quizId)
  
  if (totalCount === 0) return { error: "Please configure at least one question to generate." }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: { select: { title: true, content: true } },
        section: { 
          include: { 
            lessons: { select: { title: true, content: true }, orderBy: { order: 'asc' } } 
          } 
        }
      }
    })

    if (!quiz) return { error: "Quiz context not found." }

    let contentToAnalyze = "";

    if (quiz.lesson?.content) {
      contentToAnalyze = quiz.lesson.content;
    } else if (quiz.section?.lessons?.length) {
      contentToAnalyze = quiz.section.lessons
        .filter((l: any) => l.content)
        .map((l: any) => l.content)
        .join("\n\n");
    }

    if (!contentToAnalyze.trim()) {
      return { error: "We couldn't find any text content in this section's lectures to generate questions from. Please add some written content to your lessons first." }
    }

    // Limit content length to prevent token overflow
    const truncatedContent = contentToAnalyze.slice(0, 50000);

    const prompt = `Based on the following lesson content, generate exactly ${totalCount} highly educational questions.
    The exact breakdown of question types MUST be:
    - ${counts.MCQ || 0} MCQ (Multiple Choice)
    - ${counts.TRUE_FALSE || 0} TRUE_FALSE
    - ${counts.MATCHING || 0} MATCHING
    - ${counts.FILL_BLANK || 0} FILL_BLANK
    - ${counts.SHORT_ANSWER || 0} SHORT_ANSWER

    Make the questions challenging but fair. Use the same language as the lesson (Somali or English).
    
    Output the result EXCLUSIVELY as a JSON array of objects. Do not include any other text or markdown formatting.
    
    Each object must strictly follow its type's structure:
    
    For MCQ:
    { "type": "MCQ", "question": "Question text", "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"], "correctIndex": 0, "hint": "Hint text", "points": 1 }
    
    For TRUE_FALSE:
    { "type": "TRUE_FALSE", "question": "Statement text", "isTrue": true, "hint": "Hint text", "points": 1 }
    
    For MATCHING:
    { "type": "MATCHING", "question": "Match the following terms", "pairs": [{"left": "Term A", "right": "Def A"}, {"left": "Term B", "right": "Def B"}], "hint": "Hint text", "points": 2 }
    
    For FILL_BLANK:
    { "type": "FILL_BLANK", "question": "Water boils at ____ degrees Celsius.", "correctAnswer": "100", "hint": "Hint text", "points": 1 }
    
    For SHORT_ANSWER:
    { "type": "SHORT_ANSWER", "question": "Explain X briefly.", "hint": "Hint text", "points": 3 }`;

    const res = await callGemini(prompt, truncatedContent);

    if (res.error || !res.text) {
      return { error: res.error || "AI failed to generate quiz questions." }
    }

    // Clean up response in case Gemini included markdown blocks
    const cleanedResult = res.text.replace(/```json/g, "").replace(/```/g, "").trim();
    let questions;
    try {
      questions = JSON.parse(cleanedResult);
    } catch (e) {
      console.error("Failed to parse AI JSON:", cleanedResult);
      return { error: "AI generated an invalid format. Please try again." }
    }

    // Map AI result to our Data Format based on question type
    const formattedQuestions = questions.map((q: any) => {
      const baseQ = {
        id: crypto.randomUUID(),
        type: q.type || "MCQ",
        question: q.question,
        points: q.points || 1,
        required: true,
        shuffleOptions: false,
        hint: q.hint || "",
        correctAnswer: "",
        options: [] as any[]
      };

      if (baseQ.type === "MCQ") {
        baseQ.shuffleOptions = true;
        baseQ.options = (q.options || []).map((opt: string, idx: number) => ({
          id: crypto.randomUUID(),
          text: opt,
          isCorrect: idx === q.correctIndex,
          matchKey: ""
        }));
      } else if (baseQ.type === "TRUE_FALSE") {
        const isTrue = q.isTrue === true;
        baseQ.options = [
          { id: crypto.randomUUID(), text: "True", isCorrect: isTrue, matchKey: "" },
          { id: crypto.randomUUID(), text: "False", isCorrect: !isTrue, matchKey: "" }
        ];
      } else if (baseQ.type === "MATCHING") {
        baseQ.options = (q.pairs || []).map((pair: any) => ({
          id: crypto.randomUUID(),
          text: pair.left,
          isCorrect: false,
          matchKey: pair.right
        }));
      } else if (baseQ.type === "FILL_BLANK") {
        baseQ.correctAnswer = q.correctAnswer || "";
      } else if (baseQ.type === "SHORT_ANSWER") {
        // Short answers are manually graded, no correct answer needed here
      } else if (baseQ.type === "ESSAY") {
         // Fallback just in case AI spits out an essay type
      }

      return baseQ;
    });

    return { success: true, questions: formattedQuestions };
  } catch (error: any) {
    console.error("AI Generate Quiz Error:", error)
    return { error: `AI Quiz Error: ${error.message}` }
  }
}

export async function performSmartAIAction(lessonId: string, task: 'explain' | 'summarize' | 'translate', text: string) {
  console.log(`AI Action: Smart ${task} for lesson ${lessonId}: "${text.slice(0, 50)}..."`)
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, content: true }
    });

    if (!lesson) return { error: "Could not find the lesson data to provide context." };

    // Truncate context for performance if needed
    const contextBody = lesson.content?.substring(0, 10000) || "";
    const context = `Lesson Title: ${lesson.title}. \nContent: ${contextBody}`;
    
    let prompt = "";
    if (task === 'explain') {
      prompt = `Sharaxaad kooban oo cad ka bixi qoraalkan soo socda, adigoo isticmaalaya luqadda Soomaaliga. Haddii ay jiraan erayo adag, si fudud u sharax oo tusaale soo qaado. Qoraalka la doortay: "${text}"`;
    } else if (task === 'summarize') {
      prompt = `Soo koob qoraalkan soo socda adigoo isticmaalaya luqadda Soomaaliga. Ka dhig mid kooban oo nuxurka muhiimka ah xambaarsan. Qoraalka la doortay: "${text}"`;
    } else if (task === 'translate') {
      prompt = `U turjum qoraalkan soo socda af Soomaali sax ah oo dabiici ah. Qoraalka la doortay: "${text}"`;
    }

    const res = await callGemini(prompt, context);

    if (res.text) {
      return { result: res.text };
    }

    return { error: res.error || "AI was unable to process this specific fragment." };
  } catch (error: any) {
    console.error("Smart AI Action Error:", error)
    return { error: `Smart AI Error: ${error.message || "Unknown error occurred"}` }
  }
}
