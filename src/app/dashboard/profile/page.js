"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Import modular components
import AvatarUploadSection from "@/components/profile/avatar-upload-section";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import ApplicantProfessionalSection from "@/components/profile/applicant-professional-section";
import ApplicantExternalLinksSection from "@/components/profile/applicant-external-links-section";
import RecruiterCompanySection from "@/components/profile/recruiter-company-section";
import ProfileHeader from "@/components/profile/profile-header";

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const supabase = createClient();
  const [editedProfile, setEditedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize editedProfile when profile data is loaded
  if (profile && !editedProfile) {
    setEditedProfile(profile);
  }

  // Universal onChange handler for all form fields
  const handleChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (field, value) => {
    // Update edited profile
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Update the global profile state immediately
    updateProfile({ [field]: value }, false);
  };

  const handleSaveChanges = async () => {
    if (!user || !editedProfile) return;

    setSaving(true);
    try {
      // Update profile in the context (which also updates the database)
      await updateProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  // Loading state
  if (profileLoading || !profile || !editedProfile) {
    return null;
  }

  const isApplicant = profile.user_type === "applicant";

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="max-w-5xl mx-auto">
          <CardHeader className="p-0">
            <ProfileHeader
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleCancelEdit={handleCancelEdit}
              handleSaveChanges={handleSaveChanges}
              saving={saving}
            />
          </CardHeader>
          <CardContent className="p-0">
            <AvatarUploadSection
              profile={profile}
              onChange={handleAvatarChange}
              uploading={uploading}
              setUploading={setUploading}
            />

            <PersonalInfoSection
              profile={profile}
              editedProfile={editedProfile}
              onChange={handleChange}
              isEditing={isEditing}
              user={user}
            />

            {isApplicant ? (
              // Applicant specific sections
              <>
                <ApplicantProfessionalSection
                  profile={profile}
                  editedProfile={editedProfile}
                  onChange={handleChange}
                  isEditing={isEditing}
                />

                <ApplicantExternalLinksSection
                  profile={profile}
                  editedProfile={editedProfile}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
              </>
            ) : (
              // Recruiter specific section
              <RecruiterCompanySection
                profile={profile}
                editedProfile={editedProfile}
                onChange={handleChange}
                isEditing={isEditing}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
