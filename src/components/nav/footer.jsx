import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/base/logo";
import { Twitter, Linkedin, Instagram } from "lucide-react";
import { 
  TypographyH3, 
  TypographyP, 
  TypographySmall 
} from "@/components/ui/typography";

// Social Icon Component
const SocialIcon = ({ href, icon }) => {
  return (
    <Button
      variant="ghost" 
      size="icon"
      className="w-10 h-10 bg-muted/30 rounded-full text-foreground/70 hover:text-primary hover:bg-primary/10"
      asChild
    >
      <Link href={href} aria-label="Social media link">
        {icon}
      </Link>
    </Button>
  );
};

// Footer Link Component
const FooterLink = ({ href, children }) => {
  return (
    <li>
      <Button variant="link" className="text-foreground/70 hover:text-primary p-0 h-auto justify-start" asChild>
        <Link href={href}>{children}</Link>
      </Button>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto bg-card border-t border-muted/60 py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Logo className="mb-6" />
            <TypographyP className="mb-6 leading-relaxed">
              Smart talent connection platform linking professionals with opportunities best suited to their skills and ambitions.
            </TypographyP>
            <div className="flex gap-4">
              <SocialIcon href="#" icon={<Twitter size={18} />} />
              <SocialIcon href="#" icon={<Linkedin size={18} />} />
              <SocialIcon href="#" icon={<Instagram size={18} />} />
            </div>
          </div>
          
          <div>
            <TypographyH3 className="text-lg mb-4">For Companies</TypographyH3>
            <ul className="space-y-3">
              <FooterLink href="#">Talent Search</FooterLink>
              <FooterLink href="#">Candidate Explorer</FooterLink>
            </ul>
          </div>
          
          <div>
            <TypographyH3 className="text-lg mb-4">For Talents</TypographyH3>
            <ul className="space-y-3">
              <FooterLink href="#">Resume Analysis</FooterLink>
              <FooterLink href="#">Explore Opportunities</FooterLink>
            </ul>
          </div>
          
          <div>
            <TypographyH3 className="text-lg mb-4">Resources</TypographyH3>
            <ul className="space-y-3">
              <FooterLink href="#">Help Center</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Support</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-muted/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <TypographySmall className="text-foreground/60">
              © {new Date().getFullYear()} TalentMatch. All rights reserved.
            </TypographySmall>
            <div className="flex gap-6">
              <Button variant="link" className="text-sm text-foreground/60 hover:text-foreground p-0 h-auto" asChild>
                <Link href="#">Privacy</Link>
              </Button>
              <Button variant="link" className="text-sm text-foreground/60 hover:text-foreground p-0 h-auto" asChild>
                <Link href="#">Terms</Link>
              </Button>
              <Button variant="link" className="text-sm text-foreground/60 hover:text-foreground p-0 h-auto" asChild>
                <Link href="#">Cookies</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 