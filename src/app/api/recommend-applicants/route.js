import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { CohereEmbeddings, CohereRerank } from '@langchain/cohere';

/**
 * POST /api/recommend-applicants
 * 
 * Implements two-stage candidate ranking:
 * Stage 1: Vector similarity search in Supabase (pgvector) on user_profiles
 * Stage 2: Cohere Rerank for high-accuracy relevance scoring
 */
export async function POST(request) {
  try {
    const { query, jobId, conversationHistory = [] } = await request.json();

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!process.env.COHERE_API_KEY) {
      return NextResponse.json(
        { error: 'Cohere API key not configured.' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: 'embed-english-v3.0',
    });

    const rerank = new CohereRerank({
      apiKey: process.env.COHERE_API_KEY,
      model: 'rerank-english-v3.0',
    });

    // Build enhanced query from conversation history and job context
    let enhancedQuery = query;
    if (conversationHistory.length > 0) {
      const context = conversationHistory
        .slice(-3)
        .map(h => `${h.role}: ${h.content}`)
        .join('\n');
      enhancedQuery = `Previous context:\n${context}\n\nCurrent request: ${query}`;
    }

    if (jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('title, description, required_skills')
        .eq('id', jobId)
        .single();
      if (job) {
        const jobContext = `Job Context - Title: ${job.title}, Description: ${job.description}, Skills: ${job.required_skills.join(', ')}\n\n`;
        enhancedQuery = jobContext + enhancedQuery;
      }
    }

    // Stage 1: Candidate retrieval
    const initialPoolSize = 50;
    let candidates = [];
    let stage1Method = 'fallback';

    try {
      const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName: 'user_profiles',
        filter: { user_type: 'applicant' },
        queryName: 'match_user_profiles',
      });

      const vectorResults = await vectorStore.similaritySearch(enhancedQuery, initialPoolSize);
      
      if (vectorResults.length > 0) {
        const applicantIds = vectorResults.map(result => result.metadata?.id).filter(Boolean);
        const { data: vectorCandidates, error: vectorError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', applicantIds);
          
        if (!vectorError && vectorCandidates?.length > 0) {
          candidates = vectorCandidates;
          stage1Method = 'vector_search';
        }
      }
    } catch (vectorError) {
      console.warn('Vector search failed, using fallback:', vectorError.message);
    }

    if (candidates.length === 0) {
      const { data: allApplicants, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_type', 'applicant')
        .limit(initialPoolSize);

      if (fetchError) throw new Error(`Failed to fetch candidates: ${fetchError.message}`);
      if (!allApplicants || allApplicants.length === 0) {
        return NextResponse.json({ candidates: [], conversationHistory: [...conversationHistory, { role: 'user', content: query }] });
      }
      candidates = allApplicants;
      stage1Method = 'full_scan';
    }

    // Enhance candidates with resume data
    const candidateIds = candidates.map(c => c.id);
    const { data: resumes } = await supabase
      .from('resumes')
      .select('user_id, feedback')
      .in('user_id', candidateIds)
      .order('uploaded_at', { ascending: false });

    const resumeMap = new Map();
    if (resumes) {
      for (const resume of resumes) {
        if (!resumeMap.has(resume.user_id)) {
          resumeMap.set(resume.user_id, resume.feedback?.summary || '');
        }
      }
    }

    // Stage 2: Cohere Rerank for high-accuracy relevance scoring
    const documentsToRerank = candidates.map(candidate => {
      const resumeSummary = resumeMap.get(candidate.id) || 'No resume summary available.';
      const pageContent = `
        Name: ${candidate.full_name}
        Location: ${candidate.location || 'N/A'}
        Availability: ${candidate.availability_status || 'N/A'}
        Title: ${candidate.job_title || 'N/A'}
        Experience Level: ${candidate.experience_level || 'N/A'}
        Bio: ${candidate.bio || ''}
        Skills: ${candidate.skills ? candidate.skills.join(', ') : 'N/A'}
        Resume Summary: ${resumeSummary}
      `.trim();
      return { pageContent, metadata: { id: candidate.id } };
    });

    let rankedCandidates = [];
    let stage2Method = 'rerank';

    try {
      const rerankedResults = await rerank.compressDocuments(documentsToRerank, enhancedQuery);
      
      const filteredResults = rerankedResults.filter(
        (result) => result.metadata.relevanceScore >= 0.005
      );

      rankedCandidates = filteredResults.map(result => {
        const candidate = candidates.find(c => c.id === result.metadata.id);
        const resumeSummary = resumeMap.get(candidate.id) || candidate.bio || '';
        
        return {
          id: candidate.id,
          profile: candidate,
          summary: resumeSummary,
          skills: candidate.skills || [],
          relevanceScore: result.metadata.relevanceScore,
        };
      });
      
    } catch (rerankError) {
      console.error('Reranking failed, using Stage 1 results as fallback:', rerankError);
      stage2Method = 'fallback_no_rerank';
      rankedCandidates = candidates.slice(0, 12).map((candidate, index) => {
        const resumeSummary = resumeMap.get(candidate.id) || candidate.bio;
        return {
          id: candidate.id,
          profile: candidate,
          summary: resumeSummary,
          skills: candidate.skills || [],
          relevanceScore: 0.5 - (index * 0.01), // Assign a dummy score
        };
      });
    }

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: query },
      { 
        role: 'assistant', 
        content: `Found ${rankedCandidates.length} candidates matching your criteria.` 
      }
    ];

    return NextResponse.json({
      candidates: rankedCandidates,
      conversationHistory: updatedHistory,
      pipeline: {
        stage1: `${stage1Method} (${candidates.length} candidates)`,
        stage2: `${stage2Method} (${rankedCandidates.length} ranked results)`
      }
    });

  } catch (error) {
    console.error('Error in recommend-applicants:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recommend-applicants
 * Get recent jobs for quick search suggestions
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { data: recentJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, industry, job_seniority')
      .eq('user_id', user.id) // Corrected from created_by
      .order('created_at', { ascending: false })
      .limit(5);

    if (jobsError) throw jobsError;

    const suggestedPrompts = [
      "Find full-stack developers with React and Node.js experience",
      "Senior data scientists with Python and machine learning background",
      "Marketing professionals with digital marketing expertise",
      "UX/UI designers with e-commerce and mobile app experience",
    ];

    return NextResponse.json({
      recentJobs: recentJobs || [],
      suggestedPrompts
    });

  } catch (error) {
    console.error('Error in GET recommend-applicants:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 