"use client";

import { Shield, Award, CheckCircle, MapPin } from "lucide-react";

interface TrustSignalsProps {
  primaryColor: string;
  secondaryColor: string;
}

export function TrustSignals({ primaryColor, secondaryColor }: TrustSignalsProps) {
  const carriers = [
    "USHEALTH Group",
    "Freedom Life",
    "National Foundation Life",
    "Enterprise Life",
  ];

  const trustPoints = [
    {
      icon: Shield,
      title: "Licensed & Certified",
      description: "Fully licensed insurance professional",
    },
    {
      icon: Award,
      title: "Top-Rated Agent",
      description: "Recognized for excellence in service",
    },
    {
      icon: CheckCircle,
      title: "Verified Credentials",
      description: "NPN registered with state authorities",
    },
    {
      icon: MapPin,
      title: "Multi-State Licensed",
      description: "Serving clients across multiple states",
    },
  ];

  return (
    <section className="py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Trust Points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{point.title}</h4>
                  <p className="text-sm text-gray-500">{point.description}</p>
                </div>
              );
            })}
          </div>

          {/* Carrier Logos */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">Partnered with trusted carriers</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {carriers.map((carrier, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-gray-50 rounded-lg text-gray-600 font-medium"
                >
                  {carrier}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
