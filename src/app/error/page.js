'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { TypographyP } from "@/components/ui/typography"

export default function Error({ error }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center text-2xl">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <TypographyP className="text-center text-muted-foreground">
            {error?.message || "We encountered an unexpected error or the page you are looking for does not exist."}
          </TypographyP>

        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={() => router.push('/')} className="w-full" variant="default">
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}