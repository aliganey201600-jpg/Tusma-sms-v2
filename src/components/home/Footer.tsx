"use client";
import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer({ t }: { t: any }) {
  return (
    <footer className="bg-slate-950/80 backdrop-blur-3xl text-slate-400 py-16 md:py-20 border-t border-slate-800 w-full mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-start">
          
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-fuchsia-500" /> Tusmo
            </h3>
            <p className="leading-relaxed text-sm font-medium">
              {t.footerAbout}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white uppercase tracking-widest text-[10px]">{t.quickLinks}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">{t.home}</Link></li>
              <li><Link href="/hall-of-fame" className="hover:text-blue-400 transition-colors font-bold text-indigo-400 underline decoration-indigo-400/30 underline-offset-4">Hall of Fame</Link></li>
              <li><Link href="/courses" className="hover:text-blue-400 transition-colors">{t.courses}</Link></li>
              <li><Link href="/events" className="hover:text-blue-400 transition-colors">{t.events}</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">{t.contactUs}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>{t.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span dir="ltr">+252 61 5328006</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>info@tusmaschool.edu.so</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white">{t.socialMedia}</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 gap-4 font-medium">
          <p>© {new Date().getFullYear()} Tusma. {t.rightsReserved}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">{t.privacyPolicy}</Link>
            <Link href="#" className="hover:text-white transition-colors">{t.termsOfService}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
