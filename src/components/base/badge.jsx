import React from "react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PrimaryBadge = ({ children, className, ...props }) => {
  return (
    <UIBadge 
      variant="outline" 
      className={cn("bg-primary/10 text-primary font-medium px-4 py-1.5", className)} 
      {...props}
    >
      {children}
    </UIBadge>
  );
};

const SecondaryBadge = ({ children, className, ...props }) => {
  return (
    <UIBadge 
      variant="default" 
      className={cn("bg-primary/20 text-primary font-medium px-4 py-1.5", className)} 
      {...props}
    >
      {children}
    </UIBadge>
  );
};

export { PrimaryBadge, SecondaryBadge }; 