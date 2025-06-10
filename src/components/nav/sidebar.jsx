"use client";

import {
  Home,
  LogOut,
  HelpCircle,
  Users,
  FileText,
  Search,
  Settings,
  Building,
  User,
  File,
  ChevronDown,
  List,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/base/logo";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";

// Menu item configuration
const candidateMenuItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Profile", icon: User, url: "/dashboard/profile" },
  { section: "Applications" },
  { title: "Resumes", icon: FileText, url: "/dashboard/resumes" },
  { title: "Job Search", icon: Search, url: "/dashboard/job-search" },
  { title: "My Applications", icon: File, url: "/dashboard/applications" },
];

const recruiterLinks = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Company Profile", icon: Building, url: "/dashboard/profile" },
  { section: "Recruitment" },
  { title: "Talent Discovery", icon: Search, url: "/dashboard/talent-discovery" },
  { 
    title: "Jobs", 
    icon: FileText,
    subItems: [
      { title: "Add New Job", icon: PlusCircle, url: "/dashboard/jobs/create" },
      { title: "Job Posts", icon: List, url: "/dashboard/jobs" },
    ]
  },
  { title: "Applicants", icon: Users, url: "/dashboard/applicants" },
];

// Footer menu items
const footerItems = [
  { title: "FAQs", icon: HelpCircle, url: "/help" },
];

// Function to check if a menu item is active
const isMenuItemActive = (pathname, itemUrl) => {
  // Exact match is always active.
  if (pathname === itemUrl) return true;

  // Special handling for parent routes like /jobs to not be active for /jobs/create
  if (itemUrl === '/dashboard/jobs') {
    return pathname.startsWith(itemUrl) && !pathname.startsWith('/dashboard/jobs/create');
  }

  // For child routes (only if not the root dashboard)
  if (itemUrl !== "/dashboard" && pathname?.startsWith(itemUrl + "/")) return true;
  
  return false;
};

const Sidebar = () => {
  const { supabase } = useAuth();
  const { profile } = useProfile();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    // Only run in client-side
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarOpen');
      return stored !== null ? stored === 'true' : true;
    }
    return true; // Default for server-side rendering
  });
  const [openDropdowns, setOpenDropdowns] = useState({});


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !profile) return;
    // Find the active dropdown and open it on initial load/navigation
    const activeDropdown = recruiterLinks.find(item => 
        item.subItems?.some(sub => isMenuItemActive(pathname, sub.url))
    );
    if (activeDropdown) {
        setOpenDropdowns(prev => ({ ...prev, [activeDropdown.title]: true }));
    }
  }, [pathname, mounted, profile, recruiterLinks]);


  if (!mounted || !profile) {
    return null; // Return null on server-side and initial render or if profile isn't loaded
  }

  // Determine user type from profile
  const userType = profile.user_type;
  const menuItems = userType === "recruiter" ? recruiterLinks : candidateMenuItems;

  const handleSetIsOpen = (value) => {
    setIsOpen(value);
    localStorage.setItem('sidebarOpen', String(value));
  };

  const handleSidebarClick = (e) => {
    if (
      e.target instanceof Element &&
      !e.target.closest("button") &&
      !e.target.closest("a") &&
      !e.target.closest('[role="button"]')
    ) {
      handleSetIsOpen(!isOpen);
    }
  };

  const handleSignOut = async () => {
    // Sign out using the global Supabase client
    await supabase.auth.signOut();
    
    // Force a page refresh to ensure a clean state
    window.location.href = "/";
  };

  const handleDropdownToggle = (title) => {
    setOpenDropdowns(prev => ({ ...prev, [title]: !prev[title] }));
  };
  
  // Helper function to render a menu item (section or link)
  const renderMenuItem = (item, index, keyPrefix = "main") => {
    // Section header
    if (item.section) {
      if (!isOpen) return null; // Don't render section header when sidebar is closed
      return (
        <div
          key={`${keyPrefix}-section-${index}`}
          className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-3"
        >
          {item.section}
        </div>
      );
    }

    // Dropdown menu item
    if (item.subItems) {
      const isDropdownOpen = !!openDropdowns[item.title];
      const isAnySubItemActive = item.subItems.some(sub => isMenuItemActive(pathname, sub.url));

      // When sidebar is closed, render a link to the primary sub-item.
      if (!isOpen) {
        const primarySubItem = item.subItems.find(sub => !sub.url.includes('create')) || item.subItems[0];
        return (
          <Button
            key={`${keyPrefix}-item-closed-${index}`}
            asChild
            variant="ghost"
            className={cn(
              "flex w-full items-center justify-start gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary relative overflow-hidden group",
              isAnySubItemActive && "text-primary font-bold bg-primary/10"
            )}
          >
            <Link href={primarySubItem.url}>
              {isAnySubItemActive && (
                <div className="absolute left-0 top-0 w-[5px] h-full bg-primary" />
              )}
              {item.icon && (
                <item.icon
                  className={cn("h-4 w-4", { "text-primary": isAnySubItemActive })}
                />
              )}
            </Link>
          </Button>
        );
      }

      // When sidebar is open, render the full dropdown
      return (
        <div key={`${keyPrefix}-dropdown-${index}`} className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className={cn(
              "flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary",
              isAnySubItemActive && "text-primary font-bold"
            )}
            onClick={() => handleDropdownToggle(item.title)}
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <item.icon
                  className={cn("h-4 w-4", { "text-primary": isAnySubItemActive })}
                />
              )}
              <span className="text-sm font-medium truncate">{item.title}</span>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", {
                "rotate-180": isDropdownOpen,
              })}
            />
          </Button>
          {isDropdownOpen && (
            <div className="ml-4 flex flex-col gap-1 border-l border-border/50 pl-2">
              {item.subItems.map((subItem, subIndex) => {
                const isSubActive = isMenuItemActive(pathname, subItem.url);
                return (
                  <Button
                    key={`${keyPrefix}-subitem-${subIndex}`}
                    asChild
                    variant="ghost"
                    className={cn(
                      "flex w-full items-center justify-start gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground",
                      isSubActive && "text-primary font-bold bg-primary/10"
                    )}
                  >
                    <Link href={subItem.url}>
                      {subItem.icon && (
                        <subItem.icon className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium truncate">{subItem.title}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    // Menu item with link
    if (item.title && item.url) {
      const isActive = isMenuItemActive(pathname, item.url);
      
      return (
        <Button
          key={`${keyPrefix}-item-${index}`}
          asChild
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-start gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary relative overflow-hidden group",
            isActive && "text-primary font-bold bg-primary/10"
          )}
        >
          <Link href={item.url}>
            {isActive && (
              <div className="absolute left-0 top-0 w-[5px] h-full bg-primary" />
            )}
            {item.icon && (
              <item.icon
                className={cn("h-4 w-4", {
                  "text-primary": isActive,
                })}
              />
            )}
            {isOpen && (
              <span className="text-sm font-medium truncate">
                {item.title}
              </span>
            )}
          </Link>
        </Button>
      );
    }
    
    return null;
  };

  return (
    <aside
      className={`relative ;/ border-r border-border flex-shrink-0 transition-all duration-300 ease-in-out cursor-pointer hidden md:block ${
        isOpen ? "w-[240px]" : "w-[60px]"
      }`}
      onClick={handleSidebarClick}
    >
      <div className="h-full flex flex-col bg-card border-border overflow-hidden">
        {/* Header with logo */}
        <div className="h-[70px] border-b border-border p-3 mb-2 flex items-center justify-between">
          {isOpen ? (
            <Logo />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <span className="text-primary-foreground font-bold">TM</span>
            </div>
          )}
        </div>

        {/* Main navigation items */}
        <div className="flex-1 p-2 flex flex-col justify-start gap-1 overflow-y-auto">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </div>

        {/* Footer items */}
        <div className="p-2 border-t border-border flex flex-col gap-1">
          {footerItems.map((item, index) => renderMenuItem(item, index, "footer"))}
          
          {/* Logout button (special case since it's not a link) */}
          <Button
            className="flex w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg"
            variant="ghost"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 