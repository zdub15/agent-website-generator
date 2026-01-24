"use client";

import { Users, ThumbsUp, DollarSign, Clock } from "lucide-react";

interface StatsSectionProps {
  stats: {
    familiesHelped: string;
    satisfactionRate: string;
    coverageIssued: string;
  };
  primaryColor: string;
  secondaryColor: string;
}

export function StatsSection({ stats, primaryColor, secondaryColor }: StatsSectionProps) {
  const statItems = [
    {
      icon: Users,
      value: stats.familiesHelped,
      label: "Families Helped",
    },
    {
      icon: ThumbsUp,
      value: stats.satisfactionRate,
      label: "Client Satisfaction",
    },
    {
      icon: DollarSign,
      value: stats.coverageIssued,
      label: "Coverage Issued",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Support Available",
    },
  ];

  return (
    <section
      className="py-16"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center text-white">
                <div className="flex justify-center mb-3">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  >
                    <Icon className="w-7 h-7" style={{ color: secondaryColor }} />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
