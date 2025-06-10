import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// This function handles the API request to find jobs similar to a resume.
export async function POST(req) {
  try {
    const supabase = await createClient();
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // First, get the embedding of the selected resume.
    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .select('embedding')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resumeData || !resumeData.embedding) {
      console.error('Error fetching resume embedding:', resumeError);
      return NextResponse.json({ error: 'Could not find resume or its embedding.' }, { status: 404 });
    }

    // Now, call the Supabase RPC to find matching jobs.
    // Assumes you have a function `match_jobs(embedding, match_threshold, match_count)` in your database.
    const { data: jobs, error: jobsError } = await supabase.rpc('match_jobs', {
      query_embedding: resumeData.embedding,
      match_threshold: 0.15, // Adjust this threshold as needed.
      match_count: 20, // Limit the number of returned jobs.
    });

    if (jobsError) {
      console.error('Error from match_jobs RPC:', jobsError);
      return NextResponse.json({ error: 'Failed to find similar jobs.' }, { status: 500 });
    }

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 