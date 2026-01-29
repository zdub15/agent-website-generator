"use client";

import {
  Shield,
  Heart,
  Users,
  Plus,
  Smile,
  Eye,
  ArrowRight,
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
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
          >
            Our Services
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Coverage Options for Every Need
          </h2>
          <p className="text-lg text-gray-600">
            From individual health plans to group coverage, I offer a comprehensive
            range of insurance solutions tailored to your unique situation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service) => {
            const Icon = iconMap[service.id] || Shield;
            return (
              <div
                key={service.id}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${primaryColor}10` }}
                >
                  <Icon
                    className="w-8 h-8"
                    style={{ color: primaryColor }}
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-5 leading-relaxed">{service.description}</p>

                <ul className="space-y-3 mb-6">
                  {service.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${secondaryColor}30` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: secondaryColor }}
                        />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
                  style={{ color: primaryColor }}
                >
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
