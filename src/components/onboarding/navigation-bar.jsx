"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NavigationButtons({ 
  currentStep, 
  isLastStep, 
  canProceed, 
  onNext, 
  onPrevious, 
  onSubmit 
}) {
  return (
    <div className="flex justify-between pt-4">
      {currentStep > 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back
        </Button>
      ) : (
        <div></div> // Empty div to maintain spacing
      )}

      {isLastStep ? (
        <Button
          type="button"
          className="flex items-center gap-2"
          onClick={onSubmit}
          disabled={!canProceed}
        >
          Complete
        </Button>
      ) : (
        <Button
          type="button"
          className="flex items-center gap-2"
          onClick={onNext}
          disabled={!canProceed}
        >
          Continue
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
} 