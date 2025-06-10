"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  TypographyH1, 
  TypographyH2,
  TypographyP 
} from "@/components/ui/typography";
import { JobCard } from "@/components/base/card";
import { useAuth } from "@/context/auth-context";
import { JobApplicationProvider, useJobApplication } from "@/context/job-application-context";
import { getJobs, getUserResumes } from "@/utils/supabase/db/queries";
import { 
  JobFilterPanel, 
  ActiveFilters, 
  SortSelector,
} from "@/components/jobs/search-filter.jsx";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { calculateTimeAgo } from "@/utils/date";
import { JobApplicationModal } from "@/components/jobs/application-modal";
import { toast } from "sonner";


function JobsPageContent() {
  const { user } = useAuth();
  const { 
    openApplicationModal, 
    closeApplicationModal, 
    isApplicationModalOpen,
    selectedJob,
    resumes,
  } = useJobApplication();
  
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local state management (no query params)
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedResumeId, setSelectedResumeId] = useState('none');

  const filters = useMemo(() => ({
    jobType: jobTypes,
    experienceLevel: experienceLevels,
    location: locations,
  }), [jobTypes, experienceLevels, locations]);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (value) => setSortBy(value);
  
  const handleResumeSelect = (resumeId) => {
    setSelectedResumeId(resumeId);
  };

  const toggleFilter = (type, value) => {
    if (type === 'jobType') {
      setJobTypes(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else if (type === 'experienceLevel') {
      setExperienceLevels(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else if (type === 'location') {
      setLocations(prev => 
        prev.includes(value) 
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setJobTypes([]);
    setExperienceLevels([]);
    setLocations([]);
    setSortBy("newest");
    setSelectedResumeId('none');
  };

  // Fetch initial jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const fetchedJobs = await getJobs({ sortBy: 'newest', limit: 200 });
        setAllJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load job data.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Effect to handle resume-based similarity search
  useEffect(() => {
    const findSimilarJobs = async () => {
      if (selectedResumeId === 'none') return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/jobs/find-similar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId: selectedResumeId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch similar jobs');
        }

        const similarJobs = await response.json();
        setAllJobs(similarJobs); // Replace current jobs with matched ones
        toast.success(`Found ${similarJobs.length} jobs matching your resume!`);

      } catch (error) {
        console.error("Error fetching similar jobs:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    findSimilarJobs();
  }, [selectedResumeId]);

  // Filter and sort jobs based on state
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...allJobs];

    // Apply field transformations to ALL jobs regardless of source
    result = result.map(job => ({
      ...job,
      type: job.employment_type,
      experience: job.job_seniority,
      postDate: calculateTimeAgo(job.created_at)
    }));

    // If resume matching is active, return the transformed matched jobs without additional filtering
    if (selectedResumeId !== 'none') {
      return result;
    }

    // Apply other filters only when not using resume matching
    if (searchTerm) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filters.jobType.length > 0) {
      result = result.filter(job => filters.jobType.includes(job.employment_type));
    }
    if (filters.experienceLevel.length > 0) {
      result = result.filter(job => filters.experienceLevel.includes(job.job_seniority));
    }
    if (filters.location.length > 0) {
      result = result.filter(job => filters.location.some(l => job.location.toLowerCase().includes(l.toLowerCase())));
    }

    // Helper function to extract numeric salary for sorting
    const extractSalaryNumber = (salary) => {
      if (!salary) return 0;
      // Extract numbers from salary string (e.g., "$140,000 - $180,000" -> 140000)
      const numbers = salary.toString().match(/\d+/g);
      if (numbers && numbers.length > 0) {
        // Use the first number (minimum salary) for sorting
        return parseInt(numbers[0].replace(/,/g, ''));
      }
      return 0;
    };

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'salary_high') {
      result.sort((a, b) => extractSalaryNumber(b.salary) - extractSalaryNumber(a.salary));
    } else if (sortBy === 'salary_low') {
      result.sort((a, b) => extractSalaryNumber(a.salary) - extractSalaryNumber(b.salary));
    }

    return result;
  }, [allJobs, searchTerm, filters, sortBy, selectedResumeId]);
  
  const activeFilterCount = filters.jobType.length + filters.experienceLevel.length + filters.location.length + (selectedResumeId !== 'none' ? 1 : 0);

  return (
    <>
      <div className="flex flex-col max-w-7xl mx-auto gap-4 md:gap-6 p-4 md:p-6">
        <div className="relative w-full max-w-5xl mx-auto mb-2 md:mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search jobs by title, company, or keyword" 
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="hidden md:block md:w-1/4 space-y-6">
              <JobFilterPanel 
                filters={filters}
                toggleFilter={toggleFilter}
                clearAllFilters={clearAllFilters}
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                setSelectedResumeId={handleResumeSelect}
              />
          </div>
          
          <div className="w-full md:w-3/4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" size="icon" className="relative">
                      <Menu className="h-5 w-5" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] p-4 overflow-y-auto">
                    <SheetHeader className="mb-4">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <JobFilterPanel 
                        filters={filters}
                        toggleFilter={toggleFilter}
                        clearAllFilters={() => {
                          clearAllFilters();
                          setIsMobileMenuOpen(false);
                        }}
                        resumes={resumes}
                        selectedResumeId={selectedResumeId}
                        setSelectedResumeId={handleResumeSelect}
                    />
                      <SheetClose asChild className="mt-4 w-full">
                        <Button variant="outline">Done</Button>
                      </SheetClose>
                  </SheetContent>
                </Sheet>
                
                <div>
                  <TypographyH1 className="text-lg md:text-xl font-bold">
                    {loading ? "Loading Jobs..." : `Showing: ${filteredAndSortedJobs.length} Jobs`}
                  </TypographyH1>
                </div>
              </div>
              
              <SortSelector sortBy={sortBy} setSortBy={handleSortChange} />
            </div>
            
            <div className="mb-4 md:mb-6">
              <ActiveFilters 
                filters={filters}
                toggleFilter={toggleFilter}
                clearAllFilters={clearAllFilters}
                selectedResumeId={selectedResumeId}
                resumeName={resumes.find(r => r.id.toString() === selectedResumeId)?.file_name}
                clearResumeFilter={() => handleResumeSelect('none')}
              />
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {[...Array(5)].map((_, i) => <JobCard key={i} isLoading={true} />)}
              </div>
            ) : filteredAndSortedJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {filteredAndSortedJobs.map(job => {
                  const formattedJob = { 
                    ...job, 
                    type: job.employment_type,
                    experience: job.job_seniority,
                    postDate: calculateTimeAgo(job.created_at)
                  };
                  
                  return (
                    <JobCard 
                      key={job.id} 
                      job={formattedJob}
                      onApplyClick={() => openApplicationModal(formattedJob)}
                      compact={true}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 border rounded-lg bg-card">
                <TypographyH2 className="text-xl md:text-2xl mb-2">No jobs found</TypographyH2>
                <TypographyP className="text-muted-foreground mb-4 md:mb-6">
                  Try adjusting your search or filters to find more opportunities
                </TypographyP>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedJob && user && (
        <JobApplicationModal 
          job={selectedJob}
          open={isApplicationModalOpen}
          onOpenChange={closeApplicationModal}
          resumes={resumes}
          userId={user.id}
        />
      )}
    </>
  );
}


export default function JobsPage() {
  return (
    <JobApplicationProvider>
      <JobsPageContent />
    </JobApplicationProvider>
  );
} 