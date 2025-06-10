"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TypographyP,
  TypographyH1,
  TypographyH2
} from "@/components/ui/typography";
import { toast } from "sonner";
import { GridIcon, ListIcon, SearchIcon, Briefcase } from "lucide-react";

import KanbanBoard from "@/components/applications/kanban-board";
import ApplicantsTable from "@/components/applications/applicants-table";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import ApplicantDetailModal from "@/components/applications/ApplicantDetailModal";
import { updateApplicationStatus } from "@/utils/supabase/db/actions";
import { PageHeader } from "@/components/base/page-header";

// Kanban columns for applicants view  
const kanbanColumns = [
  { id: "pending", title: "New Applicants" },
  { id: "reviewing", title: "In Review" },
  { id: "interview", title: "Interview" },
  { id: "completed", title: "Completed" }, // Groups 'offer', 'approved' and 'rejected'
];

export default function ApplicantsPage() {
  const [view, setView] = useState("kanban");
  const [allApplicants, setAllApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchJobsAndApplicants = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      // Fetch all jobs created by the user first
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`id, title`)
        .eq('user_id', user.id);

      console.log("jobsData", jobsData)
        
      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        toast.error("Failed to fetch your jobs. Applicants may not display correctly.");
        // Continue loading applicants even if jobs fail, they just won't be named
      }
      
      setJobs(jobsData || []);
      const jobIds = (jobsData || []).map(j => j.id);

      if (jobIds.length === 0) {
        setAllApplicants([]);
        setLoading(false);
        return;
      }
      
      // Fetch all applications for those jobs with standardized query structure
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          user_profiles:user_id (
            id,
            full_name,
            job_title,
            avatar_url,
            skills,
            location,
            experience_level
          ),
          jobs:job_id (
            id,
            title,
            company,
            location
          ),
          resumes:resume_id (
            file_url
          )
        `)
        .in('job_id', jobIds);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        toast.error("Failed to fetch applicants. Please try again.");
        setLoading(false);
        return;
      }
      
      // Transform data to match unified format for APPLICANT view (candidate-focused)
      const transformedApplicants = (applicationsData || []).map(app => ({
        ...app,
        // Candidate-focused fields (for showing candidate info)
        name: app.user_profiles?.full_name || 'N/A',
        title: app.user_profiles?.job_title || 'Job seeker',
        avatar: app.user_profiles?.avatar_url,
        tags: app.user_profiles?.skills || [],
        email: app.user_profiles?.email,
        location: app.user_profiles?.location,
        experience_level: app.user_profiles?.experience_level,
        // Job they applied for (don't use job_title to avoid confusion with applicant view detection)
        jobPosition: app.jobs?.title || 'Unknown Job',
        applied_job_title: app.jobs?.title, // Use different field name
        applied_company: app.jobs?.company,
        applied_location: app.jobs?.location,
        // Application-specific fields
        appliedDate: app.created_at,
        resumeUrl: app.resumes?.file_url,
        // Keep original nested structure for backwards compatibility
        profile: app.user_profiles,
        jobs: app.jobs,
        resume: app.resumes
      }));
      
      setAllApplicants(transformedApplicants);
      setLoading(false);
    };

    fetchJobsAndApplicants();
  }, [supabase]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    const newStatus = destination.droppableId;
    const applicantId = Number(draggableId);
    
    await handleStatusChange(applicantId, newStatus);
  };
  
  const handleStatusChange = async (applicantId, newStatus) => {
    const originalApplicants = [...allApplicants];
    const updatedApplicants = allApplicants.map(app => 
        app.id === applicantId ? { ...app, status: newStatus } : app
    );
    setAllApplicants(updatedApplicants);
    
    try {
      await updateApplicationStatus(applicantId, newStatus);
      toast.success(`Updated applicant status to ${newStatus}`);
    } catch (error) {
        console.error('Error updating status:', error);
        toast.error("Failed to update applicant status.");
        setAllApplicants(originalApplicants);
    }
  };

  const handleRowClick = (applicant) => {
    setSelectedApplicant(applicant);
  };

  const filteredApplicants = allApplicants
    .filter(app => selectedJobId === 'all' || String(app.job_id) === selectedJobId)
    .filter(app => 
      !searchTerm ||
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.title && app.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.user_profiles?.location && app.user_profiles.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <TypographyP>Loading applicants...</TypographyP>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <TypographyH2>No job listings found</TypographyH2>
            <TypographyP className="text-muted-foreground mt-2">
                Post a job to start receiving applications.
            </TypographyP>
            <Button className="mt-4">Post a New Job</Button>
        </Card>
      );
    }
    
    const showEmptyState = filteredApplicants.length === 0 && searchTerm;

    return (
      <>
        {view === 'kanban' ? (
          <KanbanBoard 
            columns={kanbanColumns}
            items={filteredApplicants}
            onDragEnd={handleDragEnd}
            onCardClick={handleRowClick}
          />
        ) : (
          <ApplicantsTable 
            data={filteredApplicants}
            onRowClick={handleRowClick}
            onStatusChange={handleStatusChange}
          />
        )}
        {showEmptyState && (
          <div className="text-center py-16">
            <TypographyP className="text-muted-foreground">
              No applicants found for your search term.
            </TypographyP>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="p-6">
      <PageHeader 
        title="Applicants"
        description="Track and manage candidates for all your job postings."
      >
          <div className="flex items-center space-x-2 bg-background border rounded-md p-1">
            <Button variant={view === "kanban" ? "default" : "ghost"} size="sm" className="h-9" onClick={() => setView("kanban")}>
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button variant={view === "list" ? "default" : "ghost"} size="sm" className="h-9" onClick={() => setView("list")}>
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, title..." 
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-[280px]">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={String(job.id)}>{job.title} ({job.id})</SelectItem>
              ))}
            </SelectContent>
          </Select>
      </PageHeader>
      
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredApplicants.length} of {allApplicants.length} total applicants.
      </div>

      {renderContent()}

      <ApplicantDetailModal 
        applicant={selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export function AllApplicantsPage() {
  return (
    <div className="p-6">
      <TypographyH1>All Applicants</TypographyH1>
      <p className="text-muted-foreground">This page is under construction.</p>
    </div>
  );
} 