import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            status: true,
            classId: true,
            totalXp: true,
          }
        }
      }
    })

    // User not found in DB — still return success so admin/non-student users don't cause 404 loops
    if (!user) {
      return NextResponse.json({ success: true, student: null })
    }

    return NextResponse.json({ 
      success: true, 
      student: user.student 
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
