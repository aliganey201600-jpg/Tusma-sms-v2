"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-slate-50 dark:bg-slate-950">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-600/20 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">Tusmo School</p>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading academic data...</p>
      </div>
    </div>
  );
}
