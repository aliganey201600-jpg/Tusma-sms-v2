-- RLS Policies for Tusmo SMS

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Teacher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Parent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Grade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- 1. Users can only see their own profile
CREATE POLICY "Users can view their own data" ON "User"
FOR SELECT USING (auth.uid()::text = id);

-- 2. Students can see their own data
CREATE POLICY "Students can view their own data" ON "Student"
FOR SELECT USING (auth.uid()::text = userId);

-- 3. Teachers can see their own data
CREATE POLICY "Teachers can view their own data" ON "Teacher"
FOR SELECT USING (auth.uid()::text = userId);

-- 4. Grades: Students can only see their own grades
CREATE POLICY "Students can view their own grades" ON "Grade"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "Student" s
    WHERE s.id = "Grade"."studentId" AND s.userId = auth.uid()::text
  )
);

-- 5. Grades: Teachers can see and manage grades for their classes
CREATE POLICY "Teachers can manage grades" ON "Grade"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM "Teacher" t
    WHERE t.userId = auth.uid()::text
    -- Add more logic to check if teacher is assigned to this assignment's course
  )
);

-- 6. Audit Logs: Only Super Admin and Admin can view
CREATE POLICY "Admins can view audit logs" ON "AuditLog"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text AND u.role IN ('SUPER_ADMIN', 'ADMIN')
  )
);

-- Note: These are base templates. Run these in the Supabase SQL Editor.
