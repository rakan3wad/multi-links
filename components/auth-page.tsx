'use client'

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { AuthForms } from "@/components/auth-forms"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <main className="container relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-800 to-gray-900" />
        <div className="flex flex-col items-center justify-center gap-8 pt-16">
          <Hero />
          <AuthForms />
        </div>
      </main>
    </div>
  )
}