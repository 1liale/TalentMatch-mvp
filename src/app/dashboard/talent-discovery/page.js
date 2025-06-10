'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Search, 
  MapPin, 
  Mail, 
  ExternalLink,
  User,
  MessageSquare,
  Sparkles,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { TypographyH2, TypographyP } from '@/components/ui/typography';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

const CandidateCard = ({ candidate }) => {
  const profile = candidate.profile;
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
  
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 group cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || authUser?.user_metadata?.full_name} />
              <AvatarFallback className="bg-primary/10">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate">
              {profile.first_name} {profile.last_name}
            </CardTitle>
            {profile.job_title && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="truncate">{profile.job_title}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              {console.log("test", candidate)}
                {typeof candidate.relevanceScore === 'number' && (
                    <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {`${Math.round(candidate.relevanceScore * 100)}% Match`}
                    </Badge>
                )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {/* Summary */}
        {candidate.summary && (
          <div>
            <p className="text-sm text-muted-foreground" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              Bio: {candidate.summary}
            </p>
          </div>
        )}
        
        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs font-normal">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 5 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{candidate.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Info row */}
        <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${
                  profile.availability_status === 'Available' ? 'bg-green-500' :
                  profile.availability_status === 'Open to offers' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <span>
                  {profile.availability_status || 'Available'}
                </span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 -ml-0.5" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            {profile.experience_level && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{profile.experience_level}</span>
              </div>
            )}
        </div>
      </CardContent>

      <div className="flex border-t mt-auto">
        <Button variant="ghost" size="sm" className="w-full rounded-t-none rounded-b-md">
          <Mail className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </div>
    </Card>
  );
};

const ConversationMessage = ({ message, isUser }) => (
  <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
    {!isUser && (
      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
    )}
    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
      isUser 
        ? 'bg-primary text-primary-foreground ml-8' 
        : 'bg-muted text-muted-foreground'
    }`}>
      <TypographyP className={`text-sm ${isUser ? 'text-primary-foreground' : ''}`}>
        {message.content}
      </TypographyP>
    </div>
    {isUser && (
      <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
        <User className="h-4 w-4" />
      </div>
    )}
  </div>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function TalentDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentJobs, setRecentJobs] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/recommend-applicants');
        if (response.ok) {
          const data = await response.json();
          setRecentJobs(data.recentJobs || []);
          setSuggestedPrompts(data.suggestedPrompts || []);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/recommend-applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          jobId: selectedJobId,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search candidates');
      }

      const data = await response.json();
      setCandidates(data.candidates || []);
      setConversationHistory(data.conversationHistory || []);
      setSearchQuery('');
      
      // Log pipeline information for debugging
      if (data.pipeline) {
        console.log('🔍 Two-Stage Pipeline Results:');
        console.log(`Stage 1: ${data.pipeline.stage1}`);
        console.log(`Stage 2: ${data.pipeline.stage2}`);
        console.log(`Method: ${data.stage1Method} → ${data.stage2Method}`);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
      // Add error message to conversation
      const errorHistory = [
        ...conversationHistory,
        { role: 'user', content: searchQuery },
        { role: 'assistant', content: 'Sorry, I encountered an error while searching. Please try again.' }
      ];
      setConversationHistory(errorHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setSearchQuery(prompt);
    inputRef.current?.focus();
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    const job = recentJobs.find(j => j.id === jobId);
    if (job) {
      setSearchQuery(`Find candidates for my ${job.title} position`);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <TypographyH2>Talent Discovery</TypographyH2>
            <div className="flex items-center gap-2">
              <Select onValueChange={handleJobSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Candidates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  {recentJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Describe Your Ideal Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Conversation History */}
              {conversationHistory.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-3 p-4 bg-muted/50 rounded-lg">
                  {conversationHistory.map((message, index) => (
                    <ConversationMessage 
                      key={index} 
                      message={message} 
                      isUser={message.role === 'user'} 
                    />
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  placeholder="Describe the candidate you're looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={loading}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={!searchQuery.trim() || loading}
                  className="px-6"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Suggested Prompts */}
              {!hasSearched && suggestedPrompts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Try these suggestions:</label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="text-xs"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <LoadingSkeleton />
          ) : candidates.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <TypographyP className="text-muted-foreground">
                  Found {candidates.length} candidates ranked by AI relevance
                </TypographyP>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    2-Stage AI Pipeline
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                {candidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            </>
          ) : hasSearched ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <TypographyH2 className="text-xl mb-2">No candidates found</TypographyH2>
                <TypographyP className="text-muted-foreground text-center">
                  Try refining your search or using different keywords to find more candidates.
                </TypographyP>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <TypographyH2 className="text-xl mb-2">Ready to discover talent?</TypographyH2>
                <TypographyP className="text-muted-foreground text-center">
                  Describe your ideal candidate above to get started with AI-powered recommendations.
                </TypographyP>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 