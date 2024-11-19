'use client'

import { useEffect, useState } from "react"
import { translations } from "@/app/i18n/translations"
import { 
  Link2Icon, 
  ShareIcon, 
  PaintbrushIcon, 
  BarChart3Icon 
} from 'lucide-react'

const FeatureIcon = ({ name }: { name: string }) => {
  const icons = {
    organize: Link2Icon,
    share: ShareIcon,
    customize: PaintbrushIcon,
    analytics: BarChart3Icon,
  }
  
  const IconComponent = icons[name as keyof typeof icons]
  return <IconComponent className="h-8 w-8 text-yellow-400" />
}

export function Features() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'en' | 'ar'
    if (savedLang) {
      setLang(savedLang)
    }

    const handleLanguageChange = (event: CustomEvent<{ language: 'en' | 'ar' }>) => {
      setLang(event.detail.language)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const features = ['organize', 'share', 'customize', 'analytics']

  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        {translations[lang].features.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {features.map((feature) => (
          <div 
            key={feature}
            className="flex flex-col items-center text-center p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-yellow-400/50 transition-colors"
          >
            <div className="mb-4">
              <FeatureIcon name={feature} />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {translations[lang].features[feature].title}
            </h3>
            <p className="text-gray-400">
              {translations[lang].features[feature].description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
