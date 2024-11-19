'use client';

import { translations } from "@/app/i18n/translations";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    // Set initial language from localStorage
    const savedLang = localStorage.getItem('language') as 'en' | 'ar';
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Update language when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('language') as 'en' | 'ar';
      if (newLang) {
        setLang(newLang);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex gap-6 md:gap-10">
          <a className="flex items-center space-x-2" href="/">
            <span className="font-bold">{translations[lang].multiLinks}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
