"use client";

import {
  Shield,
  Heart,
  Users,
  Plus,
  Smile,
  Eye,
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  benefits: string[];
}

interface ServiceCardsProps {
  services: Service[];
  primaryColor: string;
  secondaryColor: string;
}

const iconMap: Record<string, typeof Shield> = {
  "private-ppo": Shield,
  aca: Heart,
  group: Users,
  supplemental: Plus,
  dental: Smile,
  vision: Eye,
};

export function ServiceCards({ services, primaryColor, secondaryColor }: ServiceCardsProps) {
  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Coverage Options for Every Need
          </h2>
          <p className="text-lg text-gray-600">
            From individual health plans to group coverage, I offer a comprehensive
            range of insurance solutions tailored to your unique situation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service) => {
            const Icon = iconMap[service.id] || Shield;
            return (
              <div
                key={service.id}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Icon
                    className="w-7 h-7 transition-colors"
                    style={{ color: primaryColor }}
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-4">{service.description}</p>

                <ul className="space-y-2">
                  {service.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
