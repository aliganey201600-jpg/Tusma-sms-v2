"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crosshair, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Levels({ t }: { t: any }) {
  return (
    <section id="levels" className="py-24 md:py-32">
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-4"
        >
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-white">
            {t.educationLevels}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium">
            {t.educationLevelsDesc}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
          {[ 
            { title: t.level1, desc: t.level1Desc, body: t.level1Body, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
            { title: t.level2, desc: t.level2Desc, body: t.level2Body, color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/20" },
            { title: t.level3, desc: t.level3Desc, body: t.level3Body, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" }
          ].map((level, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-xl hover:${level.shadow} rounded-3xl`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <CardHeader className="pb-4 relative z-10 border-b border-slate-800/50">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${level.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                    <Crosshair className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white">{level.title}</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{level.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <p className="text-slate-400 mb-6 font-medium leading-relaxed">
                    {level.body}
                  </p>
                  <Button variant="ghost" className={`p-0 h-auto font-bold text-transparent bg-clip-text bg-gradient-to-r ${level.color} group-hover:opacity-80 transition-opacity`}>
                    Details <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
