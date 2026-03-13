"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Fetch overall finance statistics
 */
export async function fetchFinanceStats() {
  try {
    // Total Revenue (Sum of all completed payments)
    const revenueResult: any[] = await prisma.$queryRawUnsafe(`
      SELECT SUM("amountPaid") as total FROM "FeePayment" WHERE status = 'COMPLETED'
    `);
    
    // Total Expected (Sum of all fee structures multiplied by student count - simplified)
    // For a real production app, you'd calculate this based on assigned fees per student
    const expectedResult: any[] = await prisma.$queryRawUnsafe(`
      SELECT SUM(fs.amount) as total 
      FROM "FeeStructure" fs
      CROSS JOIN "Student" s
      WHERE s.status = 'ACTIVE'
    `);

    // Payments today
    const currentDay = new Date().toISOString().split('T')[0];
    const todayResult: any[] = await prisma.$queryRawUnsafe(`
      SELECT SUM("amountPaid") as total FROM "FeePayment" 
      WHERE status = 'COMPLETED' AND "paymentDate"::date = $1::date
    `, currentDay);

    return {
      totalRevenue: Number(revenueResult[0]?.total || 0),
      totalExpected: Number(expectedResult[0]?.total || 0),
      todayRevenue: Number(todayResult[0]?.total || 0),
      collectionRate: expectedResult[0]?.total > 0 ? (Number(revenueResult[0]?.total || 0) / Number(expectedResult[0]?.total)) * 100 : 0
    };
  } catch (error: any) {
    console.error("CRITICAL: Finance Stats Fetch Failed. This is likely a network/DB connection issue.");
    console.error("Reason:", error.message);
    return { totalRevenue: 0, totalExpected: 0, todayRevenue: 0, collectionRate: 0 };
  }
}

/**
 * Fetch all fee structures
 */
export async function fetchFeeStructures() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT * FROM "FeeStructure" ORDER BY "createdAt" DESC
    `);
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    return [];
  }
}

/**
 * Create a new fee structure
 */
export async function createFeeStructure(data: { name: string, amount: number, category: string, grade?: number, academicYear: string }) {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    await prisma.$executeRawUnsafe(`
      INSERT INTO "FeeStructure" (id, name, amount, category, grade, "academicYear", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, id, data.name, data.amount, data.category, data.grade || null, data.academicYear, now, now);
    
    revalidatePath("/dashboard/admin/finance");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating fee structure:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch payment history with student names
 */
export async function fetchPaymentHistory() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT 
        p.*, 
        s."firstName", 
        s."lastName", 
        s."studentId" as manual_id,
        fs.name as fee_name
      FROM "FeePayment" p
      JOIN "Student" s ON p."studentId" = s.id
      JOIN "FeeStructure" fs ON p."feeStructureId" = fs.id
      ORDER BY p."paymentDate" DESC
      LIMIT 100
    `);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return [];
  }
}

/**
 * Record a new payment
 */
export async function recordPayment(data: { 
  studentId: string, 
  feeStructureId: string, 
  amountPaid: number, 
  paymentMethod: string, 
  transactionId?: string,
  remarks?: string 
}) {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    await prisma.$executeRawUnsafe(`
      INSERT INTO "FeePayment" (id, "studentId", "feeStructureId", "amountPaid", "paymentMethod", "transactionId", status, remarks, "paymentDate", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', $7, $8, $9, $10)
    `, id, data.studentId, data.feeStructureId, data.amountPaid, data.paymentMethod, data.transactionId || null, data.remarks || null, now, now, now);
    
    revalidatePath("/dashboard/admin/finance");
    return { success: true };
  } catch (error: any) {
    console.error("Error recording payment:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch students for payment dropdown
 */
export async function fetchStudentsForFinance() {
  try {
    return await prisma.$queryRawUnsafe(`
      SELECT id, "firstName", "lastName", "studentId" as manual_id
      FROM "Student"
      WHERE status = 'ACTIVE'
      ORDER BY "firstName" ASC
    `);
  } catch (error) {
    console.error("Error fetching students for finance:", error);
    return [];
  }
}

