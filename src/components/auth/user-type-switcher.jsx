"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const UserTypeSwitcher = ({ userType, setUserRole }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <Tabs 
        defaultValue={userType} 
        onValueChange={setUserRole}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applicant" className="font-serif">Applicant</TabsTrigger>
          <TabsTrigger value="hiring" className="font-serif">Hiring Manager</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
} 