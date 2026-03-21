const fs = require('fs');
const path = 'src/app/dashboard/admin/grading/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// Update submitGradeUpdate to trigger notifications
const oldSubmitGrade = `    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: true }
    })
    
    if (!attempt) return { success: false, error: "Attempt not found" }

    const passed = score >= (attempt.quiz?.passingScore || 70)

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        results: updatedResults,
        score,
        earnedPoints,
        totalPoints,
        passed
      }
    })

    revalidatePath('/dashboard/admin/grading')`;

const newSubmitGrade = `    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { 
        quiz: true, 
        student: { 
          select: { firstName: true, lastName: true, phone: true, guardianPhone: true } 
        } 
      }
    })
    
    if (!attempt) return { success: false, error: "Attempt not found" }

    const passed = score >= (attempt.quiz?.passingScore || 50)

    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        results: updatedResults,
        score,
        earnedPoints,
        totalPoints,
        passed
      }
    })

    // Trigger notification
    const studentName = \`\${attempt.student?.firstName} \${attempt.student?.lastName}\`;
    const message = \`Salaam, Nidaamka Tusmo School: Quiz-ka \${attempt.quiz?.title} ee ardayga \${studentName} waa la saxay. Dhibcahaagu waa \${score}%. Mahadsanid.\`;

    if (attempt.student?.guardianPhone) sendWhatsAppNotification({ phone: attempt.student.guardianPhone, message });
    if (attempt.student?.phone) sendWhatsAppNotification({ phone: attempt.student.phone, message });

    revalidatePath('/dashboard/admin/grading')`;

content = content.replace(oldSubmitGrade, newSubmitGrade);

fs.writeFileSync(path, content);
console.log('Automated Quiz Grading notifications added!');
