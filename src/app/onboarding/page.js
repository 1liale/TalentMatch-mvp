"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { saveOnboardingProfile } from "@/utils/supabase/db/mutations";
import { 
  TypographyH1, 
  TypographyP 
} from "@/components/ui/typography";
import { toast } from "sonner";

// Import consolidated components
import ProfileQuiz from "@/components/onboarding/profile-quiz";
import StepIndicator from "@/components/onboarding/step-indicator";
import NavigationButtons from "@/components/onboarding/navigation-bar";

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Common fields
    userType: null, // Store selected role here
    fullName: "",
    username: "",
    bio: "",
    location: "",
    
    // Applicant fields
    title: "",
    skills: "",
    experience: "",
    education: "",
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    
    // Recruiter fields
    employerCompanyName: "",
    companySize: "",
    industry: "",
    companyWebsite: "",
    hiringRoles: "",
  });
  
  // Use ref to access the profile quiz component's validation function
  const profileQuizRef = useRef();
  
  const nextStep = () => {
    // If we're not on the last step and validation passes, proceed
    if (profileQuizRef.current && profileQuizRef.current.validateStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    // Validate the final step before submission
    if (profileQuizRef.current && !profileQuizRef.current.validateStep()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    
    try {
      // Use the server action to save profile with formData that includes userType
      await saveOnboardingProfile(user.id, formData);
      toast.success("Profile saved successfully!");
      
      // Redirect to dashboard after completion
      router.push('/dashboard/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full mx-auto">
          <div className="space-y-8 py-8">
            <div className="text-center space-y-2">
              <TypographyH1>Complete Your Profile</TypographyH1>
              <TypographyP className="text-muted-foreground text-lg">
                Let&apos;s set up your TalentMatch profile
              </TypographyP>
            </div>

            <div className="space-y-8">
              {/* Step indicators */}
              <StepIndicator currentStep={currentStep} />

              {/* Profile Quiz - consolidated component with internal state */}
              <ProfileQuiz
                ref={profileQuizRef}
                currentStep={currentStep}
                onFormDataChange={(newFormData) => setFormData(newFormData)}
                formData={formData}
              />

              {/* Navigation buttons */}
              <NavigationButtons
                currentStep={currentStep}
                isLastStep={currentStep === 3}
                canProceed={currentStep === 0 ? !!formData.userType : true}
                onNext={nextStep}
                onPrevious={prevStep}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 