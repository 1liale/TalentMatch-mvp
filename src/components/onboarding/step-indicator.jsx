"use client";

export default function StepIndicator({ currentStep, totalSteps = 4 }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }).map((_, step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step + 1}
            </div>
            {step < totalSteps - 1 && (
              <div
                className={`w-8 h-1 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 