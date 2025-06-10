import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypographyH4, TypographyP } from "@/components/ui/typography";

const ApplicantProfessionalSection = ({
  profile,
  editedProfile,
  onChange,
  isEditing,
}) => {
  return (
    <div className="p-6 border-b">
      <div className="mb-6">
        <TypographyH4>Professional Information</TypographyH4>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          {isEditing ? (
            <Input
              id="jobTitle"
              value={editedProfile.job_title || ""}
              onChange={(e) => onChange("job_title", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>{profile.job_title || "Not set"}</TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="experience">Experience Level</Label>
          {isEditing ? (
            <Input
              id="experience"
              value={editedProfile.experience_level || ""}
              onChange={(e) => onChange("experience_level", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>{profile.experience_level || "Not set"}</TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="education">Education</Label>
          {isEditing ? (
            <Input
              id="education"
              value={editedProfile.education || ""}
              onChange={(e) => onChange("education", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>{profile.education || "Not set"}</TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          {isEditing ? (
            <Input
              id="skills"
              value={(editedProfile.skills || []).join(", ")}
              onChange={(e) => {
                const skillsArray = e.target.value
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean);
                onChange("skills", skillsArray);
              }}
              className="mt-1"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <TypographyP>No skills added yet</TypographyP>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="jobStatus">Job Seeking Status</Label>
          {isEditing ? (
            <Input
              id="jobStatus"
              value={editedProfile.job_seeking_status || ""}
              onChange={(e) => onChange("job_seeking_status", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>
              {profile.job_seeking_status || "Not set"}
            </TypographyP>
          )}
        </div>

        <div>
          <Label htmlFor="salaryExpectation">Salary Expectation</Label>
          {isEditing ? (
            <Input
              id="salaryExpectation"
              type="number"
              value={editedProfile.salary_expectation || ""}
              onChange={(e) => onChange("salary_expectation", e.target.value)}
              className="mt-1"
            />
          ) : (
            <TypographyP>
              {profile.salary_expectation
                ? `$${profile.salary_expectation.toLocaleString()}`
                : "Not set"}
            </TypographyP>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfessionalSection; 