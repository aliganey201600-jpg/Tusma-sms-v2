// Added class to Next.js body element for nicer rendering
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Tusmo Primary & Secondary School | Excellence in Education",
  description: "A modern school management system for Tusmo School, providing a seamless educational experience for students, teachers, and parents.",
  keywords: ["school management", "education", "Tusmo School", "learning management system", "Somali schools"],
  authors: [{ name: "Tusmo SMS Team" }],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950`}>
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
