import Link from "next/link";
import { RecruiterBanner } from "@/components/dashboard/banner";
import { StatsCard } from "@/components/base/card";
import { Briefcase, FileText, Users, CheckCircle, ChevronRight } from "lucide-react";
import { TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const RecruiterStats = ({ stats }) => {
    if (!stats) return null;
    const statsList = [
        { label: "Active Jobs", value: stats.activeJobs, icon: <Briefcase className="h-5 w-5 text-primary" /> },
        { label: "Total Applications", value: stats.totalApplications, icon: <FileText className="h-5 w-5 text-primary" /> },
        { label: "New Applicants", value: stats.newApplicants, icon: <Users className="h-5 w-5 text-primary" /> },
        { label: "Positions Filled", value: stats.filledPositions, icon: <CheckCircle className="h-5 w-5 text-primary" /> },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsList.map((stat, index) => <StatsCard key={index} {...stat} />)}
        </div>
    );
};

const ActiveJobs = ({ jobs }) => {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Active Jobs</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/jobs">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
        {!jobs?.length ? (
            <div className="text-center py-16">
                <TypographyP className="text-muted-foreground">You have no active job postings.</TypographyP>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/jobs/create">Post a New Job</Link>
                </Button>
            </div>
        ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.slice(0, 5).map(job => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.location}</div>
                    </TableCell>
                    <TableCell><Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>{job.status || 'Active'}</Badge></TableCell>
                    <TableCell className="text-center font-medium">{job.applications?.[0]?.count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/applicants?jobId=${job.id}`}>View Applicants</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
        </CardContent>
      </Card>
    );
};

const RecentApplicants = ({ applicants }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Recent Applicants</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/applicants">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
            {!applicants?.length ? (
                    <div className="text-center py-20">
                        <TypographyP className="text-muted-foreground">No new applicants to review.</TypographyP>
                </div>
            ) : (
                    <Table>
                        <TableBody>
                            {applicants.slice(0, 5).map(app => {
                                const profile = app.profiles;
                                if (!profile) return null;
                                const initials = `${profile.full_name?.split(' ')[0][0] || ''}${profile.full_name?.split(' ')[1]?.[0] || ''}`
                                return (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{profile.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{profile.title || 'No title specified'}</div>
                                            </div>
                </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/applicants/${app.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
            )}
            </CardContent>
        </Card>
    );
};

export const RecruiterDashboard = ({ user, stats, jobs, applicants }) => {
    return (
      <div className="space-y-8">
        <RecruiterBanner user={user} />
        <RecruiterStats stats={stats} />
        <div className="grid grid-cols-1 gap-8">
                <ActiveJobs jobs={jobs} />
                <RecentApplicants applicants={applicants} />
  
        </div>
      </div>
    );
};
