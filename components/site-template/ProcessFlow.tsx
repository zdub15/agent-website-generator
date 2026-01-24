"use client";

import { MessageSquare, FileSearch, FileCheck } from "lucide-react";

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface ProcessFlowProps {
  steps: ProcessStep[];
  primaryColor: string;
  secondaryColor: string;
}

const stepIcons = [MessageSquare, FileSearch, FileCheck];

export function ProcessFlow({ steps, primaryColor, secondaryColor }: ProcessFlowProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Getting the right coverage is simple. Here&apos;s how we&apos;ll work together
            to find your perfect plan.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = stepIcons[index] || MessageSquare;
              return (
                <div key={step.step} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gray-200" />
                  )}

                  <div className="relative bg-white rounded-2xl p-8 shadow-sm text-center">
                    {/* Step number */}
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${secondaryColor}30` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>

                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
