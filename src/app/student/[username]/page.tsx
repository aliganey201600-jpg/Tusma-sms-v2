import * as React from "react"
import type { Metadata, ResolvingMetadata } from 'next'
import { getPublicProfile } from "./actions"
import ProfileClient from "./ProfileClient"
import { Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { username: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// ─── Metadata Generation (The SEO Loop) ───
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = params.username
  // @ts-ignore
  const res = await getPublicProfile(username)
  
  if (!res.success || !res.profile) {
    return {
      title: 'Tusma School | Profile Not Found',
    }
  }

  const profile = res.profile
  const rank = profile.globalRank || 1
  const xp = profile.totalXp || 0
  
  // Absolute URL is critical for social platforms (WhatsApp, Facebook)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const ogImage = `${baseUrl}/api/og/student?username=${username}`

  return {
    title: `${profile.firstName} (@${username}) | Tusma School Rank #${rank}`,
    description: `I'm currently Rank #${rank} at Tusma School with ${xp} XP! 🔥 Check my live student profile for achievements and mastery.`,
    openGraph: {
      title: `${profile.firstName}'s Tusma Profile - Rank #${rank}`,
      description: `Student Level ${profile.level || 1} • ${xp} Total XP • ${profile.currentStreak || 0} Day Streak`,
      url: `${baseUrl}/student/${username}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${profile.firstName}'s Rank Card`,
        },
      ],
      type: 'profile',
      username: username,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.firstName} is Rank #${rank} at Tusma!`,
      description: `Mastering subjects and leading the leaderboard with ${xp} XP.`,
      images: [ogImage],
    },
  }
}

export default async function StudentPublicProfilePage({ params }: Props) {
  const { username } = params
  // @ts-ignore
  const res = await getPublicProfile(username)

  if (!res.success || !res.profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center italic">
         <Trophy className="h-20 w-20 text-slate-800 mb-6" />
         <h1 className="text-3xl font-black mb-2 tracking-tighter">Student Not Found</h1>
         <p className="text-slate-500 font-medium">This profile is as elusive as a perfect score on an Algebra quiz.</p>
      </div>
    )
  }

  return <ProfileClient profile={res.profile} />
}
