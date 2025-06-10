import { createClient } from '@supabase/supabase-js';
import { CohereEmbeddings } from '@langchain/cohere';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model: 'embed-english-v3.0',
});

async function generateEmbeddingsForApplicants() {
  try {
    console.log('🔍 Finding applicants without embeddings...');
    
    // Get applicants without embeddings
    const { data: applicants, error } = await supabase
      .from('applicants')
      .select('*')
      .is('embedding', null);
      
    if (error) {
      console.error('Error fetching applicants:', error);
      return;
    }

    if (!applicants || applicants.length === 0) {
      console.log('✅ All applicants already have embeddings!');
      return;
    }

    console.log(`📝 Found ${applicants.length} applicants without embeddings`);

    for (const applicant of applicants) {
      try {
        console.log(`Processing: ${applicant.first_name} ${applicant.last_name}`);
        
        // Create comprehensive text representation
        const textContent = `
Name: ${applicant.first_name} ${applicant.last_name}
Location: ${applicant.location || 'Not specified'}
Status: ${applicant.availability || 'Available'}
Job Title: ${applicant.job_title || 'Not specified'}
Experience Level: ${applicant.experience_level || 'Not specified'}
Years of Experience: ${applicant.years_of_experience || 'Not specified'}
Current Employer: ${applicant.current_employer || 'Not specified'}
Bio: ${applicant.bio || ''}
Skills: ${applicant.skills ? applicant.skills.join(', ') : 'Not specified'}
Education: ${typeof applicant.education === 'object' ? JSON.stringify(applicant.education) : applicant.education || 'Not specified'}
Remote Preference: ${applicant.remote_preference || 'Not specified'}
Work Authorization: ${applicant.work_authorization || 'Not specified'}
Salary Expectation: ${applicant.salary_expectation || 'Not specified'}
        `.trim();

        // Generate embedding
        const embeddingVector = await embeddings.embedQuery(textContent);
        
        // Update applicant with embedding
        const { error: updateError } = await supabase
          .from('applicants')
          .update({ 
            embedding: embeddingVector,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicant.id);

        if (updateError) {
          console.error(`Error updating applicant ${applicant.id}:`, updateError);
        } else {
          console.log(`✅ Generated embedding for ${applicant.first_name} ${applicant.last_name}`);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing applicant ${applicant.id}:`, error);
      }
    }

    console.log('🎉 Finished generating embeddings!');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

generateEmbeddingsForApplicants(); 