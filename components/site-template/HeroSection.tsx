"use client";

import { Phone, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  phone: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export function HeroSection({
  headline,
  subheadline,
  phone,
  primaryColor,
  secondaryColor,
}: HeroSectionProps) {
  return (
    <section
      className="relative py-20 md:py-32"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
              <Shield className="w-4 h-4" />
              Licensed Insurance Professional
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {headline}
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-white/90">{subheadline}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              size="lg"
              className="text-lg px-8 py-6 font-semibold"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
              asChild
            >
              <a href="#contact">Request Free Quote</a>
            </Button>
            {phone && (
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 font-semibold border-white text-white hover:bg-white/10"
                asChild
              >
                <a href={`tel:${phone.replace(/[^\d]/g, "")}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call {phone}
                </a>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: secondaryColor }} />
              <span>No-Obligation Consultation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: secondaryColor }} />
              <span>Compare Multiple Plans</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: secondaryColor }} />
              <span>Expert Guidance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
