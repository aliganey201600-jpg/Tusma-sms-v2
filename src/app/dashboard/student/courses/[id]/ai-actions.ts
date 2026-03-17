"use server"

import prisma from "@/lib/prisma"

async function callOpenAI(prompt: string, context: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("AI Action: OPENAI_API_KEY IS UNDEFINED IN ENVIRONMENT.");
    return null;
  }

  console.log("AI Action: Initiating OpenAI Request...");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert academic tutor for the Tusmo SMS platform. 
            Context: ${context}
            If the question is in Somali, respond in Somali.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("AI Action: OpenAI API Error Response:", response.status, errorData);
        return null;
    }

    const data = await response.json();
    console.log("AI Action: OpenAI Request Successful.");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Action: Network or Internal Error:", error);
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

    // Try OpenAI
    const prompt = `Generate a high-density executive summary for the lesson titled "${lesson.title}". Focus on key takeaways and conceptual synthesis.`;
    const aiSummary = await callOpenAI(prompt, lesson.content);

    if (aiSummary) {
      return { summary: aiSummary };
    }

    // Fallback Simulation Logic
    await new Promise(resolve => setTimeout(resolve, 1500))
    const paragraphs = lesson.content.split('\n').filter((p: string) => p.trim().length > 20)
    let summary = `### 🎯 Executive Summary: ${lesson.title}\n\n`
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
    const aiAnswer = await callOpenAI(question, context);

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

    return { answer: `### 🤖 AI Tutor Response (Simulation)\n\n${answer}\n\n*Note: Connect OpenAI API for real-time intelligence.*` }
  } catch (error: any) {
    console.error("AI Question Error:", error)
    return { error: `AI Assistant Error: ${error.message}` }
  }
}
