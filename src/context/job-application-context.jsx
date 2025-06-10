"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserResumes } from "@/utils/supabase/db/queries";
import { useAuth } from "@/context/auth-context";

const JobApplicationContext = createContext(null);

export function JobApplicationProvider({ children }) {
  const { user } = useAuth();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Load user's resumes
    const loadResumes = async () => {
      try {
        const userResumes = await getUserResumes(user.id);
        setResumes(userResumes);
      } catch (error) {
        console.error("Error loading resumes:", error);
      }
    };
    
    loadResumes();
  }, [user]);
  
  const openApplicationModal = (job) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login?redirect=/dashboard/jobs";
      return;
    }
    
    setSelectedJob(job);
    setIsReadOnly(false);
    setApplicationData(null);
    setIsApplicationModalOpen(true);
  };
  
  const viewApplicationDetails = (application) => {
    setApplicationData(application);
    setIsReadOnly(true);
    setIsApplicationModalOpen(true);
  };
  
  const closeApplicationModal = () => {
    setIsApplicationModalOpen(false);
    // Delay clearing the data to avoid UI flicker
    setTimeout(() => {
      setSelectedJob(null);
      setApplicationData(null);
      setIsReadOnly(false);
    }, 300);
  };
  
  return (
    <JobApplicationContext.Provider
      value={{
        isApplicationModalOpen,
        selectedJob,
        resumes,
        isReadOnly,
        applicationData,
        openApplicationModal,
        viewApplicationDetails,
        closeApplicationModal,
        setIsApplicationModalOpen,
      }}
    >
      {children}
    </JobApplicationContext.Provider>
  );
}

export const useJobApplication = () => {
  const context = useContext(JobApplicationContext);
  if (context === null) {
    throw new Error("useJobApplication must be used within a JobApplicationProvider");
  }
  return context;
}; 