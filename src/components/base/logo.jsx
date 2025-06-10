import Link from "next/link";

const Logo = ({ className = "" }) => {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
        <span className="text-primary-foreground font-bold">TM</span>
      </div>
      <span className="text-xl md:text-2xl font-serif font-bold text-primary">TalentMatch</span>
    </Link>
  );
};

export default Logo; 