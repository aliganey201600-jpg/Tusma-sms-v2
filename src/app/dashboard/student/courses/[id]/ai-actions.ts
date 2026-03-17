"use server"

import prisma from "@/lib/prisma"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string, context: string) {
  if (!GEMINI_API_KEY) {
    console.error("AI Action: GEMINI_API_KEY IS MISSING.");
    return null;
  }

  console.log("AI Action: Initiating Gemini Request...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
