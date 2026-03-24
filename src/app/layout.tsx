// Added class to Next.js body element for nicer rendering
import type { Metadata, Viewport } from 'next'
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { LanguageProvider } from '@/components/language-provider'
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const ibmArabic = IBM_Plex_Sans_Arabic({ 
  weight: ['400', '500', '600', '700'], 
  subsets: ['arabic'], 
  variable: '--font-ibm-arabic' 
})

export const metadata: Metadata = {
  title: "Tusmo Primary & Secondary School | Excellence in Education",
  description: "A modern school management system for Tusmo School, providing a seamless educational experience for students, teachers, and parents.",
  keywords: ["school management", "education", "Tusmo School", "learning management system", "Somali schools"],
  authors: [{ name: "Tusmo SMS Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tusmo School",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmArabic.variable} font-sans min-h-screen flex flex-col bg-slate-950 text-slate-50 transition-colors duration-300`}>
        <LanguageProvider>
          <Navbar />
          {children}
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  )
}
