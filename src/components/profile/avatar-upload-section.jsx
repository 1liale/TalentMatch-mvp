"use client";

import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TypographyH4 } from "@/components/ui/typography";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { uploadAvatar } from "@/utils/supabase/db/mutations";
import { useProfile } from "@/context/profile-context";

const AvatarUploadSection = ({
  profile,
  onChange,
  uploading,
  setUploading,
}) => {
  const fileInputRef = useRef(null);
  const supabase = createClient();
  const { updateProfileField } = useProfile();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile.id) return;

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please use JPEG or PNG."
      );
      return;
    }

    setUploading(true);
    try {
      const avatarUrl = await uploadAvatar(profile.id, file);
      if (!avatarUrl) {
        throw new Error("Failed to get avatar URL");
      }

      // Update via the component's onChange handler for local state
      onChange("avatar_url", avatarUrl);
      
      // Also update the global profile context to reflect changes across the app
      await updateProfileField("avatar_url", avatarUrl, false);
      
      console.log("Avatar URL:", avatarUrl);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile.id) return;

    setUploading(true);
    try {
      const BUCKET_NAME = "profile-imgs";

      // Get current avatar path from URL
      if (profile.avatar_url) {
        const avatarPath = profile.avatar_url.split("/").pop();
        if (avatarPath) {
          // Remove from storage
          const { error: removeError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([avatarPath]);

          if (removeError) {
            console.error("Error removing file from storage:", removeError);
            // Continue anyway to update the profile
          }
        }
      }

      // Update profile with no avatar
      const { error } = await supabase
        .from("user_profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      // Update via the component's onChange handler for local state
      onChange("avatar_url", null);
      
      // Also update the global profile context to reflect changes across the app
      await updateProfileField("avatar_url", null, false);
      
      toast.success("Profile picture removed");
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove profile picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 border-b">
      <div className="mb-6">
        <TypographyH4>Profile Picture</TypographyH4>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative group">
          <Avatar className="w-24 h-24 rounded-full border">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {profile.full_name
                ? profile.full_name.substring(0, 2).toUpperCase()
                : "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAvatarClick}
            disabled={uploading}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            Change picture
          </Button>

          {profile.avatar_url && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={handleDeleteAvatar}
              disabled={uploading}
            >
              Delete picture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadSection; 