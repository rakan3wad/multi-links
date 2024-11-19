'use client'

import { translations } from "@/app/i18n/translations"
import { useEffect, useState } from "react"

export function Hero() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    // Set initial language
    const savedLang = localStorage.getItem('language') as 'en' | 'ar'
    if (savedLang) {
      setLang(savedLang)
    }

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent<{ language: 'en' | 'ar' }>) => {
      setLang(event.detail.language)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const renderWelcomeText = () => {
    if (lang === 'ar') {
      return (
        <>
          مرحباً بك في <span className="text-yellow-400">Multi Links</span>
        </>
      )
    }
    return (
      <>
        Welcome to <span className="text-yellow-400">Multi Links</span>
      </>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
        {renderWelcomeText()}
      </h1>
      <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        {translations[lang].welcomeDescription}
      </p>
    </div>
  )
}