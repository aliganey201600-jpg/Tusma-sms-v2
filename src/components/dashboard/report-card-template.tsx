"use client"

import * as React from "react"
import { GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ReportCardProps {
  data: any[]
  user: {
    fullName?: string
    studentId?: string | null
    id?: string
  }
  className?: string
}

export function ReportCardTemplate({ data, user, className }: ReportCardProps) {
  const today = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })

  const overallGPA = data.length > 0
    ? (data.reduce((acc: number, g: any) => acc + (g.gpa || 0), 0) / data.length).toFixed(2)
    : "0.00"

  const overallAvg = data.length > 0
    ? Math.round(data.reduce((acc: number, g: any) => acc + (g.grade || 0), 0) / data.length)
    : 0

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          .report-card-page {
            page-break-after: always;
            break-after: page;
          }
          .report-card-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}} />

      <div className={cn("report-card-page bg-white", className)}>
        <div className="max-w-[900px] mx-auto border-[10px] border-double border-slate-900 p-10 bg-white relative min-h-[1100px] flex flex-col">

          {/* Header */}
          <div className="text-center space-y-3 mb-8 pb-6 border-b-2 border-slate-200">
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <GraduationCap className="h-9 w-9" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Tusmo Academy of Science</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Official Student Academic Transcript</p>
            <div className="flex items-center justify-center gap-4 pt-1">
              <Badge variant="outline" className="px-3 py-1 border-slate-900 font-black text-[10px] uppercase tracking-widest">{today}</Badge>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <Badge variant="outline" className="px-3 py-1 border-slate-900 font-black text-[10px] uppercase tracking-widest">Academic Year 2025/2026</Badge>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl mb-8 border border-slate-100">
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Student Name</p>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tight">{user.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registration ID</p>
                <p className="text-base font-black text-slate-700 tracking-widest">{user.studentId || "—"}</p>
              </div>
            </div>
            <div className="space-y-3 text-right">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Enrollment Status</p>
                <p className="text-base font-black text-indigo-600 uppercase tracking-widest">Active / In Good Standing</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Issued On</p>
                <p className="text-xs font-bold text-slate-500">{today}</p>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="mb-8 flex-1">
            <table className="w-full text-left border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 uppercase text-[10px] font-black tracking-widest border border-slate-700">Subject / Module</th>
                  <th className="p-3 uppercase text-[10px] font-black tracking-widest border border-slate-700 text-center">Instructor</th>
                  <th className="p-3 uppercase text-[10px] font-black tracking-widest border border-slate-700 text-center w-[100px]">Score (%)</th>
                  <th className="p-3 uppercase text-[10px] font-black tracking-widest border border-slate-700 text-center w-[100px]">GPA</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-bold text-sm italic border border-slate-200">
                      No academic records available for this period.
                    </td>
                  </tr>
                ) : (
                  data.map((item: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="p-3 font-black text-slate-900 uppercase text-xs border border-slate-200">{item.subject || item.name || "—"}</td>
                      <td className="p-3 font-bold text-slate-500 text-[10px] text-center border border-slate-200">{item.teacher || "—"}</td>
                      <td className="p-3 text-center border border-slate-200 font-black text-base">
                        <span className={
                          (item.grade || 0) >= 70 ? "text-emerald-600"
                          : (item.grade || 0) >= 50 ? "text-amber-600"
                          : "text-rose-600"
                        }>
                          {item.grade || 0}%
                        </span>
                      </td>
                      <td className="p-3 text-center border border-slate-200 font-black bg-slate-50 text-indigo-950">
                        {(item.gpa || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div>
            <div className="grid grid-cols-3 gap-6 p-8 bg-slate-900 text-white rounded-2xl mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-full w-32 bg-white/5 skew-x-12 translate-x-8 pointer-events-none" />
              <div className="text-center relative">
                <p className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Overall Average</p>
                <p className="text-4xl font-black tracking-tighter">{overallAvg}%</p>
              </div>
              <div className="text-center relative">
                <p className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Cumulative GPA</p>
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-4xl font-black tracking-tighter text-amber-400">{overallGPA}</p>
                  <span className="text-xs font-black text-white/40">/ 4.0</span>
                </div>
              </div>
              <div className="text-center relative">
                <p className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] mb-1">Academic Standing</p>
                <p className="text-4xl font-black tracking-tighter italic">
                  {Number(overallGPA) >= 3.0 ? "HONORS" : Number(overallGPA) >= 2.0 ? "PASS" : "AT RISK"}
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="grid grid-cols-2 gap-16 px-8 pt-8">
              <div>
                <div className="h-px bg-slate-800 w-full mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">Registrar Signature & Seal</p>
              </div>
              <div>
                <div className="h-px bg-slate-800 w-full mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 text-center">Principal / Head of School</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-1">
              <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">
                This document is a certified digital transcript issued by Tusmo SMS. Any alteration or unauthorized reproduction is strictly prohibited.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
