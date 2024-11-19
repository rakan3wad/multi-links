'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { translations } from "@/app/i18n/translations"
import { FormErrors } from "./error/form-errors"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function AuthForms() {
  const [isLoading, setIsLoading] = useState(false)
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({})
  const supabase = createClientComponentClient()
  const router = useRouter()

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrors({ login: [error.message] })
      } else if (data.user) {
        router.push('/dashboard')
      }
    } catch (error: any) {
      setErrors({ login: [error.message] })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const firstName = formData.get('firstName') as string

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            firstName,
          },
        },
      })

      if (error) {
        setErrors({ signup: [error.message] })
      }
    } catch (error: any) {
      setErrors({ signup: [error.message] })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{translations[lang].signIn}</TabsTrigger>
          <TabsTrigger value="signup">{translations[lang].signUp}</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{translations[lang].email}</Label>
              <Input
                id="email"
                name="email"
                placeholder="m@example.com"
                required
                type="email"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{translations[lang].password}</Label>
              <Input
                id="password"
                name="password"
                required
                type="password"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-yellow-400"
              />
            </div>
            <FormErrors id="login" errors={errors} />
            <Button
              className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              disabled={isLoading}
            >
              {isLoading ? translations[lang].signingIn : translations[lang].signIn}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{translations[lang].username}</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
                type="text"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">{translations[lang].firstName}</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                required
                type="text"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-signup">{translations[lang].email}</Label>
              <Input
                id="email-signup"
                name="email"
                placeholder="m@example.com"
                required
                type="email"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">{translations[lang].password}</Label>
              <Input
                id="password-signup"
                name="password"
                required
                type="password"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-400 focus-visible:ring-yellow-400"
              />
            </div>
            <FormErrors id="signup" errors={errors} />
            <Button
              className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              disabled={isLoading}
            >
              {isLoading ? translations[lang].creatingAccount : translations[lang].createAccount}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}