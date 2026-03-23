import * as React from "react"
import type { Metadata } from 'next'
import { getHallOfFameData } from "./actions"
import HallOfFameClient from "./HallOfFameClient"
import { Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Tusma School | Hall of Fame',
  description: 'The ultimate leaderboard. See the top students and departments at Tusma School.',
}

export default async function HallOfFamePage() {
  const res = await getHallOfFameData()

  if (!res.success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center italic">
         <Trophy className="h-20 w-20 text-slate-800 mb-6" />
         <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase">Board Under Construction</h1>
         <p className="text-slate-500 font-medium">Rankings are being verified by the Academy. Stay tuned!</p>
      </div>
    )
  }

  return <HallOfFameClient initialData={res} />
}
