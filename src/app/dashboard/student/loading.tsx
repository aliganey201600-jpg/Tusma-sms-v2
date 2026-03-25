import { Skeleton } from "@/components/ui/skeleton"

export default function StudentDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 pt-4 md:py-8 px-4 md:px-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* ── Header Skeleton ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 w-full md:w-2/3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-12 md:h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-4 w-full md:w-1/2 rounded-lg" />
          </div>
          <div className="w-full md:w-auto flex gap-3">
             <Skeleton className="h-11 w-full md:w-32 rounded-xl" />
             <Skeleton className="h-11 w-full md:w-32 rounded-xl" />
             <Skeleton className="h-11 w-full md:w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* ── Stats Skeleton ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Courses Column ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg hidden md:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-40 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar Column ── */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
               <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-24" />
               </div>
               <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <div className="space-y-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex gap-4">
                   <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                   <div className="space-y-2 flex-1">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-3 w-1/2" />
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
               <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <Skeleton className="h-3 w-24 bg-slate-800" />
               </div>
               <Skeleton className="h-10 w-10 rounded-xl bg-slate-800" />
            </div>
            <div className="space-y-6">
               {[1, 2].map((i) => (
                 <div key={i} className="flex gap-4">
                   <div className="space-y-2 flex-1">
                     <Skeleton className="h-4 w-3/4 bg-slate-800" />
                     <Skeleton className="h-3 w-1/2 bg-slate-800" />
                   </div>
                   <Skeleton className="h-8 w-10 rounded-lg bg-slate-800" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
