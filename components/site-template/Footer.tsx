"use client";

import { Phone, Mail, Shield } from "lucide-react";

interface FooterProps {
  agentName: string;
  phone: string | null;
  email: string | null;
  primaryColor: string;
}

export function Footer({ agentName, phone, email, primaryColor }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: primaryColor }} className="text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">{agentName}</span>
              </div>
              <p className="text-white/70 text-sm">
                Your trusted partner for health insurance solutions. Helping
                individuals and families find the coverage they need at prices they
                can afford.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70">
                <li>
                  <a href="#services" className="hover:text-white transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-white transition">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-3">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/[^\d]/g, "")}`}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition"
                    >
                      <Phone className="w-4 h-4" />
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition"
                    >
                      <Mail className="w-4 h-4" />
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>© {currentYear} {agentName}. All rights reserved.</p>
            <p>
              Insurance products are offered through licensed insurance agents.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
