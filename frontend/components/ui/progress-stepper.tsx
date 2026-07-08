"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-4">
      {/* Mobile progress indicator */}
      <div className="md:hidden flex items-center justify-between mb-4 px-2">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm font-bold text-white">
          {steps[currentStep - 1]}
        </span>
      </div>
      <div className="md:hidden w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out" 
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop horizontal stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 -z-10" />
        <div 
          className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500 ease-in-out" 
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            transformOrigin: "left"
          }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <div key={idx} className="flex flex-col items-center gap-2 px-1 relative bg-bg-card md:px-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105"
                    : isActive
                    ? "bg-white border-white text-black ring-4 ring-primary/20 scale-110"
                    : "bg-bg-elevated border-border text-text-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3px]" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium max-w-[80px] text-center truncate transition-colors duration-300",
                  isActive ? "text-white font-bold" : isCompleted ? "text-primary font-medium" : "text-text-secondary"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
