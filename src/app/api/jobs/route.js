import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CohereClient } from "cohere-ai";

/**
 * GET /api/jobs - Retrieve job posts
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Optional query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';
    const userId = searchParams.get('userId'); // For filtering by employer
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if specified (for employer's own jobs)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs }, { status: 200 });

  } catch (error) {
    console.error('Error in jobs GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs - Create a new job post with embeddings
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      console.error('Supabase client is null/undefined');
      return NextResponse.json(
        { error: 'Failed to initialize Supabase client' },
        { status: 500 }
      );
    }
    
    // Check authentication - get user from session
    let user;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      user = authData?.user;
      
      if (authError) {
        console.error('Auth error:', authError);
        return NextResponse.json(
          { error: 'Authentication failed: ' + authError.message },
          { status: 401 }
        );
      }
      
      if (!user) {
        return NextResponse.json(
          { error: 'No authenticated user found. Please sign in.' },
          { status: 401 }
        );
      }
    } catch (authException) {
      console.error('Exception during auth:', authException);
      return NextResponse.json(
        { error: 'Authentication system error' },
        { status: 500 }
      );
    }

    // Parse request body
    const jobData = await request.json();

    // Validate required fields
    if (!jobData.title || !jobData.location || !jobData.description) {
      return NextResponse.json(
        { error: 'Title, location, and description are required' },
        { status: 400 }
      );
    }

    // Get user profile to validate and extract company info
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('employer_company_name, user_type, onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { error: 'Could not fetch user profile information' },
        { status: 500 }
      );
    }

    // Validate user permissions
    if (userProfile?.user_type !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can create job posts. Please update your profile.' },
        { status: 403 }
      );
    }

    if (!userProfile?.onboarding_completed) {
      return NextResponse.json(
        { error: 'Please complete your onboarding profile before creating job posts.' },
        { status: 403 }
      );
    }

    if (!userProfile?.employer_company_name) {
      return NextResponse.json(
        { error: 'Company name is required to create job posts. Please update your profile.' },
        { status: 403 }
      );
    }

    // Build formatted salary string from structured data
    let salaryString = '';
    if (jobData.salary_type === 'Range' && jobData.salary_min && jobData.salary_max) {
      salaryString = `$${jobData.salary_min} - $${jobData.salary_max} ${jobData.salary_period}`;
    } else if (jobData.salary_type === 'Fixed' && jobData.salary_max) {
      salaryString = `$${jobData.salary_max} ${jobData.salary_period}`;
    }

    // Create text content for embedding
    const embeddingText = [
      `Job Title: ${jobData.title}`,
      `Company: ${userProfile.employer_company_name}`,
      `Location: ${jobData.location}`,
      `Industry: ${jobData.industry || ''}`,
      `Work Preference: ${jobData.work_preference || ''}`,
      `Employment Type: ${jobData.employment_type || ''}`,
      `Job Seniority: ${jobData.job_seniority || ''}`,
      `Qualification Level: ${jobData.qualification_level || ''}`,
      `Security Clearance: ${jobData.security_clearance || ''}`,
      `Driving License Required: ${jobData.driving_license || ''}`,
      `Visa Sponsorship: ${jobData.visa_sponsorship || ''}`,
      `Salary: ${salaryString}`,
      `Description: ${jobData.description}`,
    ].filter(line => line.split(': ')[1]).join('\n');

    // Generate embedding using Cohere
    const cohere = new CohereClient({
        token: process.env.COHERE_API_KEY,
    });

    let jobEmbedding;
    try {
      const embeddingResult = await cohere.embed({
        texts: [embeddingText],
        model: "embed-english-v3.0",
        inputType: "search_document",
      });
      jobEmbedding = embeddingResult.embeddings[0];
    } catch (embeddingError) {
      console.error('Error generating embedding:', embeddingError);
      return NextResponse.json(
        { error: 'Failed to generate job embedding' },
        { status: 500 }
      );
    }

    // Prepare job data for database
    const newJob = {
      title: jobData.title,
      company: userProfile.employer_company_name,
      location: jobData.location,
      work_preference: jobData.work_preference,
      salary: salaryString, // Keep the formatted string for backward compatibility
      job_seniority: jobData.job_seniority,
      employment_type: jobData.employment_type,
      description: jobData.description,
      required_skills: Array.isArray(jobData.required_skills) ? jobData.required_skills : [],
      industry: jobData.industry,
      qualification_level: jobData.qualification_level,
      security_clearance: jobData.security_clearance,
      driving_license: jobData.driving_license,
      visa_sponsorship: jobData.visa_sponsorship,
      salary_type: jobData.salary_type,
      salary_min: jobData.salary_min ? parseInt(jobData.salary_min) : null,
      salary_max: jobData.salary_max ? parseInt(jobData.salary_max) : null,
      salary_period: jobData.salary_period,
      application_questions: Array.isArray(jobData.application_questions) 
        ? jobData.application_questions.filter(q => q && q.question) 
        : [],
      embedding: jobEmbedding,
      user_id: user.id,
      post_date: new Date().toISOString(),
      status: 'active',
    };

    // Insert job into database
    const { data: createdJob, error: insertError } = await supabase
      .from('jobs')
      .insert([newJob])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating job:", insertError);
      return NextResponse.json(
        { error: 'Failed to create job post' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Job created successfully',
        job: createdJob
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in job creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 