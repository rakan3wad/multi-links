'use client'

import { LinkIcon } from 'lucide-react'
import { translations } from "@/app/i18n/translations"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'en' | 'ar'
    if (savedLang) {
      setLang(savedLang)
      updateLanguage(savedLang)
    }
  }, [])

  const updateLanguage = (newLang: 'en' | 'ar') => {
    localStorage.setItem('language', newLang)
    setLang(newLang)
    
    // Update HTML attributes
    const html = document.documentElement
    html.lang = newLang
    html.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    html.className = `${html.className} ${newLang === 'ar' ? 'font-arabic rtl' : 'font-inter ltr'}`
  }

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en'
    updateLanguage(newLang)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-6 w-6" />
            <span className="font-bold">{translations[lang].multiLinks}</span>
          </div>
          
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="px-2"
              onClick={toggleLanguage}
            >
              {lang === 'en' ? 'عربي' : 'English'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}