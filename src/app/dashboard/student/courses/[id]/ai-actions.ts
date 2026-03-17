"use server"

import prisma from "@/lib/prisma"

async function callGemini(prompt: string, context: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("AI Action: GEMINI_API_KEY is undefined in process.env.");
    return null;
  }

  console.log("AI Action: Initiating Gemini Request to Google...");
  try {
    // Model updated to gemini-2.5-flash to bypass lite quota limits
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert academic tutor for the Tusmo SMS platform. 
            Context of the current lesson:
            ---
            ${context}
            ---
            Student Question/Task: ${prompt}
            
            Provide clear, concise, and highly educational responses. Use Markdown for formatting. 
            CRITICAL: If the student asks in Somali, you MUST respond in Somali. Keep a professional yet encouraging tone.`
          }]
        }]
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("AI Action: Gemini API Error Response:", response.status, errorData);
        return null;
    }

    const data = await response.json();
    console.log("AI Action: Gemini Request Successful.");
    
    // Extract text from Gemini response structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error("AI Action: Network or Internal Error (Gemini):", error);
    return null;
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
    const aiSummary = await callGemini(prompt, lesson.content);

    if (aiSummary) {
      return { summary: aiSummary };
    }

    // Fallback Simulation Logic
    await new Promise(resolve => setTimeout(resolve, 1500))
    const paragraphs = lesson.content.split('\n').filter((p: string) => p.trim().length > 20)
    let summary = `### 🎯 Executive Summary: ${lesson.title} (Fallback)\n\n`
    summary += `#### 🗝️ Key Takeaways:\n`
    if (paragraphs.length > 0) {
      const keyPoints = paragraphs.slice(0, 3).map(p => `* **${p.split(/[.!?]/)[0].trim()}.**`)
      summary += keyPoints.join('\n') + '\n\n'
    }
    summary += `#### 💡 Conceptual Synthesis:\nEssentially, this module bridges the gap between theoretical understanding and practical application.`

    return { summary }
  } catch (error: any) {
    console.error("AI Summary Error:", error)
    return { error: `AI System Error: ${error.message}` }
  }
}

export async function askAIQuestion(lessonId: string, question: string) {
  console.log(`AI Action: Question about ${lessonId}: "${question}"`)
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, content: true }
    })

    const context = lesson?.content || "No detailed content available yet.";
    const aiAnswer = await callGemini(question, context);

    if (aiAnswer) {
      return { answer: aiAnswer };
    }

    // Fallback
    await new Promise(resolve => setTimeout(resolve, 1500))
    const q = question.toLowerCase()
    let answer = ""
    const title = lesson?.title || "this lesson"

    if (q.includes("example") || q.includes("tusaale")) {
       answer = `Certainly! Regarding **${title}**, a practical example would be applying these principles to a real-world project.`
    } else {
       answer = `That's a great question about **${title}**. Based on the lesson, the most important thing to remember is that this concept simplifies complex workflows.`
    }

    return { answer: `### 🤖 AI Tutor Response (Simulation)\n\n${answer}\n\n*Note: Gemini API is being configured. Please ensure GEMINI_API_KEY is active.*` }
  } catch (error: any) {
    console.error("AI Question Error:", error)
    return { error: `AI Assistant Error: ${error.message}` }
  }
}

export async function generateQuizQuestions(quizId: string, questionCount: number = 5) {
  console.log(`AI Action: Generating ${questionCount} quiz questions for quiz`, quizId)
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

    const prompt = `Based on the following lesson content, generate exactly ${questionCount} highly educational questions.
    Mix the question types to include: "MCQ" (Multiple Choice), "TRUE_FALSE", "MATCHING", "FILL_BLANK", and "SHORT_ANSWER".
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

    const aiResult = await callGemini(prompt, truncatedContent);

    if (!aiResult) {
      return { error: "AI failed to generate quiz questions." }
    }

    // Clean up response in case Gemini included markdown blocks
    const cleanedResult = aiResult.replace(/```json/g, "").replace(/```/g, "").trim();
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
