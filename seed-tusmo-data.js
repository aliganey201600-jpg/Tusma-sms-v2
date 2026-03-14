const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  console.log('--- STARTING TUSMO SEEDING ---');

  // 1. Ensure we have at least one Teacher to own the courses
  let teacher = await prisma.teacher.findFirst();
  if (!teacher) {
    console.log('No teacher found. Creating a lead teacher...');
    const userId = crypto.randomUUID();
    await prisma.user.create({
      data: {
        id: userId,
        email: `lead.teacher@tusmo.com`,
        role: 'TEACHER',
        teacher: {
          create: {
            firstName: 'Lead',
            lastName: 'Teacher',
            gender: 'MALE',
            department: 'General Sciences',
            status: 'ACTIVE'
          }
        }
      }
    });
    teacher = await prisma.teacher.findFirst();
  }
  console.log(`Using Teacher: ${teacher.firstName} ${teacher.lastName}`);

  // 2. Create 5 Batches (Tusmo2020-1 to Tusmo2024-5)
  const batches = [];
  for (let i = 0; i < 5; i++) {
    const year = 2020 + i;
    const name = `Tusmo${year}-${i + 1}`;
    const batch = await prisma.batch.upsert({
      where: { name },
      update: {},
      create: {
        name,
        academicYear: `${year}`,
        startDate: new Date(`${year}-01-01`),
        status: 'ACTIVE'
      }
    });
    batches.push(batch);
    console.log(`Batch Created/Verified: ${name}`);
  }

  // 3. Create 5 Classes (Grade 5 to Grade 1)
  const classes = [];
  for (let i = 0; i < 5; i++) {
    const gradeNum = 5 - i;
    const name = `Grade ${gradeNum}`;
    const batch = batches[i]; // i=0 is Tusmo2020-1, linked to Grade 5
    
    const cl = await prisma.class.upsert({
      where: { name_batchId: { name, batchId: batch.id } },
      update: {},
      create: {
        name,
        level: 'Primary',
        grade: gradeNum,
        section: 'A',
        room: `Room ${gradeNum}01`,
        capacity: 30,
        batchId: batch.id
      }
    });
    classes.push(cl);
    console.log(`Class Created/Verified: ${name} (Batch: ${batch.name})`);
  }

  // 4. Create 8 Courses
  const courseNames = [
    { n: 'Arabic', c: 'ARB101', cat: 'Language' },
    { n: 'English', c: 'ENG101', cat: 'Language' },
    { n: 'Somali', c: 'SOM101', cat: 'Language' },
    { n: 'Tarbiyo', c: 'TAR101', cat: 'Religious' },
    { n: 'Science', c: 'SCI101', cat: 'Science' },
    { n: 'Math', c: 'MAT101', cat: 'Numeric' },
    { n: 'Social Science', c: 'SOC101', cat: 'Social' },
    { n: 'Technology', c: 'TECH101', cat: 'Tech' }
  ];

  for (const cn of courseNames) {
    await prisma.course.create({
      data: {
        name: cn.n,
        code: cn.c,
        category: cn.cat,
        level: 1,
        credits: '3.0',
        teacherId: teacher.id
      }
    });
    console.log(`Course Created: ${cn.n}`);
  }

  // 5. Create 10 Students for each of the 5 classes (50 total)
  const names = [
    { f: 'Ahmed', l: 'Abdi', g: 'MALE' },
    { f: 'Fartun', l: 'Ali', g: 'FEMALE' },
    { f: 'Mohamed', l: 'Hassan', g: 'MALE' },
    { f: 'Zahra', l: 'Ismail', g: 'FEMALE' },
    { f: 'Omar', l: 'Yusuf', g: 'MALE' },
    { f: 'Leyla', l: 'Osman', g: 'FEMALE' },
    { f: 'Abdirahman', l: 'Warsame', g: 'MALE' },
    { f: 'Hibo', l: 'Aden', g: 'FEMALE' },
    { f: 'Mustafa', l: 'Farah', g: 'MALE' },
    { f: 'Sadiyo', l: 'Jama', g: 'FEMALE' }
  ];

  for (const cl of classes) {
    console.log(`Seeding 10 students for ${cl.name}...`);
    for (let i = 0; i < 10; i++) {
        const p = names[i];
        const studentId = `TUSMO-${cl.grade}-${i+1}-${Math.floor(Math.random() * 900) + 100}`;
        const email = `std.${cl.grade}.${i+1}.${crypto.randomBytes(2).toString('hex')}@tusmo.com`;
        
        await prisma.user.create({
            data: {
                email,
                role: 'STUDENT',
                student: {
                    create: {
                        studentId,
                        firstName: p.f,
                        lastName: p.l,
                        gender: p.g,
                        status: 'ACTIVE',
                        classId: cl.id,
                        batchId: cl.batchId,
                        enrollmentDate: new Date()
                    }
                }
            }
        });
    }
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
