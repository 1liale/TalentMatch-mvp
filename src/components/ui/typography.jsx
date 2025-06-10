import { cn } from "@/lib/utils"

export function TypographyH1({ className, ...props }) {
  return (
    <h1
      className={cn(
        "text-4xl font-serif font-bold tracking-tight", // removed text-[#6a6344]
        className
      )}
      {...props}
    />
  )
}

export function TypographyH2({ className, ...props }) {
  return (
    <h2
      className={cn(
        "text-xl font-serif font-bold tracking-tight", // removed text-[#6a6344]
        className
      )}
      {...props}
    />
  )
}

export function TypographyH3({ className, ...props }) {
  return (
    <h3
      className={cn(
        "font-serif font-bold text-foreground",
        className
      )}
      {...props}
    />
  )
}
export function TypographyH4({ className, ...props }) {
  return (
    <h4
      className={cn(
        "font-serif font-semibold text-foreground text-base",
        className
      )}
      {...props}
    />
  )
}

export function TypographyH5({ className, ...props }) {
  return (
    <h5
      className={cn(
        "font-serif font-semibold text-foreground text-sm",
        className
      )}
      {...props}
    />
  )
}

export function TypographyH6({ className, ...props }) {
  return (
    <h6
      className={cn(
        "font-serif font-semibold text-foreground text-xs",
        className
      )}
      {...props}
    />
  )
}

export function TypographyP({ className, ...props }) {
  return (
    <p
      className={cn(
        "text-foreground/80",
        className
      )}
      {...props}
    />
  )
}

export function TypographyLead({ className, ...props }) {
  return (
    <p
      className={cn(
        "text-lg text-foreground/80",
        className
      )}
      {...props}
    />
  )
}

export function TypographySmall({ className, ...props }) {
  return (
    <small
      className={cn(
        "text-sm text-foreground/80",
        className
      )}
      {...props}
    />
  )
}

export function TypographyMuted({ className, ...props }) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function TypographyLabel({ className, ...props }) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-foreground mb-1",
        className
      )}
      {...props}
    />
  )
} 