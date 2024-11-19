'use client';

import ParticlesBackground from "@/components/ParticlesBackground";
import TypewriterEffect from "@/components/TypewriterEffect";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthForms } from "@/components/auth-forms";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <ParticlesBackground />
      
      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr,400px] lg:gap-12 xl:grid-cols-[1fr,450px]">
            {/* Left side: Hero content */}
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Multi Links
                </h1>
                <div className="h-16 text-xl font-light text-muted-foreground sm:text-2xl">
                  <TypewriterEffect 
                    strings={[
                      "Share all your important links in one place",
                      "Create your personal profile",
                      "Customize your links",
                      "Share with the world"
                    ]} 
                  />
                </div>
              </div>
              <div className="mx-auto max-w-[700px] space-y-4 lg:mx-0">
                <p className="text-muted-foreground sm:text-xl">
                  Create your personalized profile and share all your important links with your audience.
                  Simple, fast, and beautiful.
                </p>
              </div>
            </div>

            {/* Right side: Auth form */}
            <div className="mx-auto w-full max-w-sm space-y-4">
              <AuthForms />
              <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}