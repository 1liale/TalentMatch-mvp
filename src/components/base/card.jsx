import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Star, Briefcase, Clock, User, FileText, Trash2, Download, CheckCircle, AlertTriangle, MapPin, Calendar, Award, BarChart, ChevronRight, Users } from "lucide-react";
import { TypographyH3, TypographyP, TypographySmall, TypographyH2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";


// Primary Cards
const PrimaryCardLarge = ({ icon, title, description, className, ...props }) => {
  return (
    <Card className={cn("rounded-xl hover:shadow-primary transition-shadow duration-300 group", className)} {...props}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl mb-3 text-center">{title}</CardTitle>
        <CardDescription className="leading-relaxed text-center">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const PrimaryCardMedium = ({ icon, title, description, className, ...props }) => {
  return (
    <Card className={cn("rounded-xl hover:shadow-sm transition-shadow duration-300 group", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const PrimaryCardSmall = ({ icon, title, className, ...props }) => {
  return (
    <Card className={cn("rounded-xl hover:shadow-sm transition-shadow duration-300 group", className)} {...props}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardContent>
    </Card>
  );
};


/**
 * Match score component
 */
const MatchScore = ({ score }) => {
  if (!score) return null;
  
  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      <span className={`text-sm font-medium ${getScoreColor(score)}`}>{score}% match</span>
    </div>
  );
};

/**
 * StatsCard component for displaying numerical stats with icons
 */
const StatsCard = ({ 
  icon, 
  label, 
  value, 
  note, 
  noteColor = "text-green-600", 
  className, 
  ...props 
}) => {
  return (
    <Card className={cn("p-5 hover:shadow-md transition-shadow", className)} {...props}>
      <div className="flex justify-between items-start">
        <div>
          <TypographyP className="text-sm text-muted-foreground mb-1">{label}</TypographyP>
          <TypographyH3 className="text-2xl font-bold">{value}</TypographyH3>
        </div>
        <div className="bg-primary/10 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      {note && (
        <TypographyP className={cn("text-xs mt-2", noteColor)}>{note}</TypographyP>
      )}
    </Card>
  );
};


// Status badge component for application statuses
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
      case 'applied':
        return { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> };
      case 'shortlisted':
      case 'interview':
        return { color: 'bg-amber-100 text-amber-800', icon: <Star className="h-3 w-3" /> };
      case 'rejected':
        return { color: 'bg-rose-100 text-rose-800', icon: <AlertTriangle className="h-3 w-3" /> };
      case 'offered':
        return { color: 'bg-violet-100 text-violet-800', icon: <FileText className="h-3 w-3" /> };
      case 'hired':
      case 'accepted':
        return { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="h-3 w-3" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> };
    }
  };

  const { color, icon } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} gap-1`}>
      {icon}
      {status}
    </span>
  );
};

/**
 * Application card component for displaying job applications - flexible for different data structures
 */
const ApplicationCard = ({ application, applicant, status, onViewDetails }) => {
    // Handle different data structures
    let data, jobData, companyData, statusData;
    
    if (application?.jobs) {
        // Standard application with job relationship
        data = application;
        jobData = application.jobs;
        companyData = jobData.companies || {};
        statusData = application.status;
    } else if (application) {
        // Simple application data structure
        data = application;
        jobData = {
            title: application.position,
            company: application.company,
            location: application.location
        };
        companyData = { name: application.company };
        statusData = application.status;
    } else if (applicant) {
        // Applicant-focused structure (from talent search/applicants view)
        data = applicant;
        jobData = {
            title: applicant.job_title || applicant.full_name,
            company: applicant.current_employer,
            location: applicant.location
        };
        companyData = { name: applicant.current_employer };
        statusData = status || "Applied";
    } else {
        return null;
    }

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case "interview":
                return "default";
            case "application review":
                return "secondary";
            case "skills assessment":
                return "outline";
            default:
                return "destructive";
        }
    };

    const matchScore = data.match_score || data.metadata?.matchScore;
    const dateValue = data.created_at || data.date;
    const skillsData = data.skills || data.tags || [];

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {companyData?.logo_url ? (
                                <img src={companyData.logo_url} alt={`${companyData.name} logo`} className="h-10 w-10 rounded-full" />
                            ) : (
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{jobData.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{companyData?.name}</p>
                            {jobData.location && (
                                <p className="text-xs text-muted-foreground">{jobData.location}</p>
                            )}
                        </div>
                    </div>
                    <Badge variant={getStatusVariant(statusData)}>{statusData}</Badge>
                </div>
            </CardHeader>
            <CardContent className="grid gap-2">
                {skillsData.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {skillsData.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {skillsData.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{skillsData.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                            {dateValue 
                                ? (typeof dateValue === 'string' && dateValue.includes('/') 
                                    ? dateValue 
                                    : formatDistanceToNow(new Date(dateValue), { addSuffix: true }))
                                : 'Recently'
                            }
                        </span>
                    </div>
                    {matchScore && (
                        <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4" />
                            <b>{matchScore}% Match</b>
                        </div>
                    )}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => onViewDetails && onViewDetails(data)}
                    asChild={!onViewDetails}
                >
                    {onViewDetails ? (
                        "View Details"
                    ) : (
                        <Link href={`/dashboard/applications/${data.id}`}>
                            View Application
                        </Link>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
};

const Applications = ({ applications }) => {
    if (!applications?.length) {
        return (
            <div>
              <TypographyH2 className="text-xl mb-4">My Applications</TypographyH2>
              <div className="text-center py-16 border rounded-lg">
                <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </div>
          );
    }
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <TypographyH2 className="text-xl">My Applications</TypographyH2>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/dashboard/applications">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:.cols-3 gap-4">
          {applications.map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      </div>
    );
};

/**
 * Job card component for displaying job listings
 */
export const JobCard = ({ job, onApplyClick, isLoading, compact }) => {
    // Helper function to format salary
    const formatSalary = (salary) => {
        if (!salary) return 'Salary not specified';
        
        // If it's just a number, format it as currency
        if (typeof salary === 'number' || !isNaN(salary)) {
            return `$${parseInt(salary).toLocaleString()}`;
        }
        
        // If it already contains $ or formatting, return as is
        if (salary.includes('$') || salary.includes('-')) {
            return salary;
        }
        
        // Otherwise, add $ prefix
        return `$${salary}`;
    };

    if (isLoading) {
        return (
            <Card className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="p-4 transition-shadow hover:shadow-md">
            <div className={`flex flex-col sm:flex-row justify-between items-start gap-4 ${compact ? 'sm:items-center' : ''}`}>
                <div className="flex-1">
                    <TypographyH3 className="text-lg font-semibold">{job.title || 'Job Title'}</TypographyH3>
                    <TypographyP className="text-sm text-muted-foreground">
                        {job.company || 'Company'} &middot; {job.location || 'Location'}
                    </TypographyP>

                    <div className={`flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground ${compact ? 'hidden sm:flex' : ''}`}>
                        {job.type && (
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" />
                                <span>{job.type}</span>
                            </div>
                        )}
                        {job.experience && (
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="h-4 w-4" />
                                <span>{job.experience}</span>
                            </div>
                        )}
                        {job.postDate && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{job.postDate}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <div className="text-right">
                        <TypographyP className="font-semibold text-lg">{formatSalary(job.salary)}</TypographyP>
                        <TypographyP className="text-xs text-muted-foreground">per year</TypographyP>
                    </div>
                    <Button onClick={onApplyClick} className="w-full sm:w-auto">Apply Now</Button>
                </div>
            </div>

            {!compact && job.description && (
                <div className="mt-4 pt-4 border-t">
                    <TypographyP className="text-sm text-muted-foreground line-clamp-3">
                        {job.description}
                    </TypographyP>
                </div>
            )}
        </Card>
    );
};

/**
 * Candidate card component for displaying candidate profiles
 */
const CandidateCard = ({ 
  candidate, 
  profileUrl, 
  className, 
  ...props 
}) => {
  const { id, name, position, location, experience, skills, avatar } = candidate;
  const matchScore = candidate.metadata?.matchScore;
  
  return (
    <Card key={id} className={cn("p-5 hover:shadow-md transition-shadow", className)} {...props}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {avatar ? (
              <Image src={avatar} alt={name} width={40} height={40} />
            ) : (
              <User className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <TypographyH3 className="font-medium">{name}</TypographyH3>
            <TypographyP className="text-sm text-muted-foreground">{position}</TypographyP>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mb-3">
        <TypographyP className="text-sm flex items-center gap-1">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          {experience} experience
        </TypographyP>
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, i) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {matchScore && <MatchScore score={matchScore} />}
        <Button variant="primary" size="sm" asChild>
          <Link href={profileUrl || `/candidates/${id}`}>
            View Profile
          </Link>
        </Button>
      </div>
    </Card>
  );
};

/**
 * Resume card component for displaying uploaded resume files
 */
const ResumeCard = ({ resume, onDelete, onReview, isReviewing }) => {
  const fileTypeIcon = resume.file_type === 'pdf' ? (
    <FileText className="h-6 w-6 text-red-500" />
  ) : (
    <FileText className="h-6 w-6 text-blue-500" />
  );
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const hasBeenReviewed = resume.feedback !== null;
  
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 rounded-md">
          {fileTypeIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <TypographyH3 className="text-base font-medium truncate" title={resume.file_name}>
            {resume.file_name}
          </TypographyH3>
          <div className="flex items-center gap-2 mt-1">
            <TypographySmall className="text-muted-foreground">
              Uploaded {formatDate(resume.uploaded_at)}
            </TypographySmall>
            <span className="text-muted-foreground">•</span>
            <TypographySmall className="text-muted-foreground">
              {(resume.file_size / 1000).toFixed(0)} KB
            </TypographySmall>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => window.open(resume.file_url, '_blank')}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-destructive hover:text-destructive" 
            onClick={() => onDelete(resume.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div>
          {hasBeenReviewed ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Reviewed
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Not Reviewed
            </Badge>
          )}
        </div>
        
        <Button 
          size="sm"
          variant={hasBeenReviewed ? "outline" : "default"}
          onClick={() => onReview(resume)}
          disabled={isReviewing}
        >
          {isReviewing ? 'Analyzing...' : (hasBeenReviewed ? 'View Feedback' : 'Get AI Feedback')}
        </Button>
      </div>
    </Card>
  );
};

export { PrimaryCardLarge, PrimaryCardMedium, PrimaryCardSmall, StatsCard, ApplicationCard, Applications, CandidateCard, StatusBadge, MatchScore, ResumeCard }; 