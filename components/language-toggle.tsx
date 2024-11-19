'use client';

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function LanguageToggle() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    // Set initial language from localStorage or browser preference
    const savedLang = localStorage.getItem('language') as 'en' | 'ar';
    if (savedLang) {
      setLang(savedLang);
      updateLanguage(savedLang);
    }
  }, []);

  const updateLanguage = (newLang: 'en' | 'ar') => {
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.body.className = newLang === 'ar' ? 'font-arabic rtl' : 'font-inter ltr';
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
    updateLanguage(newLang);
    
    // Dispatch a custom event for other components
    const event = new CustomEvent('languageChange', { 
      detail: { language: newLang } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={`fixed top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-50`}>
      <Button 
        onClick={toggleLanguage}
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
      >
        {lang === 'en' ? 'عربي' : 'En'}
      </Button>
    </div>
  );
}
