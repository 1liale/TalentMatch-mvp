'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Update the status of a job application
 * @param {number} applicationId - The ID of the application to update
 * @param {string} status - The new status
 * @returns {Promise<Object>} The updated application data
 */
export async function updateApplicationStatus(applicationId, status) {
  try {
    if (!applicationId || !status) {
      throw new Error('Application ID and status are required');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('applications')
      .update({ status: status })
      .eq('id', applicationId)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error updating application status for ID ${applicationId}:`, error);
    throw error;
  }
} 