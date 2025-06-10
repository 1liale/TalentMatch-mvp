import { createClient } from '@/utils/supabase/client';

/**
 * Get user profile details
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile() {
  try {
    // Create Supabase client
    const supabase = createClient();
    
    // Get user authentication data
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Get user profile directly
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch profile');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Check if user has completed onboarding
 * @returns {Promise<boolean>} Whether onboarding is completed
 */
export async function hasCompletedOnboarding() {
  try {
    // Create Supabase client
    const supabase = createClient();
    
    // Get user authentication data
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Check if onboarding is completed directly
    const { data, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" code
      console.error('Database error:', error);
      throw new Error('Failed to check onboarding status');
    }
    
    return !!(data?.onboarding_completed);
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw error;
  }
}

/**
 * Get all resumes for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} List of user's resumes
 */
export async function getUserResumes(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Create Supabase client
    const supabase = createClient();
    
    // Get user's resumes
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
      
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch resumes');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    throw error;
  }
}

/**
 * Get jobs from Supabase
 * @param {Object} options - Options for filtering jobs
 * @param {string} options.sortBy - Sort jobs by 'newest' or 'recommended'
 * @param {number} options.limit - Limit the number of jobs returned
 * @returns {Promise<Array>} List of jobs
 */
export async function getJobs(options = {}) {
  try {
    const { sortBy = 'newest', limit = 10 } = options;
    
    // Create Supabase client
    const supabase = createClient();
    
    // Build query
    let query = supabase
      .from('jobs')
      .select('*');
    
    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('post_date', { ascending: false });
    }
    
    // Apply limit
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch jobs');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

/**
 * Get required fields for job applications
 * @returns {Promise<Object>} Required fields configuration
 */
export async function getApplicationRequiredFields() {
  try {
    // Create Supabase client
    const supabase = createClient();
    
    // Query the configuration table or use hardcoded values
    // Note: In a real implementation, this might come from a settings/config table
    
    // For now, return hardcoded required fields
    return {
      required: {
        phone: true,
        resume: true,
        availability: true,
        experience: false, // Optional
        skills: false,     // Optional
        bio: false,        // Optional
        socialLinks: false // Optional
      }
    };
  } catch (error) {
    console.error('Error fetching application required fields:', error);
    throw error;
  }
}

/**
 * Get employer dashboard data, including stats, recent jobs, and recent applicants
 * @returns {Promise<Object>} An object containing stats, jobs, and applicants
 */
export async function getRecruiterDashboardData() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Auth error:', authError);
    throw new Error('User not authenticated');
  }

  try {
    const { data: employerJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('user_id', user.id);
    
    if (jobsError) throw jobsError;
    
    const employerJobIds = employerJobs.map(job => job.id);

    // If the employer has no jobs, return early
    if (employerJobIds.length === 0) {
      return {
        stats: { activeJobs: 0, totalApplications: 0, newApplicants: 0, filledPositions: 0 },
        jobs: [],
        applicants: []
      };
    }

    // Run all queries in parallel for efficiency
    const [
      { count: activeJobs, error: activeJobsError },
      { count: totalApplications, error: totalApplicationsError },
      { count: newApplicants, error: newApplicantsError },
      { count: filledPositions, error: filledPositionsError },
      { data: recentJobs, error: recentJobsError },
      { data: recentApplicants, error: recentApplicantsError }
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
      supabase.from('applications').select('*', { count: 'exact', head: true }).in('job_id', employerJobIds),
      supabase.from('applications').select('*', { count: 'exact', head: true }).in('job_id', employerJobIds).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'filled'),
      supabase.from('jobs').select('*, applications(count)').eq('user_id', user.id).eq('status', 'active').limit(3),
      supabase.from('applications').select('*, profiles:user_profiles(*)').in('job_id', employerJobIds).order('created_at', { ascending: false }).limit(5)
    ]);
      
    // Check for errors in any of the queries
    const errors = [activeJobsError, totalApplicationsError, newApplicantsError, filledPositionsError, recentJobsError, recentApplicantsError].filter(Boolean);
    if (errors.length > 0) {
      console.error('Errors fetching employer dashboard data:', errors);
      throw new Error('One or more dashboard queries failed.');
    }

    const stats = {
        activeJobs: activeJobs || 0,
        totalApplications: totalApplications || 0,
        newApplicants: newApplicants || 0,
        filledPositions: filledPositions || 0,
    };

    return { stats, jobs: recentJobs, applicants: recentApplicants };

  } catch (error) {
    console.error('Error fetching employer dashboard data:', error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
}

/**
 * Get candidate dashboard data, including stats and recent applications
 * @returns {Promise<Object>} An object containing stats and applications
 */
export async function getCandidateDashboardData() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const [
      { count: applicationsCount, error: acError },
      { count: interviewsCount, error: icError },
      { data: applications, error: applicationsError },
      { data: scores, error: scoresError },
      { data: recommendedJobs, error: recommendedJobsError }
    ] = await Promise.all([
      supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'interview'),
      supabase.from('applications').select('*, jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('applications').select('match_score').eq('user_id', user.id).not('match_score', 'is', null),
      supabase.from('jobs').select('*').limit(5).order('created_at', { ascending: false })
    ]);

    const errors = [acError, icError, applicationsError, scoresError, recommendedJobsError].filter(Boolean);
    if (errors.length > 0) {
      console.error('Errors fetching candidate dashboard data:', errors);
      throw new Error('One or more dashboard queries failed.');
    }

    const avgMatchScore = scores && scores.length > 0
      ? Math.round(scores.reduce((acc, curr) => acc + (curr.match_score || 0), 0) / scores.length)
      : 0;

    const stats = {
      applications: applicationsCount || 0,
      interviews: interviewsCount || 0,
      profileViews: 0, // No tracking table for this yet, setting to 0.
      matchScore: avgMatchScore,
    };

    const jobsWithDummyScores = recommendedJobs.map(job => ({ ...job, match_score: Math.floor(Math.random() * (99 - 70 + 1) + 70) }));

    return { stats, applications, jobs: jobsWithDummyScores };

  } catch (error) {
    console.error('Error fetching candidate dashboard data:', error);
    throw error;
  }
}

/**
 * Get all jobs for a specific recruiter
 * @returns {Promise<Array>} List of recruiter's jobs
 */
export async function getRecruiterJobs() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('user_id', user.id)
      .order('post_date', { ascending: false });

    if (error) {
      console.error('Error fetching recruiter jobs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    throw error;
  }
}

/**
 * Find talent/candidates based on filters.
 * @param {object} filters - The search filters
 * @param {string} filters.keywords - Keywords to search in name, title, bio
 * @param {string} filters.experience - Experience level
 * @param {string} filters.location - Location to search
 * @returns {Promise<Array>} List of candidate profiles
 */
export async function findTalent(filters = {}) {
  const supabase = createClient();
  const { keywords, experience, location } = filters;
  
  // Ensure user is authenticated to perform this action
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');

  try {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .eq('user_type', 'applicant');

    if (keywords) {
      // Search across multiple fields. Use `|` for OR logic.
      query = query.or(`full_name.ilike.%${keywords}%,job_title.ilike.%${keywords}%,bio.ilike.%${keywords}%`);
    }
    if (experience) {
      query = query.eq('experience_level', experience);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error finding talent:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in findTalent function:', error);
    throw error;
  }
} 