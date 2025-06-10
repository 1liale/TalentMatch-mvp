import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TypographyH4, TypographyP } from "@/components/ui/typography";

const PersonalInfoSection = ({ profile, editedProfile, onChange, isEditing, user }) => {
  return (
    <div className="p-6 border-b">
      <div className="mb-6">
        <TypographyH4>Personal Information</TypographyH4>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            {isEditing ? (
              <Input
                id="fullName"
                value={editedProfile.full_name || ""}
                onChange={(e) => onChange("full_name", e.target.value)}
                className="mt-1"
              />
            ) : (
              <TypographyP>{profile.full_name}</TypographyP>
            )}
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            {isEditing ? (
              <Input
                id="username"
                value={editedProfile.username || ""}
                onChange={(e) => onChange("username", e.target.value)}
                className="mt-1"
              />
            ) : (
              <TypographyP>{profile.username || "Not set"}</TypographyP>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <TypographyP>{user?.email}</TypographyP>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            {isEditing ? (
              <Input
                id="location"
                value={editedProfile.location || ""}
                onChange={(e) => onChange("location", e.target.value)}
                className="mt-1"
              />
            ) : (
              <TypographyP>{profile.location || "Not set"}</TypographyP>
            )}
          </div>

          <div>
            <Label htmlFor="bio">About</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={editedProfile.bio || ""}
                onChange={(e) => onChange("bio", e.target.value)}
                className="mt-1"
                rows={4}
              />
            ) : (
              <TypographyP>{profile.bio || "No bio added yet"}</TypographyP>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection; 