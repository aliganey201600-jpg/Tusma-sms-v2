const fs = require('fs');
const path = 'src/app/dashboard/admin/attendance/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// Update saveAttendance to notify for both ABSENT and LATE
const oldNotificationBlock = `    // Post-processing: Trigger Notifications for ABSENT students
    const absentRecords = records.filter(r => r.status === "ABSENT");
    
    if (absentRecords.length > 0) {
      // Fetch details for these students (names and phones)
      const studentIds = absentRecords.map(r => r.studentId);
      const studentDetails: any[] = await prisma.$queryRawUnsafe(\`
        SELECT 
          s.id, 
          s."firstName", 
          s."lastName", 
          s.phone as student_phone, 
          s."guardianPhone", 
          c.name as class_name
        FROM "Student" s
        JOIN "Class" c ON s."classId" = c.id
        WHERE s.id = ANY($1)
      \`, studentIds);

      const readableDate = format(dateObj, "dd/MM/yyyy");

      // Trigger background notifications (Don't await to avoid blocking UI)
      studentDetails.forEach(student => {
        const studentName = \`\${student.firstName} \${student.lastName}\`;
        const message = \`Salaam, Nidaamka Tusmo School: Ardayga \${studentName} wuxuu ka maqnaa fasalka (\${student.class_name}) maanta oo ay taariikhdu tahay \${readableDate}. Fadlan nala soo xidhiidh haddii ay jirto dhibaato. Mahadsanid.\`;

        // Send to Guardian if exists
        if (student.guardianPhone) {
          sendWhatsAppNotification({ phone: student.guardianPhone, message });
        }
        
        // Send to Student if exists
        if (student.student_phone) {
          sendWhatsAppNotification({ phone: student.student_phone, message });
        }
      });
    }`;

const newNotificationBlock = `    // Post-processing: Trigger Notifications for ABSENT and LATE students
    const notifyRecords = records.filter(r => r.status === "ABSENT" || r.status === "LATE");
    
    if (notifyRecords.length > 0) {
      const studentIds = notifyRecords.map(r => r.studentId);
      const studentDetails: any[] = await prisma.$queryRawUnsafe(\`
        SELECT s.id, s."firstName", s."lastName", s.phone as student_phone, s."guardianPhone", c.name as class_name
        FROM "Student" s JOIN "Class" c ON s."classId" = c.id WHERE s.id = ANY($1)
      \`, studentIds);

      const readableDate = format(dateObj, "dd/MM/yyyy");

      studentDetails.forEach(student => {
        const record = records.find(r => r.studentId === student.id);
        const statusText = record.status === "ABSENT" ? "ka maqnaa" : "ku habsaamay (Late)";
        const studentName = \`\${student.firstName} \${student.lastName}\`;
        const message = \`Salaam, Nidaamka Tusmo School: Ardayga \${studentName} wuxuu \${statusText} fasalka (\${student.class_name}) maanta oo ay taariikhdu tahay \${readableDate}. Fadlan nala soo xidhiidh. Mahadsanid.\`;

        if (student.guardianPhone) sendWhatsAppNotification({ phone: student.guardianPhone, message });
        if (student.student_phone) sendWhatsAppNotification({ phone: student.student_phone, message });
      });
    }`;

content = content.replace(oldNotificationBlock, newNotificationBlock);

fs.writeFileSync(path, content);
console.log('Automated Attendance and Late notifications updated!');
