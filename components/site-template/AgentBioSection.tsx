"use client";

import { User, Award, CheckCircle } from "lucide-react";

interface AgentBioSectionProps {
  name: string;
  bio: string;
  headshotUrl: string | null;
  stats: {
    familiesHelped: string;
    satisfactionRate: string;
    coverageIssued: string;
  };
  primaryColor: string;
  secondaryColor: string;
}

export function AgentBioSection({
  name,
  bio,
  headshotUrl,
  stats,
  primaryColor,
  secondaryColor,
}: AgentBioSectionProps) {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image/Avatar */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative">
                {headshotUrl ? (
                  <div className="relative">
                    <img
                      src={headshotUrl}
                      alt={name}
                      className="w-80 h-auto max-h-[500px] rounded-2xl object-cover shadow-2xl"
                    />
                    {/* Decorative elements */}
                    <div
                      className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 -z-10"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div
                      className="absolute -top-4 -left-4 w-16 h-16 rounded-full opacity-20 -z-10"
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-80 h-80 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      }}
                    />
                    <User
                      className="w-32 h-32 relative z-10"
                      style={{ color: primaryColor }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Award className="w-4 h-4" />
                Licensed Insurance Agent
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet {name}
              </h2>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">{bio}</p>

              {/* Trust points */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Personalized coverage recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Compare plans from top carriers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">No-cost consultation services</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="text-center p-4 rounded-xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  <div
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {stats.familiesHelped}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">Families Helped</div>
                </div>
                <div
                  className="text-center p-4 rounded-xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  <div
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {stats.satisfactionRate}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">Satisfaction</div>
                </div>
                <div
                  className="text-center p-4 rounded-xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: `${primaryColor}30` }}
                >
                  <div
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {stats.coverageIssued}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">Coverage Issued</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
