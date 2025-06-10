import { CohereClient } from 'cohere-ai';

const apiKey = process.env.COHERE_API_KEY;

if (!apiKey) {
  throw new Error('Missing COHERE_API_KEY environment variable');
}

export const cohere = new CohereClient({ token: apiKey });

/**
 * Creates labeled text from object properties
 */
function formatLabelledText(obj, labels) {
  return Object.entries(labels)
    .map(([key, label]) => {
      const val = obj?.[key];
      if (!val || (Array.isArray(val) && val.length === 0)) return null;
      
      return Array.isArray(val)
        ? `${label}: ${val.join(', ')}`
        : `${label}: ${val}`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Generate embeddings using Cohere's API
 */
export async function embedText(text, inputType = 'search_document', opts = {}) {
  const texts = Array.isArray(text) ? text : [text];

  try {
    const { embeddings } = await cohere.embed({
      texts,
      model: 'embed-english-v3.0',
      inputType,
      ...opts,
    });

    return Array.isArray(text) ? embeddings : embeddings[0];
  } catch (err) {
    console.error('Error generating embedding:', err);
    throw err;
  }
}

/**
 * Generate embeddings for a resume file
 */
export async function generateResumeEmbedding(fileUrl) {
  try {
    const res = await fetch(fileUrl);
    const text = await res.text();  // TODO: Use PDF extraction if needed
    return embedText(text);
  } catch (err) {
    console.error('Error generating resume embedding:', err);
    throw err;
  }
}

/**
 * Generate embeddings for job data
 */
const jobLabels = {
  title:           'TITLE',
  company:         'COMPANY',
  location:        'LOCATION',
  workArrangement: 'WORK_ARRANGEMENT',
  salary:          'SALARY',
  experienceLevel: 'EXPERIENCE_LEVEL',
  employmentType:  'EMPLOYMENT_TYPE',
  description:     'DESCRIPTION',
  requiredSkills:  'SKILLS',
};

export function generateJobEmbedding(job) {
  const text = formatLabelledText(job, jobLabels);
  return embedText(text);
}

/**
 * Generate embeddings for applicant data
 */
const applicantLabels = {
  fullName:          'FULL_NAME',
  jobTitle:          'JOB_TITLE',
  bio:               'BIO',
  skills:            'SKILLS',
  experienceLevel:   'EXPERIENCE_LEVEL',
  yearsOfExperience: 'YEARS_EXPERIENCE',
  currentEmployer:   'CURRENT_EMPLOYER',
  salaryExpectation: 'SALARY_EXPECTATION',
  remotePreference:  'REMOTE_PREF',
  workAuthorization: 'WORK_AUTH',
};

export function generateApplicantEmbedding(applicant) {
  const flat = {
    ...applicant,
    ...applicant.education,  // Flatten education fields
  };
  
  const text = formatLabelledText(flat, {
    ...applicantLabels,
    level:       'EDU_LEVEL',
    institution: 'EDU_INSTITUTION',
    field:       'EDU_FIELD',
  });

  return embedText(text);
}

/**
 * Process resumes from Supabase and generate embeddings
 * @param {Object} supabase - The Supabase client instance
 * @returns {Promise<void>}
 */
export async function processResumesWithEmbeddings(supabase) {
  try {
    // Get all resumes without embeddings
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .is('embedding', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${resumes.length} resumes without embeddings`);
    
    // Process each resume
    for (const resume of resumes) {
      try {
        console.log(`Processing resume: ${resume.file_name}`);
        
        // Generate embedding for the resume file
        const embedding = await generateResumeEmbedding(resume.file_url);
        console.log(`Generated embedding for resume: ${resume.file_name} (${embedding.length} dimensions)`);
        
        // Update the resume with the embedding
        const { error: updateError } = await supabase
          .from('resumes')
          .update({ embedding })
          .eq('id', resume.id);
        
        if (updateError) {
          console.error(`Error updating resume ${resume.id}:`, updateError);
        } else {
          console.log(`Successfully updated resume ${resume.id} with embedding`);
        }
      } catch (resumeError) {
        console.error(`Error processing resume ${resume.id}:`, resumeError);
      }
    }
    
    console.log('Resume embedding processing completed');
  } catch (err) {
    console.error('Error processing resumes:', err);
    throw err;
  }
} 