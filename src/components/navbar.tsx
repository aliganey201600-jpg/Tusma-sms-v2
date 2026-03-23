"use client";
import * as React from "react"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Globe } from "lucide-react";
import { useLanguage } from "./language-provider";

const HIDDEN_PATHS = ["/dashboard", "/sign-in", "/sign-up"]

export function Navbar() {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isHidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p))
  if (isHidden) return null

  const navLinks = [
    { name: t.home, href: "/" },
    { name: t.courses, href: "/courses" },
    { name: t.events, href: "/events" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full shadow-md bg-blue-500 text-white">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 me-6 font-bold text-xl tracking-tight text-white hover:text-blue-50 transition-colors">
          <span className="hidden sm:inline-block">Tusma School</span>
          <span className="sm:hidden">Tusma</span>
        </Link>
        <div className="hidden md:flex gap-8 justify-center flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-white ${pathname === link.href ? "text-white font-bold" : "text-blue-100"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3 ms-auto">
          <Button variant="ghost" asChild className="text-white hover:bg-blue-600 hover:text-white transition-colors">
            <Link href="/sign-in">{t.signIn}</Link>
          </Button>
          <Button asChild className="bg-white text-blue-600 hover:bg-blue-50 transition-colors font-bold shadow-sm">
            <Link href="/sign-up">{t.signUp}</Link>
          </Button>

          {/* Language Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600 hover:text-white ms-1 rounded-full">
                <Globe className="h-5 w-5" />
                <span className="sr-only">{t.language} Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-none bg-white dark:bg-slate-900 mt-2 p-1">
              <DropdownMenuItem onClick={() => setLanguage('so')} className={`cursor-pointer font-medium hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 ${language === 'so' ? 'bg-blue-50 dark:bg-slate-800' : ''}`}>
                🇸🇴 Af-Soomaali
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')} className={`cursor-pointer font-medium hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 ${language === 'en' ? 'bg-blue-50 dark:bg-slate-800' : ''}`}>
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ar')} className={`cursor-pointer font-medium hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 ${language === 'ar' ? 'bg-blue-50 dark:bg-slate-800' : ''}`}>
                🇸🇦 العربية (Arabic)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        {mounted && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="me-0 px-0 text-white hover:bg-blue-600 hover:text-white focus-visible:ring-0 md:hidden ms-auto"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-6 sm:max-w-xs border-e shadow-2xl bg-white dark:bg-slate-950">
              <Link href="/" className="flex items-center font-extrabold text-2xl mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white mt-4">
                Tusma School
              </Link>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 text-start">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium transition-colors hover:text-blue-600 ${pathname === link.href ? "text-blue-600 font-bold" : "text-slate-600 dark:text-slate-300"
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile Language & Auth Buttons */}
                <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-start mb-2 gap-2">
                    <span className="text-sm font-semibold text-slate-500 mb-2">{t.language}:</span>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setLanguage('so')} variant={language === 'so' ? 'default' : 'outline'} size="sm" className={language === 'so' ? 'bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-lg' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 h-8 px-3 rounded-lg'}>🇸🇴 SO</Button>
                      <Button onClick={() => setLanguage('en')} variant={language === 'en' ? 'default' : 'outline'} size="sm" className={language === 'en' ? 'bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-lg' : 'h-8 px-3 text-slate-500 hover:bg-slate-100 border-slate-200 rounded-lg'}>🇬🇧 EN</Button>
                      <Button onClick={() => setLanguage('ar')} variant={language === 'ar' ? 'default' : 'outline'} size="sm" className={language === 'ar' ? 'bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-lg' : 'h-8 px-3 text-slate-500 hover:bg-slate-100 border-slate-200 rounded-lg'}>🇸🇦 AR</Button>
                    </div>
                  </div>

                  <Button variant="outline" asChild className="w-full justify-center border-slate-200 dark:border-slate-800 h-12 font-bold rounded-xl text-slate-600">
                    <Link href="/sign-in">{t.signIn}</Link>
                  </Button>
                  <Button asChild className="w-full justify-center bg-blue-600 text-white hover:bg-blue-700 h-12 shadow-md font-bold rounded-xl">
                    <Link href="/sign-up">{t.signUp}</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
}
