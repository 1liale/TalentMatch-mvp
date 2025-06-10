"use client";

// Help page (mockup for now, no functionality)

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  TypographyH1, 
  TypographyH2, 
  TypographyH3, 
  TypographyP, 
  TypographyLead 
} from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Briefcase, 
  FileText, 
  Users, 
  Zap, 
  Send, 
  BookOpen
} from "lucide-react";

// FAQ items
const faqCategories = [
  {
    title: "Getting Started",
    icon: BookOpen,
    items: [
      {
        question: "What is Talent Match?",
        answer: "Talent Match is an AI-powered platform that matches job seekers with elite opportunities worldwide. Our advanced algorithms analyze your skills, experiences, and preferences to connect you with the perfect job matches. Upload your resume, set your preferences, and let our AI find the best opportunities for you, all with just a single application."
      },
      {
        question: "How do I create an account?",
        answer: "To create an account, click the 'Sign Up' button in the top right corner of the homepage. You can sign up using your email address or your Google account. After verifying your email, you'll be guided through our onboarding process to help us understand your skills and preferences better."
      },
      {
        question: "Is Talent Match free to use?",
        answer: "Yes, Talent Match is completely free for job seekers. We make money by charging employers who use our platform to find qualified candidates. You can create a profile, upload your resume, apply to jobs, and receive AI feedback at no cost."
      },
      {
        question: "What makes Talent Match different from other job platforms?",
        answer: "Talent Match uses proprietary AI algorithms to match candidates with jobs based on skills, experience, and cultural fit. Our platform gives you a match percentage for each job, showing how well you align with the requirements. Additionally, we offer AI-powered resume analysis and improvement suggestions to help you stand out to employers."
      }
    ]
  },
  {
    title: "Profile & Resume",
    icon: FileText,
    items: [
      {
        question: "How do I upload my resume?",
        answer: "You can upload your resume by going to the 'Resumes' section in your dashboard. Click on the upload area or drag and drop your file there. We accept PDF and Word document formats. After uploading, our AI will analyze your resume and provide feedback on how to improve it."
      },
      {
        question: "What does the AI resume analysis include?",
        answer: "Our AI resume analysis evaluates your resume against industry standards and provides detailed feedback including: strengths, areas for improvement, skills extracted, experience verification, education assessment, and specific recommendations for making your resume more competitive. This helps you understand how employers and ATS systems view your resume."
      },
      {
        question: "How often should I update my profile?",
        answer: "We recommend updating your profile at least once every 3 months, or whenever you gain new skills, complete a project, or change jobs. Keeping your profile current ensures our matching algorithm has the most accurate information about you, leading to better job matches."
      },
      {
        question: "Can I have multiple resumes on my profile?",
        answer: "Yes, you can upload multiple resumes to your profile. This is especially useful if you're applying to different types of positions or industries. Our system will use the appropriate resume based on the job you're applying for, or you can manually select which resume to use for specific applications."
      }
    ]
  },
  {
    title: "Job Search & Applications",
    icon: Briefcase,
    items: [
      {
        question: "How does the job matching algorithm work?",
        answer: "Our job matching algorithm analyzes over 50 data points from your profile, resume, and previous interactions with the platform. It compares these with job requirements to calculate a match percentage. We consider skills, experience level, location preferences, salary expectations, company culture, and more. Jobs with higher match percentages are more likely to be a good fit for your background and preferences."
      },
      {
        question: "What does the match percentage mean?",
        answer: "The match percentage indicates how well your profile aligns with a job's requirements. A higher percentage (90%+) means you're an excellent match for the position. Scores between 70-89% indicate you meet most requirements but might be missing some preferred qualifications. We recommend focusing on jobs where you have at least a 70% match rate for the best chances of success."
      },
      {
        question: "How do I apply for a job?",
        answer: "To apply for a job, navigate to the 'Jobs' section of your dashboard where you'll find personalized recommendations. Click on any job card to view details, then click the 'Apply Now' button. Some applications will be completed directly through our platform, while others may redirect you to the company's application system. Your profile and selected resume will be shared with the employer."
      },
      {
        question: "Can I track my job applications?",
        answer: "Yes, you can track all your applications in the 'Applications' section of your dashboard. You'll see the status of each application (Applied, Under Review, Interview, Rejected, or Offer), and receive email notifications when there are updates. This central hub helps you keep track of your job search progress across multiple companies."
      }
    ]
  },
  {
    title: "Companies & Opportunities",
    icon: Users,
    items: [
      {
        question: "What types of companies use Talent Match?",
        answer: "Talent Match partners with a diverse range of companies, from fast-growing startups to Fortune 500 corporations across various industries. We focus on companies offering remote or flexible work arrangements, competitive compensation, and positive workplace cultures. Our platform is particularly popular with technology, finance, healthcare, marketing, and design companies seeking skilled professionals."
      },
      {
        question: "Are the jobs only for technical roles?",
        answer: "No, while we have many technical positions, Talent Match offers opportunities across various fields and industries. We have roles in marketing, design, content creation, sales, customer service, finance, HR, and many other non-technical areas. Our goal is to connect talent with opportunities regardless of the field or specialization."
      },
      {
        question: "Are remote jobs available on the platform?",
        answer: "Yes, Talent Match specializes in connecting candidates with remote opportunities worldwide. You can filter jobs by remote, hybrid, or on-site preferences. For remote positions, you can further filter by time zone requirements or fully asynchronous options. Many of our partner companies operate globally and offer flexible work arrangements."
      },
      {
        question: "How are salaries determined for positions?",
        answer: "Salary ranges displayed on job listings are provided by employers based on market rates, location, experience level, and company budget. For remote positions, some companies adjust salaries based on your location, while others offer location-agnostic compensation. You can set your salary expectations in your profile, and our matching algorithm will prioritize jobs that align with your requirements."
      }
    ]
  },
  {
    title: "AI & Technology",
    icon: Zap,
    items: [
      {
        question: "How does Talent Match use AI to improve my job search?",
        answer: "Talent Match leverages AI in multiple ways: our matching algorithm pairs your skills and preferences with relevant jobs; our resume analyzer provides feedback and improvement suggestions; our skills assessment system identifies your strengths and growth areas; and our interview preparation tools help you practice for specific roles. All these AI-powered features work together to streamline your job search and increase your chances of landing your ideal position."
      },
      {
        question: "Is my data secure on the platform?",
        answer: "Yes, we take data security and privacy extremely seriously. We use industry-standard encryption to protect your personal information and resume data. We never share your information with employers without your explicit permission, and you can control exactly which aspects of your profile are visible. Our platform complies with GDPR, CCPA, and other relevant data protection regulations."
      },
      {
        question: "Can I opt out of AI analysis features?",
        answer: "Yes, all AI features on Talent Match are opt-in. You can choose which AI tools you want to use in your settings. If you prefer not to use our AI resume analyzer or matching algorithm, you can still browse and apply to jobs manually. However, using our AI features significantly increases your chances of finding relevant opportunities and improving your application materials."
      },
      {
        question: "How accurate is the skill assessment technology?",
        answer: "Our skill assessment technology has been trained on millions of profiles and validated against industry standards. It's approximately 95% accurate at identifying demonstrated skills from your resume and profile. The system continuously improves through machine learning as more candidates use the platform. For technical roles, we also offer optional skill verification tests that can boost your match scores with employers."
      }
    ]
  }
];

// FAQ Accordion Component
const FAQAccordion = ({ item, isOpen, toggleAccordion }) => {
  return (
    <div className="border rounded-md mb-3 overflow-hidden">
      <button
        className="w-full p-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
        onClick={toggleAccordion}
      >
        <span className="font-medium">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <TypographyP className="text-muted-foreground">
            {item.answer}
          </TypographyP>
        </div>
      )}
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="mb-2">{title}</CardTitle>
        <TypographyP className="text-muted-foreground">
          {description}
        </TypographyP>
      </CardContent>
    </Card>
  );
};

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  
  // Toggle FAQ accordion
  const toggleAccordion = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Check if an accordion is open
  const isAccordionOpen = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    return openItems[key] || false;
  };
  
  // Filter FAQs based on search query
  const getFilteredFAQs = () => {
    if (!searchQuery.trim()) {
      return faqCategories;
    }
    
    const query = searchQuery.toLowerCase();
    
    return faqCategories.map(category => ({
      ...category,
      items: category.items.filter(
        item => 
          item.question.toLowerCase().includes(query) || 
          item.answer.toLowerCase().includes(query)
      )
    })).filter(category => category.items.length > 0);
  };
  
  const filteredFAQs = getFilteredFAQs();
  
  // Ensure we have a valid active category
  if (filteredFAQs.length > 0 && activeCategory >= filteredFAQs.length) {
    setActiveCategory(0);
  }
  
  const renderCategoryContent = () => {
    if (!filteredFAQs.length || !filteredFAQs[activeCategory]) {
      return (
        <div className="text-center py-12">
          <TypographyH3 className="mb-2">No results found</TypographyH3>
          <TypographyP className="text-muted-foreground">
            Try adjusting your search query or browse by category instead.
          </TypographyP>
        </div>
      );
    }
    
    const activeCategory1 = filteredFAQs[activeCategory];
    const CategoryIcon = activeCategory1.icon;
    
    return (
      <>
        <TypographyH3 className="mb-4 flex items-center gap-2">
          <CategoryIcon className="h-5 w-5 text-primary" />
          {activeCategory1.title}
        </TypographyH3>
        
        {activeCategory1.items.map((item, itemIndex) => (
          <FAQAccordion
            key={itemIndex}
            item={item}
            isOpen={isAccordionOpen(activeCategory, itemIndex)}
            toggleAccordion={() => toggleAccordion(activeCategory, itemIndex)}
          />
        ))}
      </>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <TypographyH1 className="mb-3">Help Center</TypographyH1>
        <TypographyLead className="mx-auto max-w-2xl text-muted-foreground">
          Find answers to common questions about how Talent Match works and how to get the most out of our platform.
        </TypographyLead>
        
        {/* Search */}
        <div className="max-w-xl mx-auto mt-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search for answers..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* How It Works section */}
      <section className="mb-20">
        <TypographyH2 className="text-center mb-10">How Talent Match Works</TypographyH2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Star}
            title="AI-Powered Matching"
            description="Our advanced algorithms analyze your skills, experience, and preferences to match you with the perfect job opportunities worldwide."
          />
          
          <FeatureCard 
            icon={FileText}
            title="Resume Enhancement"
            description="Get AI-powered feedback on your resume with specific recommendations for improvement to help you stand out to employers."
          />
          
          <FeatureCard 
            icon={Send}
            title="One-Click Applications"
            description="Apply to multiple jobs with a single click. Your profile and tailored resume are automatically shared with employers."
          />
        </div>
      </section>
      
      {/* FAQ section */}
      <section>
        <TypographyH2 className="text-center mb-10">Frequently Asked Questions</TypographyH2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Category navigation */}
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-1">
              {filteredFAQs.map((category, index) => {
                const CategoryIcon = category.icon;
                return (
                  <Button
                    key={index}
                    variant={activeCategory === index ? "default" : "ghost"}
                    className="w-full justify-start gap-2 mb-1"
                    onClick={() => setActiveCategory(index)}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    <span>{category.title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* FAQ content */}
          <div className="md:col-span-3">
            {renderCategoryContent()}
          </div>
        </div>
      </section>
      
      {/* Contact support */}
      <section className="mt-20 text-center">
        <Card className="mx-auto max-w-2xl bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP className="mb-6">
              Our support team is ready to help you with any questions you may have about Talent Match.
            </TypographyP>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 