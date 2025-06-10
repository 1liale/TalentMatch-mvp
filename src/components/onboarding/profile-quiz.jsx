"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TypographyH2, TypographyP, TypographyLabel } from "@/components/ui/typography";
import { Users, Briefcase } from "lucide-react";
import { z } from "zod";

// Define validation schemas for different steps
const roleSchema = z.object({
  userType: z.enum(["applicant", "recruiter"], {
    required_error: "Please select a role"
  }),
});

const basicProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  location: z.string().max(100).optional(),
});

const applicantProfileSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  skills: z.string().optional(),
  experience: z.enum(["0-1", "1-3", "3-5", "5-10", "10+"], {
    required_error: "Please select your experience level"
  }),
  education: z.string().max(200).optional(),
});

const recruiterProfileSchema = z.object({
  employerCompanyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.string().min(1, "Please select a company size"),
  companyWebsite: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
});

const applicantLinksSchema = z.object({
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").or(z.string().length(0)).optional(),
  githubUrl: z.string().url("Please enter a valid GitHub URL").or(z.string().length(0)).optional(),
  portfolioUrl: z.string().url("Please enter a valid portfolio URL").or(z.string().length(0)).optional(),
});

const recruiterNeedsSchema = z.object({
  hiringRoles: z.string().optional(),
});

const ProfileQuiz = forwardRef(({ currentStep, formData, onFormDataChange }, ref) => {
  const [errors, setErrors] = useState({});

  // Validate the current step's data
  const validateStep = () => {
    try {
      let validationSchema;

      switch (currentStep) {
        case 0:
          validationSchema = roleSchema;
          break;
        case 1:
          validationSchema = basicProfileSchema;
          break;
        case 2:
          validationSchema = formData.userType === 'applicant' 
            ? applicantProfileSchema 
            : recruiterProfileSchema;
          break;
        case 3:
          validationSchema = formData.userType === 'applicant' 
            ? applicantLinksSchema 
            : recruiterNeedsSchema;
          break;
        default:
          return true;
      }

      // Extract only the fields relevant for the current schema
      const currentStepData = {};
      Object.keys(validationSchema.shape).forEach(key => {
        currentStepData[key] = formData[key];
      });

      validationSchema.parse(currentStepData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.errors.forEach(err => {
          formattedErrors[err.path[0]] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  // Expose the validateStep function to the parent component via ref
  useImperativeHandle(ref, () => ({
    validateStep
  }));

  // Handle direct input changes (single value fields)
  const handleDirectInputChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange({ ...formData, [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    onFormDataChange({ ...formData, [name]: value });
  };

  // Handle role selection
  const handleRoleSelection = (role) => {
    onFormDataChange({ ...formData, userType: role });
  };

  // Render step content based on the current step
  switch (currentStep) {
    // Step 0: Role Selection
    case 0:
      return (
        <div className="space-y-6">
          <TypographyH2 className="text-center">I am a...</TypographyH2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                formData.userType === 'applicant' ? 'border-primary border-2' : ''
              }`}
              onClick={() => handleRoleSelection('applicant')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users size={32} className="text-primary" />
                </div>
                <div>
                  <TypographyH2 className="text-xl">Job Seeker</TypographyH2>
                  <TypographyP className="text-muted-foreground">
                    I'm looking for new opportunities and want to showcase my skills to employers.
                  </TypographyP>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                formData.userType === 'recruiter' ? 'border-primary border-2' : ''
              }`}
              onClick={() => handleRoleSelection('recruiter')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase size={32} className="text-primary" />
                </div>
                <div>
                  <TypographyH2 className="text-xl">Employer</TypographyH2>
                  <TypographyP className="text-muted-foreground">
                    I'm hiring talent and want to find the best candidates for my company.
                  </TypographyP>
                </div>
              </div>
            </Card>
          </div>
          {errors.userType && (
            <div className="text-destructive text-center">{errors.userType}</div>
          )}
        </div>
      );

    // Step 1: Basic Profile
    case 1:
      return (
        <div className="space-y-6">
          <TypographyH2 className="text-center">Tell us about yourself</TypographyH2>
          
          <div className="space-y-4">
            <div>
              <TypographyLabel htmlFor="fullName">
                Full Name
              </TypographyLabel>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleDirectInputChange}
                placeholder="Your full name"
                required
              />
              {errors.fullName && (
                <div className="text-destructive text-sm mt-1">{errors.fullName}</div>
              )}
            </div>
            
            <div>
              <TypographyLabel htmlFor="username">
                Username
              </TypographyLabel>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleDirectInputChange}
                placeholder="Choose a username"
                required
              />
              {errors.username && (
                <div className="text-destructive text-sm mt-1">{errors.username}</div>
              )}
            </div>
            
            <div>
              <TypographyLabel htmlFor="location">
                Location
              </TypographyLabel>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleDirectInputChange}
                placeholder="City, State / Province, Country"
              />
              {errors.location && (
                <div className="text-destructive text-sm mt-1">{errors.location}</div>
              )}
            </div>
            
            <div>
              <TypographyLabel htmlFor="bio">
                Bio
              </TypographyLabel>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleDirectInputChange}
                placeholder="Tell us a bit about yourself"
                rows={4}
              />
              {errors.bio && (
                <div className="text-destructive text-sm mt-1">{errors.bio}</div>
              )}
            </div>
          </div>
        </div>
      );

    // Step 2: Role-specific profiles
    case 2:
      if (formData.userType === 'applicant') {
        return (
          <div className="space-y-6">
            <TypographyH2 className="text-center">Professional Information</TypographyH2>
            
            <div className="space-y-4">
              <div>
                <TypographyLabel htmlFor="title">
                  Professional Title
                </TypographyLabel>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleDirectInputChange}
                  placeholder="e.g. Full Stack Developer"
                  required
                />
                {errors.title && (
                  <div className="text-destructive text-sm mt-1">{errors.title}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="experience">
                  Years of Experience
                </TypographyLabel>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => handleSelectChange("experience", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
                {errors.experience && (
                  <div className="text-destructive text-sm mt-1">{errors.experience}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="skills">
                  Skills (comma separated)
                </TypographyLabel>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleDirectInputChange}
                  placeholder="React, JavaScript, Node.js"
                />
                {errors.skills && (
                  <div className="text-destructive text-sm mt-1">{errors.skills}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="education">
                  Education
                </TypographyLabel>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleDirectInputChange}
                  placeholder="Degree, Institution"
                />
                {errors.education && (
                  <div className="text-destructive text-sm mt-1">{errors.education}</div>
                )}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="space-y-6">
            <TypographyH2 className="text-center">Company Information</TypographyH2>
            
            <div className="space-y-4">
              <div>
                <TypographyLabel htmlFor="employerCompanyName">
                  Company Name
                </TypographyLabel>
                <Input
                  id="employerCompanyName"
                  name="employerCompanyName"
                  value={formData.employerCompanyName}
                  onChange={handleDirectInputChange}
                  placeholder="Your company name"
                  required
                />
                {errors.employerCompanyName && (
                  <div className="text-destructive text-sm mt-1">{errors.employerCompanyName}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="industry">
                  Industry
                </TypographyLabel>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <div className="text-destructive text-sm mt-1">{errors.industry}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="companySize">
                  Company Size
                </TypographyLabel>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => handleSelectChange("companySize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <div className="text-destructive text-sm mt-1">{errors.companySize}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="companyWebsite">
                  Company Website
                </TypographyLabel>
                <Input
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleDirectInputChange}
                  placeholder="https://yourcompany.com"
                />
                {errors.companyWebsite && (
                  <div className="text-destructive text-sm mt-1">{errors.companyWebsite}</div>
                )}
              </div>
            </div>
          </div>
        );
      }

    // Step 3: Role-specific extra info
    case 3:
      if (formData.userType === 'applicant') {
        return (
          <div className="space-y-6">
            <TypographyH2 className="text-center">Your Online Presence</TypographyH2>
            
            <div className="space-y-4">
              <div>
                <TypographyLabel htmlFor="linkedinUrl">
                  LinkedIn URL
                </TypographyLabel>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleDirectInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {errors.linkedinUrl && (
                  <div className="text-destructive text-sm mt-1">{errors.linkedinUrl}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="githubUrl">
                  GitHub URL
                </TypographyLabel>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleDirectInputChange}
                  placeholder="https://github.com/yourusername"
                />
                {errors.githubUrl && (
                  <div className="text-destructive text-sm mt-1">{errors.githubUrl}</div>
                )}
              </div>
              
              <div>
                <TypographyLabel htmlFor="portfolioUrl">
                  Portfolio URL
                </TypographyLabel>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleDirectInputChange}
                  placeholder="https://yourportfolio.com"
                />
                {errors.portfolioUrl && (
                  <div className="text-destructive text-sm mt-1">{errors.portfolioUrl}</div>
                )}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="space-y-6">
            <TypographyH2 className="text-center">Hiring Needs</TypographyH2>
            
            <div className="space-y-4">
              <div>
                <TypographyLabel htmlFor="hiringRoles">
                  What roles are you hiring for? (comma separated)
                </TypographyLabel>
                <Input
                  id="hiringRoles"
                  name="hiringRoles"
                  value={formData.hiringRoles}
                  onChange={handleDirectInputChange}
                  placeholder="Frontend Developer, UX Designer"
                />
                {errors.hiringRoles && (
                  <div className="text-destructive text-sm mt-1">{errors.hiringRoles}</div>
                )}
              </div>
            </div>
          </div>
        );
      }

    default:
      return null;
  }
});

ProfileQuiz.displayName = "ProfileQuiz";

export default ProfileQuiz; 