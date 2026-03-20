"use client"

import * as React from "react"
import { Suspense } from "react"
import { GradingInterfaceContent } from "@/components/dashboard/grading-interface"

export default function StudentGradingPage() {
  return (
    <Suspense fallback={
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
       </div>
    }>
       <GradingInterfaceContent userRole="STUDENT" />
    </Suspense>
  )
}
