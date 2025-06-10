import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, Clock, MapPin, BarChart, ArrowRight, Github, Linkedin, Globe } from "lucide-react";
import { createJobApplication } from "@/utils/supabase/db/mutations";
import { getApplicationRequiredFields } from "@/utils/supabase/db/queries";
import { toast } from "sonner";

export function JobApplicationModal({ 
  job, 
  open, 
  onOpenChange, 
  resumes = [], 
  userId,
  isReadOnly = false,
  applicationData = null 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(resumes.length > 0 ? resumes[0].id : "");
  const [selectedResume, setSelectedResume] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [requiredFields, setRequiredFields] = useState({
    phone: true,
    resume: true,
    availability: true
  });
  
  const [formData, setFormData] = useState({
    phone: "",
    availability: "immediate",
    experience: "",
    skills: [],
    bio: "",
    socialLinks: {
      linkedin: "",
      github: "",
      portfolio: ""
    }
  });

  // Load application data in read-only mode
  useEffect(() => {
    if (isReadOnly && applicationData) {
      // Populate form with application data for viewing
      setFormData({
        phone: applicationData.phone || "",
        availability: applicationData.availability || "immediate",
        experience: applicationData.experience || "",
        skills: applicationData.skills || [],
        bio: applicationData.bio || "",
        socialLinks: applicationData.socialLinks || {
          linkedin: "",
          github: "",
          portfolio: ""
        }
      });
      
      if (applicationData.resumeId) {
        setSelectedResumeId(applicationData.resumeId);
      }
    }
  }, [isReadOnly, applicationData]);

  // Load required fields configuration
  // useEffect(() => {
  //   const loadRequiredFields = async () => {
  //     try {
  //       const fields = await getApplicationRequiredFields();
  //       setRequiredFields(fields.required);
  //     } catch (error) {
  //       console.error("Error loading required fields:", error);
  //     }
  //   };
    
  //   loadRequiredFields();
  // }, []);

  // Update selected resume when changed
  useEffect(() => {
    if (!selectedResumeId || selectedResumeId === "") {
      setSelectedResume(null);
      setFeedbackData(null);
      return;
    }

    const resume = resumes.find(r => r.id.toString() === selectedResumeId.toString());
    setSelectedResume(resume || null);
    
    // Extract feedback data if available
    if (resume && resume.feedback) {
      setFeedbackData(resume.feedback);
      
      // Pre-populate form with resume data
      const newFormData = { ...formData };
      
      if (resume.feedback.skills) {
        newFormData.skills = resume.feedback.skills;
      }
      
      if (resume.feedback.bio) {
        newFormData.bio = resume.feedback.bio;
      }
      
      if (resume.feedback.experience) {
        newFormData.experience = resume.feedback.experience;
      }
      
      if (resume.feedback.social_links) {
        newFormData.socialLinks = {
          linkedin: resume.feedback.social_links.linkedin || "",
          github: resume.feedback.social_links.github || "",
          portfolio: resume.feedback.social_links.portfolio || ""
        };
      }
      
      setFormData(newFormData);
    }
  }, [selectedResumeId, resumes]);

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSocialLinkChange = (platform, value) => {
    if (isReadOnly) return;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };
  
  const handleSkillsChange = (e) => {
    if (isReadOnly) return;
    const skillsText = e.target.value;
    // Convert comma-separated string to array
    const skillsArray = skillsText ? 
      skillsText.split(',').map(skill => skill.trim()).filter(Boolean) : 
      [];
    
    setFormData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (requiredFields.resume && !selectedResumeId) {
      toast.error("Please select a resume to apply");
      return;
    }
    
    if (requiredFields.phone && !formData.phone) {
      toast.error("Please provide a phone number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format skills for submission if provided as string
      const skillsToSubmit = 
        typeof formData.skills === 'string' ? 
        formData.skills.split(',').map(s => s.trim()).filter(Boolean) : 
        formData.skills;
      
      // Create application using the mutation function
      await createJobApplication({
        jobId: job.id,
        userId: userId,
        resumeId: selectedResumeId || null,
        coverLetter: formData.coverLetter || "",
        phone: formData.phone,
        availability: formData.availability,
        skills: skillsToSubmit,
        experience: formData.experience,
        socialLinks: formData.socialLinks,
        bio: formData.bio
      });
      
      // Close modal and show success
      onOpenChange(false);
      toast.success("Your application has been submitted successfully!");
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("There was an error submitting your application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format skills array to comma-separated string for input display
  const skillsAsString = Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills;

  // Determine what to show in the header and title based on mode
  const modalTitle = isReadOnly ? "Application Details" : "Apply for Position";
  const modalDescription = isReadOnly 
    ? "View the details of this application" 
    : "Complete the form below to apply for this position";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#f5eed9]/95 job-application-context"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#5c4b23]">{modalTitle}</DialogTitle>
          <DialogDescription className="text-[#7a673c]">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Summary */}
          <div className="space-y-3 rounded-lg pb-4">
            <h3 className="text-xl font-semibold text-[#5c4b23]">
              {isReadOnly && applicationData ? 
                (applicationData.job_title || applicationData.jobs?.title) : 
                job?.title
              }
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#7a673c]">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>
                  {isReadOnly && applicationData ? 
                    (applicationData.company_name || applicationData.jobs?.company) : 
                    job?.company
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {isReadOnly && applicationData ? 
                    (applicationData.job_location || applicationData.jobs?.location) : 
                    job?.location
                  }
                </span>
              </div>
              {!isReadOnly && job?.salary && (
                <div className="font-medium">
                  {job.salary}
                </div>
              )}
              {isReadOnly && applicationData?.jobs?.salary && (
                <div className="font-medium">
                  {applicationData.jobs.salary}
                </div>
              )}
              {isReadOnly && applicationData?.status && (
                <Badge className="ml-auto">
                  {applicationData.status}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {!isReadOnly && job?.type && (
                <Badge variant="outline" className="bg-[#e8dfbe] text-[#5c4b23] font-normal border-[#c2b795]">
                  {job.type}
                </Badge>
              )}
              {!isReadOnly && job?.experience && (
                <Badge variant="outline" className="bg-[#e8dfbe] text-[#5c4b23] font-normal border-[#c2b795]">
                  {job.experience}
                </Badge>
              )}
              {!isReadOnly && job?.postDate && (
                <Badge variant="outline" className="text-xs text-[#7a673c] bg-transparent border-[#c2b795]">
                  {job.postDate}
                </Badge>
              )}
              {isReadOnly && applicationData?.jobs?.employment_type && (
                <Badge variant="outline" className="bg-[#e8dfbe] text-[#5c4b23] font-normal border-[#c2b795]">
                  {applicationData.jobs.employment_type}
                </Badge>
              )}
              {isReadOnly && applicationData?.jobs?.job_seniority && (
                <Badge variant="outline" className="bg-[#e8dfbe] text-[#5c4b23] font-normal border-[#c2b795]">
                  {applicationData.jobs.job_seniority}
                </Badge>
              )}
              {isReadOnly && applicationData?.created_at && (
                <Badge variant="outline" className="text-xs text-[#7a673c] bg-transparent border-[#c2b795]">
                  Applied: {new Date(applicationData.created_at).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Job Description - Show in read-only mode too */}
          {((!isReadOnly && job?.description) || (isReadOnly && applicationData?.jobs?.description)) && (
            <div className="space-y-2">
              <Label className="text-sm text-[#7a673c] font-medium">Job Description</Label>
              <div className="max-h-[100px] overflow-y-auto p-3 bg-[#e8dfbe]/60 rounded-md border border-[#c2b795] text-[#5c4b23]">
                {isReadOnly ? applicationData?.jobs?.description : job?.description}
              </div>
            </div>
          )}
          
          {/* Resume Selection */}
          {!isReadOnly && (
            <div className="space-y-2">
              <Label htmlFor="resume" className={`text-sm ${requiredFields.resume ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''} text-[#7a673c] font-medium`}>
                Select Resume
              </Label>
              
              {resumes.length > 0 ? (
                <Select 
                  value={selectedResumeId.toString()} 
                  onValueChange={(value) => setSelectedResumeId(value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="bg-white border-[#c2b795]">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id.toString()}>
                        {resume.file_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm">
                  You haven't uploaded any resumes yet. Please upload a resume first.
                </div>
              )}
            </div>
          )}
          
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className={`text-sm ${!isReadOnly && requiredFields.phone ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''} text-[#7a673c] font-medium`}>
              Phone Number
            </Label>
            <Input 
              id="phone" 
              name="phone" 
              placeholder="Enter your phone number" 
              value={formData.phone} 
              onChange={handleChange} 
              className="bg-white border-[#c2b795]"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability" className={`text-sm ${!isReadOnly && requiredFields.availability ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''} text-[#7a673c] font-medium`}>
              Availability
            </Label>
            <Select 
              value={formData.availability} 
              onValueChange={(value) => handleSelectChange('availability', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger id="availability" className="bg-white border-[#c2b795]">
                <SelectValue placeholder="When can you start?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
                <SelectItem value="1_month">1 Month Notice</SelectItem>
                <SelectItem value="custom">Other (Specify in notes)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience" className="text-sm text-[#7a673c] font-medium">
              Years of Experience
            </Label>
            <Input 
              id="experience" 
              name="experience" 
              placeholder="Years of relevant experience" 
              value={formData.experience} 
              onChange={handleChange}
              className="bg-white border-[#c2b795]"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills" className="text-sm text-[#7a673c] font-medium">
              Skills
            </Label>
            <Textarea 
              id="skills" 
              name="skills" 
              placeholder="Enter your skills, separated by commas" 
              value={skillsAsString} 
              onChange={handleSkillsChange}
              className="bg-white border-[#c2b795] min-h-[80px]"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Bio/About */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm text-[#7a673c] font-medium">
              About You
            </Label>
            <Textarea 
              id="bio" 
              name="bio" 
              placeholder="Brief introduction about yourself" 
              value={formData.bio} 
              onChange={handleChange}
              className="bg-white border-[#c2b795] min-h-[100px]"
              disabled={isReadOnly}
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Social Links */}
          <div className="space-y-3">
            <Label className="text-sm text-[#7a673c] font-medium">
              Social & Portfolio Links
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[#0077b5]" />
                <Input 
                  placeholder="LinkedIn URL" 
                  value={formData.socialLinks.linkedin} 
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="bg-white border-[#c2b795]"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5 text-[#333]" />
                <Input 
                  placeholder="GitHub URL" 
                  value={formData.socialLinks.github} 
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  className="bg-white border-[#c2b795]"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#2563eb]" />
                <Input 
                  placeholder="Portfolio URL" 
                  value={formData.socialLinks.portfolio} 
                  onChange={(e) => handleSocialLinkChange('portfolio', e.target.value)}
                  className="bg-white border-[#c2b795]"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            {!isReadOnly ? (
              <Button 
                type="submit" 
                className="bg-[#5c4b23] hover:bg-[#4a3c1c] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 