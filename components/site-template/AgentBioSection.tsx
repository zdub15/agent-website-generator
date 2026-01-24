"use client";

import { User, Award, MapPin } from "lucide-react";

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
            <div className="flex justify-center">
              {headshotUrl ? (
                <img
                  src={headshotUrl}
                  alt={name}
                  className="w-72 h-72 md:w-96 md:h-96 rounded-2xl object-cover shadow-xl"
                />
              ) : (
                <div
                  className="w-72 h-72 md:w-96 md:h-96 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <User
                    className="w-32 h-32"
                    style={{ color: primaryColor }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
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

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {stats.familiesHelped}
                  </div>
                  <div className="text-sm text-gray-500">Families Helped</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {stats.satisfactionRate}
                  </div>
                  <div className="text-sm text-gray-500">Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: primaryColor }}
                  >
                    {stats.coverageIssued}
                  </div>
                  <div className="text-sm text-gray-500">Coverage Issued</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
