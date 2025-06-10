import { NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";
import { createClient } from "@/utils/supabase/server";

// Initialize clients
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

/**
 * Get job recommendations based on search query, filters, and optional resume
 */
export async function POST(request) {
  try {
    const { searchTerm, filters, resumeId } = await request.json();
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Fetch jobs from Supabase
    let { data: jobs, error } = await supabase
      .from('jobs')
      .select('*');
    
    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }
    
    // Apply basic filters before reranking
    if (filters) {
      // Filter by job type (employment type)
      if (filters.jobType && filters.jobType.length > 0) {
        jobs = jobs.filter(job => filters.jobType.includes(job.employment_type));
      }
      
      // Filter by experience level
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        jobs = jobs.filter(job => filters.experienceLevel.includes(job.experience_level));
      }
      
      // Filter by location
      if (filters.location && filters.location.length > 0) {
        jobs = jobs.filter(job => 
          filters.location.some(loc => job.location.includes(loc) || 
          (loc === "Remote" && job.work_arrangement.includes("Remote")))
        );
      }
    }
    
    // Get user skills from resume if resumeId is provided
    let userSkills = [];
    if (resumeId) {
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('feedback')
        .eq('id', resumeId)
        .single();
      
      if (resumeError) {
        console.error("Error fetching resume:", resumeError);
      } else if (resume && resume.feedback && resume.feedback.skills) {
        userSkills = resume.feedback.skills;
      }
    }
    
    // Build query for reranking
    let query = searchTerm || "";
    
    // Add user skills to query for better matching
    if (userSkills.length > 0) {
      query += " " + userSkills.join(" ");
    }
    
    // If no query or filters, return jobs sorted by post date
    if (!query.trim() && (!filters || Object.keys(filters).every(key => 
      !filters[key] || (Array.isArray(filters[key]) && filters[key].length === 0)
    ))) {
      // Sort by post date (newest first)
      return NextResponse.json({
        jobs: jobs.sort((a, b) => new Date(b.post_date) - new Date(a.post_date)).slice(0, 10),
        matchScores: jobs.map(() => Math.floor(Math.random() * 20) + 80) // Random scores between 80-100
      });
    }
    
    // Prepare documents for reranking
    const documents = jobs.map(job => {
      return {
        text: `${job.title} ${job.company} ${job.location} ${job.description} ${job.required_skills.join(" ")}`,
        id: job.id.toString()
      };
    });
    
    // Skip reranking if no documents
    if (documents.length === 0) {
      return NextResponse.json({
        jobs: [],
        matchScores: []
      });
    }
    
    // Rerank jobs based on query
    const rerank = await cohere.rerank({
      model: "rerank-english-v2.0",
      query: query,
      documents: documents,
      topN: 10,
      returnDocuments: true
    });
    
    // Get the results
    const results = rerank.results || [];
    
    // Map results to jobs with relavance scores
    const rankedJobs = results.map(result => {
      const jobId = parseInt(result.document.id);
      const job = jobs.find(j => j.id === jobId);
      return job;
    }).filter(Boolean);
    
    // Calculate match scores (0-100) based on relevance
    const matchScores = results.map(result => 
      Math.floor(result.relevanceScore * 100)
    );
    
    return NextResponse.json({
      jobs: rankedJobs,
      matchScores: matchScores
    });
    
  } catch (error) {
    console.error("Error processing job recommendations:", error);
    return NextResponse.json(
      { error: "Failed to process job recommendations: " + error.message },
      { status: 500 }
    );
  }
} 