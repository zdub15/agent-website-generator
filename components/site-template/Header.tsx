"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface HeaderProps {
  agentName: string;
  phone: string | null;
  primaryColor: string;
  companyName?: string | null;
  companyLogoUrl?: string | null;
}

export function Header({ agentName, phone, primaryColor, companyName, companyLogoUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {companyLogoUrl ? (
            <Image
              src={companyLogoUrl}
              alt={companyName || "Company Logo"}
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
              unoptimized={companyLogoUrl.startsWith("http")}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {agentName.charAt(0)}
            </div>
          )}
          {!companyLogoUrl && (
            <span className="font-semibold text-lg text-gray-800">{agentName}</span>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#services" className="text-gray-600 hover:text-gray-900 transition">
            Services
          </a>
          <a href="#about" className="text-gray-600 hover:text-gray-900 transition">
            About
          </a>
          <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">
            Testimonials
          </a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d]/g, "")}`}
              className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">{phone}</span>
            </a>
          )}
          <Button
            style={{ backgroundColor: primaryColor }}
            className="text-white hover:opacity-90"
            asChild
          >
            <a href="#contact">Get a Quote</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
