'use client'

import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import AuthPage from '@/components/auth-page'

export default function Home() {
  return (
    <main className="flex-1">
      <div className="container flex flex-col items-center gap-8 pt-8 pb-8 md:pt-12 md:pb-12 lg:pt-16 lg:pb-16">
        <Hero />
        <Features />
        <AuthPage />
      </div>
    </main>
  )
}
