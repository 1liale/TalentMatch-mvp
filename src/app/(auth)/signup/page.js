"use client";

import { AuthForm } from "@/components/auth/login-form";
import { TypographyH1, TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <Button
        className="absolute left-2 top-4"
        variant="outline"
        size="sm"
        asChild
      >
        <Link href="/">
          <ChevronLeft className="mr-1" />
          Home
        </Link>
      </Button>
      <div className="w-full max-w-md relative">
        
        <div className="text-center mb-8">
          <TypographyH1 className="mb-2">Talent Match</TypographyH1>
          <TypographyP>AI-Powered Talent Matching Platform</TypographyP>
        </div>
        
        <AuthForm mode="signup" />
        
        <div className="mt-12 text-center text-foreground/80">
          <TypographyH2 className="mb-3">Streamlined Hiring with AI</TypographyH2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Card>
              <CardContent className="p-4">
                <TypographyH3 className="mb-1">For Hiring Managers</TypographyH3>
                <TypographyP>Post jobs and get AI-suggested candidate matches instantly</TypographyP>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <TypographyH3 className="mb-1">For Applicants</TypographyH3>
                <TypographyP>Find perfect job matches and get AI-powered application feedback</TypographyP>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 