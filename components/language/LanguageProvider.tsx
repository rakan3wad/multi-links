'use client';

import { useEffect, useState } from 'react';

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    setIsRTL(savedLang === 'ar');

    const handleLanguageChange = (event: CustomEvent<{ language: 'en' | 'ar' }>) => {
      setIsRTL(event.detail.language === 'ar');
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic rtl' : 'font-inter ltr'}>
      {children}
    </div>
  );
}
