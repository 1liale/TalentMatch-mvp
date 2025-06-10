import { Button } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography";
import { Edit, Check, X } from "lucide-react";

const ProfileHeader = ({
  isEditing,
  setIsEditing,
  handleCancelEdit,
  handleSaveChanges,
  saving,
}) => {
  return (
    <div className="p-6 border-b flex justify-between items-center">
      <TypographyH3 className="font-medium">Profile Settings</TypographyH3>

      {!isEditing ? (
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" /> Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader; 