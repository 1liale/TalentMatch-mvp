"use client"

import Sidebar from "@/components/nav/sidebar";
import { AuthHeader } from "@/components/nav/header";
import { ProfileProvider } from "@/context/profile-context";
import { JobApplicationProvider } from "@/context/job-application-context";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { JobApplicationModal } from "@/components/jobs/application-modal";
import { useJobApplication } from "@/context/job-application-context";
import { calculateTimeAgo } from "@/utils/date";

export default function DashboardLayout({ children }) {
  const { loading: authLoading } = useAuth();

  // Show a loading spinner while auth is being checked
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <ProfileProvider>
      <JobApplicationProvider>
        <DashboardContent>{children}</DashboardContent>
      </JobApplicationProvider>
    </ProfileProvider>
  );
}

// Separate component to access profile context and job application context
function DashboardContent({ children }) {
  const { user } = useAuth();
  const { isApplicationModalOpen, setIsApplicationModalOpen, selectedJob, resumes } = useJobApplication();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-sm">Please log in to access the dashboard</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <AuthHeader />
        {children}
        
        {/* Job Application Modal */}
        {selectedJob && (
          <JobApplicationModal
            job={{
              id: selectedJob.id,
              title: selectedJob.title,
              company: selectedJob.company,
              location: selectedJob.location,
              salary: selectedJob.salary,
              postDate: calculateTimeAgo(selectedJob.post_date),
              type: selectedJob.employment_type,
              experience: selectedJob.experience_level,
              description: selectedJob.description
            }}
            open={isApplicationModalOpen}
            onOpenChange={setIsApplicationModalOpen}
            resumes={resumes}
            userId={user?.id}
          />
        )}
      </div>
    </div>
  );
} 