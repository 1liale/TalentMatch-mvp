import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { Linkedin, Github, Globe } from "lucide-react";

const ApplicantExternalLinksSection = ({
  profile,
  editedProfile,
  onChange,
  isEditing,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <TypographyH4>External Links</TypographyH4>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          {isEditing ? (
            <Input
              id="linkedinUrl"
              value={editedProfile.linkedin_url || ""}
              onChange={(e) => onChange("linkedin_url", e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2 mt-1">
              {profile.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Linkedin size={16} />
                  {profile.linkedin_url}
                </a>
              ) : (
                <TypographyP>Not set</TypographyP>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="githubUrl">GitHub URL</Label>
          {isEditing ? (
            <Input
              id="githubUrl"
              value={editedProfile.github_url || ""}
              onChange={(e) => onChange("github_url", e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2 mt-1">
              {profile.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Github size={16} />
                  {profile.github_url}
                </a>
              ) : (
                <TypographyP>Not set</TypographyP>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="portfolioUrl">Portfolio URL</Label>
          {isEditing ? (
            <Input
              id="portfolioUrl"
              value={editedProfile.portfolio_url || ""}
              onChange={(e) => onChange("portfolio_url", e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2 mt-1">
              {profile.portfolio_url ? (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe size={16} />
                  {profile.portfolio_url}
                </a>
              ) : (
                <TypographyP>Not set</TypographyP>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantExternalLinksSection; 