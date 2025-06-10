"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UnauthHeader } from "@/components/nav/header";
import Footer from "@/components/nav/footer";
import { PrimaryBadge, SecondaryBadge } from "@/components/base/badge";
import { PrimaryCardLarge } from "@/components/base/card";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyP,
  TypographyLead,
  TypographySmall
} from "@/components/ui/typography";
import {
  ChartNetwork,
  BrainCircuit,
  Blocks
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

// Typography custom components
const HeroTitle = ({ children, className }) => (
  <TypographyH1 className={cn("text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight", className)}>
    {children}
  </TypographyH1>
);

// Hero Section Component
const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-20 md:py-28 lg:py-32 relative">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="space-y-7 relative z-10">
          <PrimaryBadge>
            AI-powered Talent Matching
          </PrimaryBadge>
          <HeroTitle>
            Connect with <span className="text-primary">skilled talent</span> globally
          </HeroTitle>
          <TypographyLead className="max-w-md leading-relaxed text-lg md:text-xl text-foreground/80">
            Join thousands of professionals worldwide using TalentMatch to discover ideal career opportunities with a streamlined application process.
          </TypographyLead>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto shadow-primary rounded-xl px-6 h-12" asChild>
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>Explore Positions</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 rounded-xl px-6 h-12" asChild>
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>Find Talent →</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-[400px] md:h-[550px] rounded-2xl overflow-hidden z-10">
          <Image 
            src="/hero-cover.png" 
            alt="Hero cover image"
            fill
            className="object-cover rounded-2xl z-10"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-card/80 backdrop-blur-sm rounded-xl border shadow-lg p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">TM</div>
                <div>
                  <div className="text-sm font-medium">TalentMatch</div>
                  <TypographySmall className="text-foreground/60">Smart matching engine</TypographySmall>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-background/80 rounded-md flex items-center px-4 text-sm text-foreground/80">
                  Profile Status: Match Ready
                </div>
                <div className="h-12 bg-background/80 rounded-md flex items-center px-4 text-sm text-foreground/80">
                  3 organizations interested
                </div>
                <div className="h-12 bg-primary/20 rounded-md flex items-center px-4 text-sm text-primary font-medium">
                  Interview Request: Lead Developer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative my-8 mb-16">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-muted" />
          </div>
          <div className="relative flex justify-center text-center">
            <span className="bg-background px-6 py-2 text-2xl font-medium">How It Works</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <SecondaryBadge className="mb-4">
            Intuitive Process
          </SecondaryBadge>
          <TypographyH2 className="text-3xl md:text-4xl mb-6">Simple Three-Step Journey</TypographyH2>
          <TypographyLead className="max-w-lg mx-auto">
            Engineered with intelligent tools and data insights to enhance professional connections and career growth opportunities.
          </TypographyLead>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          <PrimaryCardLarge 
            icon={<ChartNetwork  size={28} className="text-primary" />}
            title="Smart Analytics"
            description="Our platform provides data-driven insights to help make confident decisions and reduce unconscious bias in talent acquisition."
          />
          
          <PrimaryCardLarge 
            icon={<BrainCircuit size={28} className="text-primary" />}
            title="Intelligent Matching"
            description="Our technology evaluates candidate profiles by analyzing resume data to identify key competencies, experience, and qualifications."
          />
          
          <PrimaryCardLarge 
            icon={<Blocks size={28} className="text-primary" />}
            title="Effortless Integration"
            description="Our platform offers a user-friendly interface that smoothly connects with your existing tools, enabling effective team collaboration."
          />
        </div>
      </div>
    </section>
  );
};

// Stats Section Component (Mock data)
const StatsSection = () => {
  const stats = [
    { value: "90%", label: "Match success rate" },
    { value: "4500+", label: "Professionals placed" },
    { value: "950+", label: "Partner organizations" },
    { value: "16", label: "Days average process" }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <TypographyH3 className="text-4xl text-primary mb-2">{stat.value}</TypographyH3>
              <TypographyP>{stat.label}</TypographyP>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="max-w-4xl mx-auto rounded-2xl p-8 md:p-12 shadow-xs relative overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-x-1/4 -translate-y-1/4 z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-x-1/4 translate-y-1/4 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <PrimaryBadge className="mb-4">
                Begin Your Journey
              </PrimaryBadge>
              <TypographyH2 className="text-3xl md:text-4xl mb-6">Ready to elevate your career path?</TypographyH2>
              <TypographyLead className="mb-4">
                Create your profile today to discover opportunities or find exceptional talent for your organization with our intelligent platform.
              </TypographyLead>
              <TypographyLead className="text-lg md:text-xl font-medium mb-6 text-primary">
                Join our expanding network of professionals!
              </TypographyLead>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="w-full sm:w-auto shadow-primary rounded-xl px-6 h-12" asChild>
                  <Link href={isAuthenticated ? "/dashboard" : "/signup"}>Explore Positions</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 rounded-xl px-6 h-12" asChild>
                  <Link href={isAuthenticated ? "/dashboard" : "/signup"}>Find Talent →</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[250px] md:h-[300px] rounded-xl overflow-hidden border-2 border-muted/60">
              <Image 
                src="/connections.png" 
                alt="Professional connections"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

// Main Page Component
export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <UnauthHeader />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
} 