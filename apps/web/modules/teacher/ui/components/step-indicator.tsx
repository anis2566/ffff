"use client";

import { Check, LucideIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

interface Step {
  title: string;
  icon: LucideIcon;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between relative">
      {/* Connecting Line */}
      <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200">
        <div
          className="h-full bg-indigo-600 transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const IconComponent = index < currentStep ? Check : step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex flex-col items-center relative">
            {/* Step Circle */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out z-10 bg-sidebar dark:bg-sidebar border-2 border-muted dark:border-muted",
                isActive &&
                  "bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 dark:border-indigo-600 scale-110",
                isCompleted &&
                  "bg-green-600 dark:bg-green-600 text-white dark:border-green-600 border-green-600",
                !isActive &&
                  !isCompleted &&
                  "bg-gray-100 text-gray-400 border-gray-200"
              )}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Step Title */}
            <div className="hidden md:block mt-3 text-center">
              <p
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isActive && "text-indigo-600 dark:text-indigo-600",
                  isCompleted ? "text-green-600" : "text-gray-500"
                )}
              >
                {step.title}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
