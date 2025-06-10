"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getRecruiterJobs } from "@/utils/supabase/db/queries";
import { Button } from "@/components/ui/button";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MoreHorizontal, PlusCircle, Briefcase, MapPin, Users, Calendar, ArrowRight, Eye, Edit, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return "default";
    case 'paused': return "secondary";
    case 'filled': return "outline";
    case 'draft': return "secondary";
    default: return "destructive";
  }
};

const JobDetailsSheet = ({ job, open, onOpenChange }) => {
  if (!job) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader className="flex-shrink-0 pb-6 pl-8 border-b">
          <SheetTitle className="text-2xl font-bold pr-8">{job.title}</SheetTitle>
          <SheetDescription className="text-base">
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <Badge variant={getStatusVariant(job.status)} className="capitalize">
                {job.status}
              </Badge>
            </div>
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6 px-8 space-y-8">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/dashboard/jobs/${job.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job Post
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/dashboard/applicants?jobId=${job.id}`}>
                <Users className="h-4 w-4 mr-2" />
                Applicants ({job.applications?.[0]?.count || 0})
              </Link>
            </Button>
          </div>

          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <TypographyP className="text-sm font-medium text-muted-foreground">Industry</TypographyP>
                  <TypographyP className="text-sm">{job.industry || 'Not specified'}</TypographyP>
                </div>
                <div className="space-y-1">
                  <TypographyP className="text-sm font-medium text-muted-foreground">Employment Type</TypographyP>
                  <TypographyP className="text-sm">{job.employment_type}</TypographyP>
                </div>
                <div className="space-y-1">
                  <TypographyP className="text-sm font-medium text-muted-foreground">Work Arrangement</TypographyP>
                  <TypographyP className="text-sm">{job.work_preference}</TypographyP>
                </div>
                <div className="space-y-1">
                  <TypographyP className="text-sm font-medium text-muted-foreground">Experience Level</TypographyP>
                  <TypographyP className="text-sm">{job.job_seniority}</TypographyP>
                </div>
                <div className="space-y-1">
                  <TypographyP className="text-sm font-medium text-muted-foreground">Salary</TypographyP>
                  <TypographyP className="text-sm font-medium">{job.salary || 'Not disclosed'}</TypographyP>
                </div>
                <div className="space-y-1">
                  <TypographyP className="text-sm font-medium text-muted-foreground">Posted Date</TypographyP>
                  <TypographyP className="text-sm">{format(new Date(job.created_at || job.post_date), "MMM d, yyyy")}</TypographyP>
                </div>
              </div>

              {(job.qualification_level && job.qualification_level !== 'None') && (
                <div className="pt-4 border-t">
                  <TypographyP className="text-sm font-medium text-muted-foreground mb-1">Minimum Qualification Required</TypographyP>
                  <Badge variant="secondary">{job.qualification_level}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <TypographyP className="text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </TypographyP>
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          {(job.security_clearance || job.driving_license || job.visa_sponsorship) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.security_clearance && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Security Clearance Required</Badge>
                  </div>
                )}
                {job.driving_license && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Driving License Required</Badge>
                  </div>
                )}
                {job.visa_sponsorship && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Visa Sponsorship Available</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Application Questions */}
          {job.application_questions && job.application_questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Questions</CardTitle>
                <TypographyP className="text-sm text-muted-foreground">
                  Candidates will be asked these questions when applying.
                </TypographyP>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {job.application_questions.map((q, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <TypographyP className="text-sm flex-1">{q.question}</TypographyP>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const EmptyState = () => (
    <div className="text-center py-16 border rounded-lg col-span-3">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
        <TypographyH2 className="mt-4 text-xl font-semibold">No Job Posts Yet</TypographyH2>
        <TypographyP className="text-muted-foreground mt-2 mb-6">
            It looks like you haven&apos;t created any job posts. Get started by posting your first one.
        </TypographyP>
        <Button asChild>
            <Link href="/dashboard/jobs/create">Post Your First Job</Link>
        </Button>
    </div>
);

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-9 gap-4">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-9 gap-4">
            {[...Array(9)].map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function JobPostsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getRecruiterJobs();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setSheetOpen(true);
  };

  if (loading) return <div className="p-4 md:p-6 space-y-6"><LoadingSkeleton /></div>;
  if (error) return <div className="p-4 md:p-6"><p className="text-destructive">Error: {error}</p></div>;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 md:p-6 border-b">
        <TypographyH2>Manage Jobs</TypographyH2>
        <Button asChild>
          <Link href="/dashboard/jobs/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Job
          </Link>
        </Button>
      </header>
      
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        {jobs.length === 0 ? (
          <EmptyState />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Job Listings</CardTitle>
              <TypographyP className="text-muted-foreground">
                Manage and track your job postings. Click on any row to view details.
              </TypographyP>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow 
                      key={job.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleJobSelect(job)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold">{job.title}</span>
                          {job.industry && (
                            <span className="text-xs text-muted-foreground">{job.industry}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{job.employment_type}</span>
                          <span className="text-xs text-muted-foreground">{job.work_preference}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary || 'Not disclosed'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(job.status)} className="capitalize">
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.applications?.[0]?.count || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(job.created_at || job.post_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJobSelect(job);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/dashboard/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <JobDetailsSheet 
        job={selectedJob} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </div>
  );
} 