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

    const prompt = `Based on the following lesson content, generate exactly ${questionCount} highly educational multiple-choice questions. 
    Output the result EXCLUSIVELY as a JSON array of objects. Do not include any other text or markdown formatting.
    
    Each object must have exactly this structure:
    {
      "question": "The question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0,
      "hint": "A short hint for the student"
    }
    
    Make the questions challenging but fair. Use the same language as the lesson (Somali or English).`;

    const aiResult = await callGemini(prompt, truncatedContent);

    if (!aiResult) {
      return { error: "AI failed to generate quiz questions." }
    }

    // Clean up response in case Gemini included markdown blocks
    const cleanedResult = aiResult.replace(/```json/g, "").replace(/```/g, "").trim();
    const questions = JSON.parse(cleanedResult);

    // Map AI result to our Data Format
    const formattedQuestions = questions.map((q: any) => ({
      id: crypto.randomUUID(),
      type: "MCQ",
      question: q.question,
      points: 1,
      required: true,
      shuffleOptions: true,
      hint: q.hint,
      options: q.options.map((opt: string, idx: number) => ({
        id: crypto.randomUUID(),
        text: opt,
        isCorrect: idx === q.correctIndex,
        matchKey: ""
      }))
    }));

    return { success: true, questions: formattedQuestions };
  } catch (error: any) {
    console.error("AI Generate Quiz Error:", error)
    return { error: `AI Quiz Error: ${error.message}` }
  }
}
