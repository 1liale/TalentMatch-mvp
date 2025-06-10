import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { Globe } from "lucide-react";

const RecruiterCompanySection = ({
  profile,
  editedProfile,
  onChange,
  isEditing,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <TypographyH4>Company Information</TypographyH4>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          {isEditing ? (
            <Input
              id="companyName"
              value={editedProfile.employer_company_name || ""}
              onChange={(e) => onChange("employer_company_name", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>
              {profile.employer_company_name || "Not set"}
            </TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          {isEditing ? (
            <Input
              id="industry"
              value={editedProfile.industry || ""}
              onChange={(e) => onChange("industry", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>{profile.industry || "Not set"}</TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="companySize">Company Size</Label>
          {isEditing ? (
            <Input
              id="companySize"
              value={editedProfile.company_size || ""}
              onChange={(e) => onChange("company_size", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>
              {profile.company_size
                ? `${profile.company_size} employees`
                : "Not set"}
            </TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="companyWebsite">Company Website</Label>
          {isEditing ? (
            <Input
              id="companyWebsite"
              value={editedProfile.company_website || ""}
              onChange={(e) => onChange("company_website", e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2 mt-1">
              {profile.company_website ? (
                <a
                  href={profile.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe size={16} />
                  {profile.company_website}
                </a>
              ) : (
                <TypographyP>Not set</TypographyP>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="hiringRoles">Hiring Roles (comma-separated)</Label>
          {isEditing ? (
            <Input
              id="hiringRoles"
              value={(editedProfile.hiring_roles || []).join(", ")}
              onChange={(e) => {
                const rolesArray = e.target.value
                  .split(",")
                  .map((role) => role.trim())
                  .filter(Boolean);
                onChange("hiring_roles", rolesArray);
              }}
              className="mt-1"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.hiring_roles && profile.hiring_roles.length > 0 ? (
                profile.hiring_roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <TypographyP>No hiring roles added yet</TypographyP>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterCompanySection; 