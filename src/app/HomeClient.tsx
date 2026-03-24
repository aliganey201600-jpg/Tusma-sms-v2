"use client";
import React from "react";
import dynamic from 'next/dynamic';
import { useLanguage } from "@/components/language-provider";
import Hero from "@/components/home/Hero";

// Lazy Loaded Sections for better performance
const Leaderboard = dynamic(() => import('@/components/home/Leaderboard'), { 
  loading: () => <div className="h-96 w-full max-w-7xl mx-auto bg-slate-900/40 animate-pulse rounded-[40px] border border-slate-800" />,
  ssr: true 
});

const Levels = dynamic(() => import('@/components/home/Levels'), { 
  loading: () => <div className="h-64 w-full bg-slate-900/20 animate-pulse" />,
  ssr: true 
});

const Footer = dynamic(() => import('@/components/home/Footer'), { 
  ssr: true 
});

export default function HomeClient({ stats, topStudents, topClasses }: { stats: any, topStudents: any[], topClasses?: any[] }) {
  const { t } = useLanguage();
  const classes = topClasses || [];

  return (
    <div className="flex flex-col min-h-screen text-slate-50 pt-8 md:pt-16">
      <Hero t={t} />
      <Leaderboard t={t} topStudents={topStudents} topClasses={classes} />
      <Levels t={t} />
      <Footer t={t} />
    </div>
  );
}
