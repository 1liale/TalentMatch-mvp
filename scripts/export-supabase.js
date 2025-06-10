/**
 * export-supabase.js
 *
 * This script loads job postings and applicant profiles from local JSON files,
 * generates text embeddings for each using the Cohere API, and inserts the
 * enriched records into the Supabase 'jobs' and 'applicants' tables.
 *
 * Prerequisites:
 *   - Ensure the following environment variables are set:
 *       NEXT_PUBLIC_SUPABASE_URL       Supabase project URL
 *       NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon key
 *       COHERE_API_KEY                 Cohere API key for embeddings
 *
 * Usage: (call from the root of the project)
 *   node scripts/export-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { generateJobEmbedding, generateApplicantEmbedding } from '../src/utils/cohere/embeddings.js';
import jobs from './data/jobs.json' assert { type: 'json' };
import applicants from './data/applicants.json' assert { type: 'json' };
import 'dotenv/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

async function ExportJobs() {
  console.log('Exporting jobs...');
  
  for (const job of jobs) {
    try {
      // Generate embedding for job
      const embedding = await generateJobEmbedding(job);
      console.log(`Embedding generated for job: ${job.title} (${embedding.length} dimensions)`);
      
      // Convert post_date string to Date
      const postDate = new Date(job.postDate);
      
      // Insert job with embedding
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: job.title,
          company: job.company,
          location: job.location,
          work_arrangement: job.workArrangement,
          salary: job.salary,
          experience_level: job.experienceLevel,
          employment_type: job.employmentType,
          description: job.description,
          required_skills: job.requiredSkills,
          post_date: postDate,
          embedding
        });
      
      if (error) {
        console.error(`Error inserting job ${job.title}:`, error);
      } else {
        console.log(`Exported job: ${job.title}`);
      }
    } catch (error) {
      console.error(`Error processing job ${job.title}:`, error);
    }
  }
}

async function ExportApplicants() {
  console.log('Exporting applicants...');
  
  for (const applicant of applicants) {
    try {
      // Generate embedding for applicant
      const embedding = await generateApplicantEmbedding(applicant);
      console.log(`Embedding generated for applicant: ${applicant.fullName} (${embedding.length} dimensions)`);
      
      // Insert applicant with embedding
      const { error } = await supabase
        .from('applicants')
        .insert({
          full_name: applicant.fullName,
          first_name: applicant.firstName,
          last_name: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
          location: applicant.location,
          avatar_url: applicant.avatarUrl,
          job_title: applicant.jobTitle,
          experience_level: applicant.experienceLevel,
          years_of_experience: applicant.yearsOfExperience,
          current_employer: applicant.currentEmployer,
          bio: applicant.bio,
          skills: applicant.skills,
          education: applicant.education,
          social_links: applicant.socialLinks,
          salary_expectation: applicant.salaryExpectation,
          remote_preference: applicant.remotePreference,
          availability: applicant.availability,
          work_authorization: applicant.workAuthorization,
          created_at: new Date(applicant.createdAt),
          updated_at: new Date(applicant.updatedAt),
          embedding
        });

      if (error) {
        console.error(`Error inserting applicant ${applicant.fullName}:`, error);
      } else {
        console.log(`Exported applicant: ${applicant.fullName}`);
      }
    } catch (error) {
      console.error(`Error processing applicant ${applicant.fullName}:`, error);
    }
  }
}

// Run Exports
async function main() {
  try {
    await ExportJobs();
    await ExportApplicants();
    console.log('Export completed successfully');
  } catch (error) {
    console.error('Export failed:', error);
  }
}

main();