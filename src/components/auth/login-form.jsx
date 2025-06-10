'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { login, signup, signInWithOAuth } from "@/utils/supabase/auth-actions";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define validation schema with zod
const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const AuthForm = ({ mode = "signin" }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // Will be { text: string, type: "error"|"success" } or null
  const [isLogin, setIsLogin] = useState(mode === "signin");
  const router = useRouter();

  // Set up form with react-hook-form and zod validation
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Update isLogin state when mode prop changes
  useEffect(() => {
    setIsLogin(mode === "signin");
    reset();
  }, [mode, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);
    
    // Create FormData object
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    
    try {
      if (isLogin) {
        // Sign in using server action
        const result = await login(formData);
        if (result?.error) {
          setMessage({
            text: result.error.message || "Invalid email or password",
            type: "error"
          });
        }
      } else {
        // Sign up using server action
        const result = await signup(formData);
        if (result?.error) {
          setMessage({
            text: result.error.message || "Failed to create account",
            type: "error"
          });
        } else if (result?.message) {
          setMessage({
            text: result.message,
            type: "success"
          });
        }
      }
    } catch (error) {
      setMessage({
        text: error.message || "An unexpected error occurred",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Call signInWithOAuth directly with the provider string
      const { url } = await signInWithOAuth(provider);
      if (url) {
        // Redirect to the OAuth provider's login page
        window.location.href = url;
      }
    } catch (error) {
      console.error("OAuth error:", error);
      setMessage({
        text: error.message || "An unexpected error occurred",
        type: "error"
      });
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = isLogin ? "signup" : "signin";
    router.push(`/${newMode}`);
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* OAuth Providers */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2"
            >
              <Image 
                src="/google.svg" 
                alt="Google logo" 
                width={16} 
                height={16} 
              />
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="flex items-center justify-center gap-2"
            >
              <Image 
                src="/github.svg" 
                alt="GitHub logo" 
                width={16} 
                height={16} 
              />
              GitHub
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-muted" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-4 py-1 text-foreground/70 font-serif rounded-full border-2 border-muted">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            {message && (
              <p 
                className={`text-sm mt-1 ${message.type === "success" ? "text-green-500" : "text-red-500"}`}
              >
                {message.text}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={toggleMode}
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

// Export with old name for backward compatibility
export const LoginForm = AuthForm; 