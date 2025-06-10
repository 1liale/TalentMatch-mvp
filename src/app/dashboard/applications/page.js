"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TypographyH1,
  TypographyH2, 
  TypographyP 
} from "@/components/ui/typography";
import { toast } from "sonner";
import { GridIcon, ListIcon, SearchIcon, Briefcase, Filter } from "lucide-react";

import { PageHeader } from "@/components/base/page-header";
import { StatusBadge } from "@/components/base/status-badge";
import KanbanBoard from "@/components/applications/kanban-board";
import ApplicationsTable from "@/components/applications/applications-table";
import { JobApplicationModal } from "@/components/jobs/application-modal";

const kanbanColumns = [
  { id: "pending", title: "Application Sent" },
  { id: "reviewing", title: "In Review" },
  { id: "interview", title: "Interviewing" },
  { id: "completed", title: "Final Decision" }, // Groups 'offer', 'approved' and 'rejected'
];

// Unified ApplicationCard for the candidate's application view.
const ApplicationCard = ({ item, onClick }) => {
  return (
    <Card 
      className="p-3 bg-card shadow-sm hover:shadow-md transition-shadow mb-3 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.company_logo} alt={item.company_name} />
              <AvatarFallback>{item.company_name?.charAt(0) || 'C'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {item.job_title || 'Job Title'}
              </p>
              <span className="text-xs text-muted-foreground truncate block">
                {item.company_name || 'Company Name'}
              </span>
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <div className="text-xs text-muted-foreground">
          {item.job_location || 'Location'}
        </div>
        {item.match_score && (
          <div className="text-xs font-medium text-primary">
            Match Score: {item.match_score}%
          </div>
        )}
      </div>
    </Card>
  );
};

export default function ApplicationsPage() {
  const [view, setView] = useState("kanban");
  const [allApplications, setAllApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to view your applications.");
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            jobs:job_id (
              id,
              title,
              company,
              location,
              description,
              employment_type,
              job_seniority,
              post_date,
              salary
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching applications:', error);
          toast.error('Failed to load your applications.');
          return;
        }
        
        // Transform data to match unified format
        const transformedApplications = (data || []).map(app => ({
          ...app,
          // Unified field names for consistent rendering
          name: user.email, // For candidates, this would be their name
          title: "Applicant", // Role title
          job_title: app.jobs?.title,
          company_name: app.jobs?.company,
          job_location: app.jobs?.location,
          company_logo: null, // Could be added later
          appliedDate: app.created_at,
          // Keep original nested structure for backwards compatibility
          jobs: app.jobs
        }));
        
        setAllApplications(transformedApplications);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('An unexpected error occurred while fetching applications.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [supabase]);

  // Candidate cannot change their application status, so this is a no-op.
  const handleDragEnd = () => {
    toast.info("Application status is managed by the recruiter.");
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const filteredApplications = allApplications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .filter(app => {
        if (!searchTerm) return true;
        const lowercasedSearch = searchTerm.toLowerCase();
        return (
            app.job_title?.toLowerCase().includes(lowercasedSearch) ||
            app.company_name?.toLowerCase().includes(lowercasedSearch) ||
            app.job_location?.toLowerCase().includes(lowercasedSearch)
        );
    });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <TypographyP>Loading your applications...</TypographyP>
        </div>
      );
    }
    
    return view === "kanban" ? (
      <KanbanBoard 
        columns={kanbanColumns}
        items={filteredApplications}
        onDragEnd={handleDragEnd}
        renderItem={(item) => (
          <ApplicationCard item={item} onClick={() => handleViewDetails(item)} />
        )}
      />
    ) : (
      <ApplicationsTable 
        applications={filteredApplications}
        onRowClick={handleViewDetails}
      />
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="My Applications"
        description="Track the status of all your job applications."
      >
        <div className="flex items-center space-x-1 bg-background border rounded-md p-1">
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
            placeholder="Search by title, company..." 
            className="w-[200px] md:w-[250px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Application Sent</SelectItem>
            <SelectItem value="reviewing">In Review</SelectItem>
            <SelectItem value="interview">Interviewing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredApplications.length} of {allApplications.length} total applications.
      </div>

      {renderContent()}

      {selectedApplication && (
        <JobApplicationModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
          isReadOnly={true}
          applicationData={selectedApplication}
          job={selectedApplication.jobs}
        />
      )}
    </div>
  );
} 