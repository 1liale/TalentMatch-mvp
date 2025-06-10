"use client";
import Link from "next/link";
import { CandidateBanner } from "@/components/dashboard/banner";
import { StatsCard } from "@/components/base/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, Users, Star, ChevronRight } from "lucide-react";
import { TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CandidateStats = ({ stats }) => {
    if (!stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    const statsList = [
        {
          label: "Applications",
          value: stats.applications,
          icon: <Briefcase className="h-5 w-5 text-primary" />,
        },
        {
          label: "Interviews",
          value: stats.interviews,
          icon: <Calendar className="h-5 w-5 text-primary" />,
        },
        {
          label: "Profile Views",
          value: stats.profileViews,
          icon: <Users className="h-5 w-5 text-primary" />,
        },
        {
          label: "Avg. Match Score",
          value: `${stats.matchScore}%`,
          icon: <Star className="h-5 w-5 text-primary" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, index) => (
            <StatsCard key={index} {...stat} />
        ))}
        </div>
    );
};

const ApplicationStatus = ({ applications }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Application Status</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/applications">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {!applications?.length ? (
                    <div className="text-center py-16">
                        <TypographyP className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</TypographyP>
                        <Button asChild className="mt-4">
                            <Link href="/jobs">Browse Jobs</Link>
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.slice(0, 5).map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="font-medium">{app.jobs.title}</div>
                                        <div className="text-sm text-muted-foreground">{app.jobs.location}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={['Interview', 'Offer'].includes(app.status) ? 'default' : 'secondary'}>
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/applications`}>View</Link>
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

const RecommendedJobs = ({ jobs }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Recommended Jobs</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/job-search">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {!jobs?.length ? (
                    <div className="text-center py-16">
                        <TypographyP className="text-muted-foreground">No recommended jobs right now.</TypographyP>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/profile">Update Profile</Link>
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead className="text-center">Match</TableHead>
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
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{`${job.match_score}%`}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/job-search`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

export const CandidateDashboard = ({ user, stats, applications, jobs }) => {
    return (
      <div className="space-y-8">
        <CandidateBanner user={user} />
        <CandidateStats stats={stats} />
        <div className="grid grid-cols-1 gap-8">
            <ApplicationStatus applications={applications} />
            <RecommendedJobs jobs={jobs} />
        </div>
      </div>
    );
};
