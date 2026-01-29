"use client";

import { Phone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
  agentName: string;
  phone: string | null;
  primaryColor: string;
  companyName?: string | null;
  companyLogoUrl?: string | null;
}

export function Header({ agentName, phone, primaryColor, companyName, companyLogoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {agentName.charAt(0)}
            </div>
          )}
          {!companyLogoUrl && (
            <span className="font-semibold text-lg text-gray-800">{agentName}</span>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Services
          </a>
          <a href="#about" className="text-gray-600 hover:text-gray-900 transition font-medium">
            About
          </a>
          <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Testimonials
          </a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d]/g, "")}`}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <Phone className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="font-semibold text-gray-800">{phone}</span>
            </a>
          )}
          <Button
            style={{ backgroundColor: primaryColor }}
            className="hidden sm:inline-flex text-white hover:opacity-90 shadow-md"
            asChild
          >
            <a href="#contact">Get a Quote</a>
          </Button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a href="#services" className="text-gray-700 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Services
            </a>
            <a href="#about" className="text-gray-700 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              About
            </a>
            <a href="#testimonials" className="text-gray-700 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Testimonials
            </a>
            <a href="#contact" className="text-gray-700 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d]/g, "")}`}
                className="flex items-center gap-2 py-2"
                style={{ color: primaryColor }}
              >
                <Phone className="w-5 h-5" />
                <span className="font-semibold">{phone}</span>
              </a>
            )}
            <Button
              style={{ backgroundColor: primaryColor }}
              className="text-white w-full mt-2"
              asChild
            >
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Get a Quote</a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
