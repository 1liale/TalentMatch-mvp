"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile } from "@/utils/supabase/db/queries";
import { toast } from "sonner";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the profile data initially
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Update the profile in both state and database
  const updateProfile = useCallback(async (updatedData, showToast = true) => {
    if (!user || !profile) return null;
    
    try {
      // Merge the current profile with updates
      const newProfile = { ...profile, ...updatedData };
      
      // Update state immediately for responsive UI
      setProfile(newProfile);
      
      // Extract fields that shouldn't be sent to the database
      const { id, created_at, updated_at, ...dataToUpdate } = updatedData;
      
      // Update the database
      const { error } = await supabase
        .from("user_profiles")
        .update(dataToUpdate)
        .eq("id", user.id);
        
      if (error) throw error;
      
      if (showToast) {
        toast.success("Profile updated successfully");
      }
      
      return newProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      if (showToast) {
        toast.error("Failed to update profile");
      }
      return null;
    }
  }, [user, profile, supabase]);

  // Update a single field in the profile
  const updateProfileField = useCallback(async (field, value, showToast = false) => {
    if (!profile) return;
    
    return updateProfile({ [field]: value }, showToast);
  }, [profile, updateProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        updateProfileField,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
} 