"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CandidateDashboard } from '@/components/dashboard/candidate-dashboard';
import { RecruiterDashboard } from '@/components/dashboard/recruiter-dashboard';
import { getUserProfile, getRecruiterDashboardData, getCandidateDashboardData } from '@/utils/supabase/db/queries';

const DashboardLoading = () => (
  <div className="p-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3"><Skeleton className="h-96 w-full" /></div>
      <div className="lg:col-span-2"><Skeleton className="h-96 w-full" /></div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userProfile = await getUserProfile();
        setProfile(userProfile);

        if (userProfile?.user_type === 'recruiter') {
          const recruiterData = await getRecruiterDashboardData();
          setDashboardData(recruiterData);
        } else if (userProfile?.user_type === 'applicant') {
          const candidateData = await getCandidateDashboardData();
          setDashboardData(candidateData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      {profile?.user_type === 'recruiter' ? (
        <RecruiterDashboard 
          user={profile}
          stats={dashboardData?.stats} 
          jobs={dashboardData?.jobs} 
          applicants={dashboardData?.applicants} 
        />
      ) : (
        <CandidateDashboard 
          user={profile}
          stats={dashboardData?.stats} 
          applications={dashboardData?.applications}
          jobs={dashboardData?.jobs}
        />
      )}
    </div>
  );
} 