import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TypographyH3, TypographyP, TypographyMuted } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Link as LinkIcon, Briefcase, FileText, Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function ApplicantDetailModal({ applicant, onClose, onStatusChange }) {
  if (!applicant) return null;

  const profile = applicant.user_profiles || applicant.profile;
  const initials = (profile?.full_name || applicant.name)?.split(' ').map(n => n[0]).join('') || 'A';

  const handleStatusUpdate = (newStatus) => {
    onStatusChange(applicant.id, newStatus);
    onClose();
  };

  return (
    <Dialog open={!!applicant} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applicant Details</DialogTitle>
          <DialogDescription>
            Review applicant information and make a decision.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Left Panel: Profile Info */}
          <div className="md:col-span-1 space-y-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={profile?.avatar_url || applicant.avatar} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <TypographyH3>{profile?.full_name || applicant.name}</TypographyH3>
              <TypographyMuted>{profile?.job_title || applicant.title || 'Job Seeker'}</TypographyMuted>
              {(profile?.location || applicant.job_location) && (
                <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{profile?.location || applicant.job_location}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              {/* Contact Information */}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${profile?.email || applicant.email || 'N/A'}`} 
                  className="hover:underline"
                >
                  {profile?.email || applicant.email || 'N/A'}
                </a>
              </div>
              
              {(applicant.phone || profile?.phone) && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.phone || profile?.phone}</span>
                </div>
              )}
              
              {profile?.portfolio_url && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={profile.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                  >
                    Portfolio
                  </a>
                </div>
              )}
              
              {/* Application Date */}
              {applicant.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied {formatDistanceToNow(new Date(applicant.created_at), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Application Details */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <TypographyP className="font-semibold">Applying for:</TypographyP>
              <TypographyMuted>
                {applicant.job_title || applicant.jobs?.title || applicant.jobPosition || 'Position not specified'}
              </TypographyMuted>
            </div>
            
            {/* Resume Link */}
            {(applicant.resumeUrl || applicant.resumes?.file_url) ? (
              <a href={applicant.resumeUrl || applicant.resumes?.file_url} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              </a>
            ) : (
              <TypographyMuted className="text-xs">No resume attached.</TypographyMuted>
            )}

            {/* Skills */}
            {(profile?.skills?.length > 0 || applicant.skills?.length > 0 || applicant.tags?.length > 0) && (
              <div>
                <TypographyP className="font-semibold mb-2">Skills</TypographyP>
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills || applicant.skills || applicant.tags || []).map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {(applicant.experience || profile?.experience_level) && (
              <div>
                <TypographyP className="font-semibold mb-1">Experience</TypographyP>
                <TypographyP className="text-sm text-muted-foreground">
                  {applicant.experience || profile?.experience_level}
                </TypographyP>
              </div>
            )}

            {/* Availability */}
            {applicant.availability && (
              <div>
                <TypographyP className="font-semibold mb-1">Availability</TypographyP>
                <TypographyP className="text-sm text-muted-foreground">
                  {applicant.availability}
                </TypographyP>
              </div>
            )}

            {/* Bio */}
            {(profile?.bio || applicant.bio) && (
              <div>
                <TypographyP className="font-semibold mb-1">About</TypographyP>
                <TypographyP className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {profile?.bio || applicant.bio}
                </TypographyP>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleStatusUpdate('rejected')}>Reject</Button>
            <Button onClick={() => handleStatusUpdate('approved')}>Approve</Button>
          </div>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 