const fs = require('fs');
const path = 'src/app/dashboard/admin/exams/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import for sendWhatsAppNotification
if (!content.includes('import { sendWhatsAppNotification }')) {
    content = content.replace('import { revalidatePath } from "next/cache";', 'import { revalidatePath } from "next/cache";\nimport { sendWhatsAppNotification } from "@/utils/whatsapp";');
}

// 2. Enhance toggleExamStatus to trigger notifications when published
const oldToggleStatus = `export async function toggleExamStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    await prisma.exam.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath("/dashboard/admin/exams");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling exam status:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan badalo heerka imtixaanka" };
  }
}`;

const newToggleStatus = `export async function toggleExamStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    await prisma.exam.update({
      where: { id },
      data: { status: newStatus }
    });

    // If published, trigger automated notifications
    if (newStatus === "PUBLISHED") {
      const exam = await prisma.exam.findUnique({
        where: { id },
        include: {
          course: { select: { name: true } },
          class: { select: { name: true } },
          examResults: {
            include: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  guardianPhone: true
                }
              }
            }
          }
        }
      });

      if (exam && exam.examResults.length > 0) {
        exam.examResults.forEach(res => {
          const student = res.student;
          const studentName = \`\${student.firstName} \${student.lastName}\`;
          const score = res.marksObtained;
          const max = exam.maxMarks;
          const pct = Math.round((Number(score) / max) * 100);
          
          const message = \`Salaam, Nidaamka Tusmo School: Natiijada imtixaanka \${exam.title} (\${exam.course.name}) ee ardayga \${studentName} waa la soo saaray. Dhibcuhu waa \${score}/\${max} (\${pct}%). Mahadsanid.\`;

          if (student.guardianPhone) {
            sendWhatsAppNotification({ phone: student.guardianPhone, message });
          }
          if (student.phone) {
            sendWhatsAppNotification({ phone: student.phone, message });
          }
        });
      }
    }

    revalidatePath("/dashboard/admin/exams");
    return { success: true, newStatus };
  } catch (error) {
    console.error("Error toggling exam status:", error);
    return { success: false, error: "Waa laygu guuldareystay inaan badalo heerka imtixaanka" };
  }
}`;

content = content.replace(oldToggleStatus, newToggleStatus);

fs.writeFileSync(path, content);
console.log('Automated Exam Publication notifications added!');
