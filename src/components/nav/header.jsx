"use client"

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/base/logo";
import { Menu, X, BriefcaseIcon, CalendarClock, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

const AuthHeader = () => {
  const { user: authUser } = useAuth();
  const { profile } = useProfile();
  const pathname = usePathname();
  const activePage = pathname.split("/").pop();
  
  // Get the current page title based on the pathname
  const pageTitles = {
    dashboard: "Dashboard",
    applications: "My Applications",
    applicants: "Applicants",
    profile: "Profile"
  };

  if (!profile) {
    return null; // Don't render until profile is loaded
  }

  return (
    <div className="border-b border-border h-[70px] px-6 flex items-center justify-between sticky top-0 bg-background z-10">
      <TypographyH2 className="text-xl">{pageTitles[activePage]}</TypographyH2>
      
      <div className="flex items-center gap-4">    
        <div className="flex items-center gap-2">
          <Link href="/dashboard/profile">
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || authUser?.user_metadata?.full_name} />
              <AvatarFallback className="bg-primary/10">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="hidden md:block">
            <TypographyP className="text-sm font-medium">
              {profile?.username}
            </TypographyP>
            <TypographyP className="text-xs text-muted-foreground">
              {profile?.job_title}
            </TypographyP>
          </div>
        </div>
      </div>
    </div>
  );
};


const UnauthHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, supabase } = useAuth();
  
  const handleSignOut = async () => {
    // Sign out using the global Supabase client
    await supabase.auth.signOut();
    
    // Force a page refresh to ensure a clean state
    window.location.href = "/";
  };
  
  return (
    <header className="py-5 px-4 md:px-6 lg:px-8 border-b border-muted/60">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          <Button variant="link" className="text-foreground/70 hover:text-foreground hover:underline decoration-primary decoration-2 underline-offset-8 transition-all duration-200" asChild>
            <Link href="#how-it-works">How it Works</Link>
          </Button>
          <Button variant="link" className="text-foreground/70 hover:text-foreground hover:underline decoration-primary decoration-2 underline-offset-8 transition-all duration-200" asChild>
            <Link href="/companies">For Companies</Link>
          </Button>
          <Button variant="link" className="text-foreground/70 hover:text-foreground hover:underline decoration-primary decoration-2 underline-offset-8 transition-all duration-200" asChild>
            <Link href="/candidates">For Talents</Link>
          </Button>
        </nav>
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Button variant="link" className="text-foreground/70 hover:text-foreground" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                onClick={handleSignOut} 
                className="shadow-primary rounded-xl px-6"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="link" className="text-foreground/70 hover:text-foreground" asChild>
                <Link href="/signin">Log in</Link>
              </Button>
              <Button className="shadow-primary rounded-xl px-6" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Mobile menu button */}
        <Button 
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-6 px-4 border-t border-muted/60 animate-in fade-in slide-in-from-top-1 duration-200">
          <nav className="flex flex-col gap-5 mb-8">
            <Button 
              variant="link" 
              className="text-foreground/70 hover:text-foreground transition-colors py-1 justify-start"
              onClick={() => setMobileMenuOpen(false)}
              asChild
            >
              <Link href="#how-it-works">How it Works</Link>
            </Button>
            <Button 
              variant="link" 
              className="text-foreground/70 hover:text-foreground transition-colors py-1 justify-start"
              onClick={() => setMobileMenuOpen(false)}
              asChild
            >
              <Link href="/companies">For Companies</Link>
            </Button>
            <Button 
              variant="link" 
              className="text-foreground/70 hover:text-foreground transition-colors py-1 justify-start"
              onClick={() => setMobileMenuOpen(false)}
              asChild
            >
              <Link href="/candidates">For Talents</Link>
            </Button>
            <Button 
              variant="link" 
              className="text-foreground/70 hover:text-foreground transition-colors py-1 justify-start"
              onClick={() => setMobileMenuOpen(false)}
              asChild
            >
              <Link href="/blog">Resources</Link>
            </Button>
          </nav>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="link" 
                  className="text-foreground/70 hover:text-foreground w-full text-center py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button 
                  className="w-full shadow-primary rounded-xl"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="link" 
                  className="text-foreground/70 hover:text-foreground w-full text-center py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/signin">Log in</Link>
                </Button>
                <Button 
                  className="w-full shadow-primary rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export { UnauthHeader, AuthHeader }; 