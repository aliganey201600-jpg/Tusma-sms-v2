"use server"

import prisma from "@/lib/prisma"

export async function generateLessonSummary(lessonId: string) {
  console.log("AI Action: Generating summary for", lessonId)
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, content: true, objectives: true }
    })

    if (!lesson || !lesson.content) {
      console.warn("AI Action: Lesson not found in DB, using fallback simulation data")
      await new Promise(resolve => setTimeout(resolve, 1500))
      return { 
        summary: `### 🎯 Quick Summary (Simulation Mode)\n\nThis is a high-density summary of the current module. \n\n#### 🗝️ Key Takeaways:\n* **Structural Efficiency:** Understanding the core framework of the subject.\n* **Strategic Application:** How to apply these concepts in real-world scenarios.\n* **Optimized Learning:** Focus on the primary objectives defined in the curriculum.\n\n*Note: To see a personalized summary, ensure the lesson has content saved in the database.*` 
      }
    }

    // AI Simulation Logic
    await new Promise(resolve => setTimeout(resolve, 2000))

    const content = lesson.content
    const paragraphs = content.split('\n').filter((p: string) => p.trim().length > 20)
    
    let summary = `### 🎯 Executive Summary: ${lesson.title}\n\n`
    summary += `This lesson focuses on the core principles of **${lesson.title}**. `
    
    if (lesson.objectives) {
       summary += `By the end of this module, we aim to master: ${lesson.objectives}\n\n`
    }

    summary += `#### 🗝️ Key Takeaways:\n`
    
    if (paragraphs.length > 0) {
      const keyPoints = paragraphs.slice(0, 3).map(p => {
         const firstSentence = p.split(/[.!?]/)[0]
         return `* **${firstSentence.trim()}.**`
      })
      summary += keyPoints.join('\n') + '\n\n'
    } else {
      summary += `* **Core Focus:** Deep dive into the methodology of ${lesson.title}.\n* **Implementation:** Practicing the concepts through hands-on exercises.\n\n`
    }
    
    summary += `#### 💡 Conceptual Synthesis:\n`
    summary += `Essentially, this module bridges the gap between theoretical understanding and practical application. It emphasizes the importance of consistency and deep semantic analysis in mastering the subject matter.`

    return { summary }
  } catch (error: any) {
    console.error("AI Summary Error:", error)
    return { error: `AI System Error: ${error.message || "Failed to generate AI summary."}` }
  }
}

export async function askAIQuestion(lessonId: string, question: string) {
  console.log(`AI Action: Question about ${lessonId}: "${question}"`)
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true, content: true }
    })

    await new Promise(resolve => setTimeout(resolve, 1500))

    const q = question.toLowerCase()
    let answer = ""
    const title = lesson?.title || "this lesson"

    if (q.includes("example") || q.includes("tusaale")) {
       answer = `Certainly! Regarding **${title}**, a practical example would be applying these principles to a real-world project. For instance, if you're building a system, you would use these concepts to ensure structural integrity and efficiency.`
    } else if (q.includes("why") || q.includes("maxaa")) {
       answer = `The reason this is important is because it forms the foundational logic for the entire module. Without understanding this core concept, subsequent advanced topics might feel disconnected.`
    } else if (q.includes("how") || q.includes("sidee")) {
       answer = `To implement this, you should start by breaking down the module into smaller, manageable chunks. Focus on the first paragraph where the core methodology is defined.`
    } else {
       answer = `That's a great question about **${title}**. Based on the lesson content, the most important thing to remember is that this concept is designed to simplify complex workflows. I recommend reviewing the "Key Takeaways" section in the summary for a clearer picture.`
    }

    return { answer: `### 🤖 AI Tutor Response\n\n${answer}\n\n*Is there anything else specifically about ${title} you'd like me to clarify?*` }
  } catch (error: any) {
    console.error("AI Question Error:", error)
    return { error: `AI Assistant Error: ${error.message || "Unavailable."}` }
  }
}
