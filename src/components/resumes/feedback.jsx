import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  TypographyH3, 
  TypographyP, 
  TypographySmall 
} from "@/components/ui/typography";
import { Star, CheckCircle, AlertTriangle, Loader2, Calendar, Link as LinkIcon, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeedbackArea = ({ feedback, isAnalyzing = false }) => {
  // Show loading state when analyzing or when feedback is not available
  if (isAnalyzing) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Resume Feedback</CardTitle>
          <CardDescription>
            AI-powered analysis of your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <TypographyP className="text-center text-muted-foreground">
            Analyzing your resume... This may take a moment.
          </TypographyP>
        </CardContent>
      </Card>
    );
  }
  
  if (!feedback) return null;
  
  const renderScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Resume Feedback</span>
          <div className={`flex items-center gap-1 ${renderScoreColor(feedback.overallScore)}`}>
            <Star className="h-4 w-4 fill-current" />
            <span>{feedback.overallScore}/10</span>
          </div>
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your resume
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bio */}
        {feedback.bio && (
          <div>
            <TypographyH3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>Summary</span>
            </TypographyH3>
            <TypographyP className="text-sm">{feedback.bio}</TypographyP>
            
            {feedback.yearsOfExperience && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{feedback.yearsOfExperience} years of experience</span>
              </div>
            )}
          </div>
        )}
        
        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div>
            <TypographyH3 className="text-sm font-medium mb-2 text-green-600">Strengths</TypographyH3>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Areas for Improvement */}
        {feedback.improvements && feedback.improvements.length > 0 && (
          <div>
            <TypographyH3 className="text-sm font-medium mb-2 text-amber-600">Areas for Improvement</TypographyH3>
            <ul className="space-y-2">
              {feedback.improvements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Extracted Information */}
        <div>
          <TypographyH3 className="text-sm font-medium mb-2">Key Information Extracted</TypographyH3>
          <div className="space-y-3">
            {feedback.skills && feedback.skills.length > 0 && (
              <div>
                <TypographySmall className="font-medium">Skills</TypographySmall>
                <div className="flex flex-wrap gap-1 mt-1">
                  {feedback.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {feedback.experience && feedback.experience.length > 0 && (
              <div>
                <TypographySmall className="font-medium">Experience</TypographySmall>
                <ul className="mt-1 space-y-1">
                  {feedback.experience.map((exp, i) => (
                    <li key={i} className="text-sm">{exp}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {feedback.education && feedback.education.length > 0 && (
              <div>
                <TypographySmall className="font-medium">Education</TypographySmall>
                <ul className="mt-1 space-y-1">
                  {feedback.education.map((edu, i) => (
                    <li key={i} className="text-sm">{edu}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {feedback.social_links && feedback.social_links.length > 0 && (
              <div>
                <TypographySmall className="font-medium">Social Links</TypographySmall>
                <ul className="mt-1 space-y-1">
                  {feedback.social_links.map((link, i) => (
                    <li key={i} className="text-sm flex items-center gap-1">
                      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Recommendations */}
        {feedback.recommendations && (
          <div>
            <TypographyH3 className="text-sm font-medium mb-2 text-primary">Recommendations</TypographyH3>
            <TypographyP className="text-sm">{feedback.recommendations}</TypographyP>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackArea; 