"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  TypographyH1, 
  TypographyH2, 
  TypographyH3, 
  TypographyP, 
  TypographyLead
} from "@/components/ui/typography";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { 
  FileText,
  ArrowUpRight
} from "lucide-react";

// Import components
import FileUploadArea from "@/components/resumes/file-upload";
import FeedbackArea from "@/components/resumes/feedback";
import { ResumeCard } from "@/components/base/card";

// Import data layer functions
import { getUserResumes } from "@/utils/supabase/db/queries";
import { uploadResume, deleteResume, saveResumeFeedback, processResumeWithAI } from "@/utils/supabase/db/mutations";

export default function ResumesPage() {
  const { user } = useAuth();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resumes on mount
  useEffect(() => {
    if (!user) return;
    
    const fetchResumes = async () => {
      try {
        setIsLoading(true);
        const data = await getUserResumes(user.id);
        setResumes(data);
      } catch (error) {
        console.error("Error fetching resumes:", error);
        toast.error("Failed to load your resumes");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumes();
  }, [user]);

  // Handle file upload
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    
    try {
      // Upload resume through data layer
      const newResume = await uploadResume(user.id, file);
      
      // Add new resume to state
      setResumes(prev => [newResume, ...prev]);
      toast.success("Resume uploaded successfully");
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle resume deletion
  const handleDeleteResume = async (resumeId) => {    
    try {
      // Find the resume to delete
      const resumeToDelete = resumes.find(r => r.id === resumeId);
      
      if (!resumeToDelete) {
        throw new Error("Resume not found");
      }
      
      // Delete resume through data layer
      await deleteResume(user.id, resumeId, resumeToDelete.file_url);
      
      // Update state
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      
      // Clear feedback if the deleted resume was selected
      if (selectedResume && selectedResume.id === resumeId) {
        setSelectedResume(null);
        setFeedback(null);
      }
      
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume. Please try again.");
    }
  };
  
  // Get AI review for resume
  const handleReviewResume = async (resume) => {
    setSelectedResume(resume);
    
    if (resume.feedback) {
      // If already reviewed, just show the existing feedback
      setFeedback(resume.feedback);
      return;
    }
    
    setIsReviewing(true);
    
    try {
      // Get the resume file from storage
      const response = await fetch(resume.file_url);
      const fileBlob = await response.blob();
      const file = new File([fileBlob], resume.file_name, { type: fileBlob.type });
      
      // Process the resume with AI
      const feedbackData = await processResumeWithAI(resume.id, file);
      
      // Update local state
      setFeedback(feedbackData);
      setResumes(prev => 
        prev.map(r => 
          r.id === resume.id ? { ...r, feedback: feedbackData, feedback_updated_at: new Date().toISOString() } : r
        )
      );
      
      toast.success("Resume analysis complete");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <TypographyH1 className="mb-2">Manage Your Resumes</TypographyH1>
        <TypographyLead>
          Upload, analyze, and improve your resume with AI-powered feedback
        </TypographyLead>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Upload and resumes list */}
        <div className="space-y-6">
          {/* Upload area */}
          <FileUploadArea 
            onFileSelected={handleFileUpload}
            isUploading={isUploading}
          />
          
          {/* Resumes list */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <TypographyH2 className="text-xl">Your Resumes</TypographyH2>
              <TypographyP className="text-muted-foreground text-sm">
                {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
              </TypographyP>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <TypographyP className="text-muted-foreground">Loading your resumes...</TypographyP>
              </div>
            ) : resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map(resume => (
                  <ResumeCard 
                    key={resume.id} 
                    resume={resume}
                    onDelete={handleDeleteResume}
                    onReview={handleReviewResume}
                    isReviewing={isReviewing && selectedResume?.id === resume.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <TypographyH3 className="text-lg mb-2">No resumes yet</TypographyH3>
                <TypographyP className="text-muted-foreground mb-4">
                  Upload your first resume to get AI-powered feedback
                </TypographyP>
              </Card>
            )}
          </div>
        </div>
        
        {/* Right column: AI feedback */}
        <div>
          {selectedResume ? (
            <FeedbackArea feedback={feedback} />
          ) : (
            <Card className="p-8 h-full flex flex-col items-center justify-center text-center border-dashed">
              <ArrowUpRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <TypographyH3 className="text-lg mb-2">Select a resume for feedback</TypographyH3>
              <TypographyP className="text-muted-foreground max-w-md">
                Choose one of your resumes to get detailed AI analysis and improvement suggestions
              </TypographyP>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 