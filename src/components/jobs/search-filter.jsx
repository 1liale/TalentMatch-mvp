"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypographyP } from "@/components/ui/typography";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X } from "lucide-react";

// Mock data for filters - replace with dynamic data if available
const filterOptions = {
  jobType: ["Full-time", "Contract", "Part-time", "Internship"],
  experienceLevel: ["Graduate", "Junior", "Mid-level", "Senior"],
  location: ["Remote", "San Francisco, CA", "New York, NY", "Toronto", "Boston, MA", "Austin, TX", "Chicago, IL", "Los Angeles, CA", "Denver, CO", "Atlanta, GA", "San Jose, CA"],
};

export const JobFilterPanel = ({
  filters,
  toggleFilter,
  clearFilter,
  clearAllFilters,
  resumes = [], // default to empty array
  selectedResumeId,
  setSelectedResumeId
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
        <TypographyP className="font-semibold">Filters</TypographyP>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
            Clear All
        </Button>
      </div>
    <Accordion type="multiple" defaultValue={['jobType', 'experienceLevel', 'location', 'resumeMatch']} className="w-full">
      {/* Job Type Filter */}
      <AccordionItem value="jobType">
        <AccordionTrigger>Job Type</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {filterOptions.jobType.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`} 
                checked={filters.jobType.includes(type)}
                onCheckedChange={() => toggleFilter("jobType", type)}
              />
              <label htmlFor={`type-${type}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {type}
              </label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* Experience Level Filter */}
      <AccordionItem value="experienceLevel">
        <AccordionTrigger>Experience Level</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {filterOptions.experienceLevel.map((level) => (
            <div key={level} className="flex items-center gap-2">
              <Checkbox
                id={`exp-${level}`} 
                checked={filters.experienceLevel.includes(level)}
                onCheckedChange={() => toggleFilter("experienceLevel", level)}
              />
              <label htmlFor={`exp-${level}`} className="text-sm font-medium leading-none">
                {level}
              </label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* Location Filter */}
      <AccordionItem value="location">
        <AccordionTrigger>Location</AccordionTrigger>
        <AccordionContent className="space-y-2">
          {filterOptions.location.map((loc) => (
            <div key={loc} className="flex items-center gap-2">
              <Checkbox
                id={`loc-${loc}`} 
                checked={filters.location.includes(loc)}
                onCheckedChange={() => toggleFilter("location", loc)}
              />
              <label htmlFor={`loc-${loc}`} className="text-sm font-medium leading-none">
                {loc}
              </label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>

      {/* Resume Match Filter */}
      <AccordionItem value="resumeMatch">
        <AccordionTrigger>Match with Resume</AccordionTrigger>
        <AccordionContent>
          {resumes.length > 0 ? (
            <>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {resumes.map(resume => {
                    // Extract filename without extension, with fallback
                    const displayName = resume.file_name 
                      ? resume.file_name.split('.').slice(0, -1).join('.') || resume.file_name
                      : `Resume ${resume.id}`;
                    
                    return (
                      <SelectItem key={resume.id} value={resume.id}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <TypographyP className="text-xs text-muted-foreground mt-2">
                Find jobs that are a good match for your skills and experience.
              </TypographyP>
            </>
          ) : (
            <div className="text-center py-4">
              <TypographyP className="text-sm text-muted-foreground mb-2">
                No resumes uploaded yet
              </TypographyP>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard/resumes">Upload Resume</a>
              </Button>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    </div>
  );

export const ActiveFilters = ({ 
  filters, 
  toggleFilter, 
  clearAllFilters,
  selectedResumeId,
  resumeName,
  clearResumeFilter
}) => {
  const activeFilters = Object.entries(filters).flatMap(([type, values]) => 
    values.map(value => ({ type, value }))
  );

  const hasActiveFilters = activeFilters.length > 0 || (selectedResumeId && selectedResumeId !== 'none');

  if (!hasActiveFilters) return null;
  
  // Extract display name from resume file name
  const getDisplayName = (fileName) => {
    if (!fileName) return 'Unknown Resume';
    return fileName.split('.').slice(0, -1).join('.') || fileName;
  };
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <TypographyP className="text-sm font-medium">Active Filters:</TypographyP>
      {activeFilters.map(({ type, value }) => (
        <Badge key={`${type}-${value}`} variant="secondary" className="flex items-center gap-1">
          {value}
          <button onClick={() => toggleFilter(type, value)} className="hover:text-primary">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedResumeId && selectedResumeId !== 'none' && resumeName && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Resume: {getDisplayName(resumeName)}
          <button onClick={clearResumeFilter} className="hover:text-primary">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm text-primary hover:bg-transparent">
        Clear All
      </Button>
    </div>
  );
};

export const SortSelector = ({ sortBy, setSortBy }) => (
  <div className="flex items-center gap-2">
    <TypographyP className="text-sm text-muted-foreground">Sort by</TypographyP>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="relevance">Relevance</SelectItem>
        <SelectItem value="salary_high">Salary: High to Low</SelectItem>
        <SelectItem value="salary_low">Salary: Low to High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );