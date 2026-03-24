const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        teacherAssignments: { 
          include: { 
            class: { 
              select: { 
                name: true,
                _count: { select: { students: true } }
              } 
            } 
          }
        },
        _count: {
          select: {
            enrollments: true,
          }
        },
        sections: {
          include: {
            _count: { select: { quizzes: true } }
          }
        }
      }
    });
    console.log('Successfully fetched courses:', courses.length);

    const mapped = courses.map(c => {
      const classStudents = c.teacherAssignments.reduce((acc, ta) => acc + (ta.class?._count.students || 0), 0);
      const totalEnrolled = Math.max(c._count.enrollments, classStudents);

      return {
        id: c.id,
        name: c.name,
        teacher: `${c.teacher?.firstName} ${c.teacher?.lastName}`,
        className: c.teacherAssignments.map(ta => ta.class?.name).filter(Boolean).join(", "),
        studentsCount: totalEnrolled,
        quizCount: c.sections.reduce((acc, s) => acc + s._count.quizzes, 0),
        category: c.category || "General",
        classId: c.teacherAssignments[0]?.classId || null 
      };
    });

    console.log('MAPPED works! First Course:', mapped[0]);
  } catch (e) {
    console.error('CRASH:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
