"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionaries } from "@/i18n/dictionaries";

type Language = "en" | "so" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "so",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("so");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("app-language") as Language;
    if (savedLang) {
      setLanguageState(savedLang);
      updateDir(savedLang);
    } else {
      updateDir("so");
    }
  }, []);

  const updateDir = (lang: Language) => {
    if (lang === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = lang;
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    updateDir(lang);
  };

  // Prevents hydration mismatch bugs
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return {
    ...context,
    t: dictionaries[context.language]
  };
};
