import { TypographyH1, TypographyP } from "@/components/ui/typography";

export function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex-1">
        <TypographyH1>{title}</TypographyH1>
        {description && (
          <TypographyP className="text-muted-foreground">
            {description}
          </TypographyP>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
} 