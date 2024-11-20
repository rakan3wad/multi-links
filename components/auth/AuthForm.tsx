'use client';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface AuthFormProps {
  isSignUpDefault?: boolean;
}

export default function AuthForm({ isSignUpDefault = false }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Basic validation
        if (!email || !password || !username) {
          setError("All fields are required");
          return;
        }

        if (username.length < 3 || username.length > 30) {
          setError("Username must be between 3 and 30 characters");
          return;
        }

        // Validate username using regex without pattern attribute
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          setError("Username can only contain letters, numbers, underscores, and hyphens");
          return;
        }

        // Sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          },
        });

        if (signUpError && !signUpError.message.includes('profiles_pkey')) {
          throw signUpError;
        }

        if (!signUpData.user) {
          throw new Error("Signup failed - no user data returned");
        }

        // Redirect to dashboard immediately after successful signup
        router.push("/dashboard");
        router.refresh();
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data && data.user) {
          // Redirect to dashboard on successful sign in
          router.push("/dashboard");
          router.refresh(); // Force a refresh to update auth state
        } else {
          throw new Error("Sign in failed - no user data returned");
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      if (err.message.includes('Invalid login credentials')) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes('already registered')) {
        setError("This email is already registered. Please try signing in instead.");
      } else if (err.message.includes('valid email')) {
        setError("Please enter a valid email address.");
      } else if (err.message.includes('cannot be used as it is not authorized')) {
        setError("Email signup is currently restricted. Please contact the administrator or use a different email.");
      } else if (err.message.includes('password')) {
        setError("Password must be at least 6 characters long.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Enter your details to create a new account"
            : "Enter your credentials to sign in"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  // Only allow valid characters
                  const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                  setUsername(value);
                }}
                required
                disabled={loading}
                minLength={3}
                maxLength={30}
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? isSignUp
                ? "Creating Account..."
                : "Signing In..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}