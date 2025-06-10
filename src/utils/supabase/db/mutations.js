import { createClient } from '@/utils/supabase/client';

/**
 * Create or update user profile with onboarding data
 * @param {string} userId - The user ID
 * @param {Object} formData - Profile data to save (includes userType)
 * @returns {Promise<Object>} Updated profile data
 */
export async function saveOnboardingProfile(userId, formData) {
  try {
    // Process form data for arrays before sending to API
    const processedFormData = { ...formData };
    
    // Convert comma-separated strings to arrays or ensure empty arrays for empty strings
    if (typeof processedFormData.skills === 'string') {
      processedFormData.skills = processedFormData.skills.trim() 
        ? processedFormData.skills.split(',').map(skill => skill.trim()) 
        : [];
    }
    
    if (typeof processedFormData.hiringRoles === 'string') {
      processedFormData.hiringRoles = processedFormData.hiringRoles.trim() 
        ? processedFormData.hiringRoles.split(',').map(role => role.trim()) 
        : [];
    }

    // Create Supabase client
    const supabase = createClient();
    
    const userType = processedFormData.userType;
    
    // Prepare data object based on common and role-specific fields
    const commonFields = {
      id: userId,
      user_type: userType,
      full_name: processedFormData.fullName,
      username: processedFormData.username,
      bio: processedFormData.bio,
      location: processedFormData.location,
      onboarding_completed: true,
    };
    
    // Add role-specific fields with validation for array fields
    let roleSpecificFields = {};
    
    if (userType === 'applicant') {
      roleSpecificFields = {
        job_title: processedFormData.title,
        skills: processedFormData.skills,
        experience_level: processedFormData.experience,
        education: processedFormData.education,
        portfolio_url: processedFormData.portfolioUrl,
        github_url: processedFormData.githubUrl,
        linkedin_url: processedFormData.linkedinUrl,
      };
    } else {
      roleSpecificFields = {
        employer_company_name: processedFormData.employerCompanyName,
        company_size: processedFormData.companySize,
        industry: processedFormData.industry,
        company_website: processedFormData.companyWebsite,
        hiring_roles: processedFormData.hiringRoles,
      };
    }
    
    const profileToSave = {
      ...commonFields,
      ...roleSpecificFields
    };
    
    // Save to database directly
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileToSave)
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error saving onboarding profile:', error);
    throw error;
  }
}

/**
 * Upload a profile avatar image to Supabase storage
 * @param {string} userId - The user ID
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The URL of the uploaded image
 */
export async function uploadAvatar(userId, file) {
  try {
    if (!userId || !file) {
      throw new Error('User ID and file are required');
    }

    // Create Supabase client
    const supabase = createClient();
    const BUCKET_NAME = 'profile-imgs';
    const fileName = file.name;
  
    // Upload the file to the 'profile-imgs' bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

    console.log('Upload response:', data, error);

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
      
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    const publicUrl = urlData.publicUrl;

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

/**
 * Upload a resume file to Supabase storage and save metadata to database
 * @param {string} userId - The user ID
 * @param {File} file - The resume file to upload
 * @returns {Promise<Object>} The saved resume data
 */
export async function uploadResume(userId, file) {
  try {
    if (!userId || !file) {
      throw new Error('User ID and file are required');
    }

    // Create Supabase client
    const supabase = createClient();
    
    // Upload file to Supabase storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${userId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);
      
    // Determine file type
    const fileType = file.name.split('.').pop().toLowerCase();
    
    // Insert record into resumes table
    const { data, error: insertError } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: fileType,
          file_size: file.size,
          uploaded_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (insertError) throw insertError;
    
    return data[0];
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
}

/**
 * Delete a resume from storage and database
 * @param {string} userId - The user ID
 * @param {string} resumeId - The resume ID to delete
 * @param {string} fileUrl - The file URL to delete from storage
 * @returns {Promise<void>}
 */
export async function deleteResume(userId, resumeId, fileUrl) {
  try {
    if (!userId || !resumeId || !fileUrl) {
      throw new Error('User ID, resume ID, and file URL are required');
    }

    // Create Supabase client
    const supabase = createClient();
    
    // Extract the path from URL
    const urlParts = fileUrl.split('/');
    const storagePath = `${userId}/${urlParts[urlParts.length - 1]}`;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('resumes')
      .remove([storagePath]);
    
    if (storageError) throw storageError;
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);
      
    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
}

/**
 * Save AI feedback for a resume
 * @param {string} resumeId - The resume ID
 * @param {Object} feedback - The feedback data to save
 * @returns {Promise<Object>} Updated resume data
 */
export async function saveResumeFeedback(resumeId, feedback) {
  try {
    if (!resumeId || !feedback) {
      throw new Error('Resume ID and feedback are required');
    }

    // Create Supabase client
    const supabase = createClient();
    
    // Update resume with feedback
    const { data, error } = await supabase
      .from('resumes')
      .update({ 
        feedback: feedback,
        feedback_updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error saving resume feedback:', error);
    throw error;
  }
}

/**
 * Process a resume file with AI analysis
 * @param {string} resumeId - The resume ID
 * @param {File} file - The resume file to process
 * @returns {Promise<Object>} The feedback data
 */
export async function processResumeWithAI(resumeId, file) {
  try {
    if (!resumeId || !file) {
      throw new Error('Resume ID and file are required');
    }

    // Create form data for the API request
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resumeId', resumeId);
    
    // Send to our API route for processing
    const response = await fetch('/api/process-resume', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process resume');
    }
    
    const data = await response.json();
    return data.feedback;
  } catch (error) {
    console.error('Error processing resume with AI:', error);
    throw error;
  }
}

/**
 * Create a job application
 * @param {Object} applicationData - The application data to save
 * @returns {Promise<Object>} The created application
 */
export async function createJobApplication(applicationData) {
  try {
    if (!applicationData.jobId || !applicationData.userId) {
      throw new Error('Job ID and user ID are required');
    }

    // Create Supabase client
    const supabase = createClient();
    
    // Insert record into applications table
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        job_id: applicationData.jobId,
        user_id: applicationData.userId,
        resume_id: applicationData.resumeId,
        cover_letter: applicationData.coverLetter,
        status: 'pending',
        application_date: new Date().toISOString(),
        phone: applicationData.phone,
        availability: applicationData.availability,
        skills: applicationData.skills || [],
        experience: applicationData.experience,
        social_links: applicationData.socialLinks || {},
        bio: applicationData.bio
      }])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error creating job application:', error);
    throw error;
  }
}

/**
 * Create a new job post via API endpoint (with embeddings)
 * @param {Object} jobData - The job data to save
 * @returns {Promise<Object>} The created job post
 */
export async function createJob(jobData) {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create job post');
    }

    const result = await response.json();
    return result.job;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
} 