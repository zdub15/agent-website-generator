"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
  agentName: string;
  phone: string | null;
  email: string | null;
  calendlyUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export function ContactForm({
  agentName,
  phone,
  email,
  calendlyUrl,
  primaryColor,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Your Free Quote
            </h2>
            <p className="text-lg text-gray-600">
              Ready to explore your coverage options? Fill out the form below or
              reach out directly. I&apos;ll get back to you within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h3>

              <div className="space-y-4 mb-8">
                {phone && (
                  <a
                    href={`tel:${phone.replace(/[^\d]/g, "")}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Phone className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-semibold text-gray-900">{phone}</div>
                    </div>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Mail className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-semibold text-gray-900">{email}</div>
                    </div>
                  </a>
                )}

                {calendlyUrl && (
                  <a
                    href={calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Calendar className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Schedule</div>
                      <div className="font-semibold text-gray-900">
                        Book a Consultation
                      </div>
                    </div>
                  </a>
                )}
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Why Work With {agentName}?
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    Personalized coverage recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    Compare plans from multiple carriers
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    Ongoing support after enrollment
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    No cost for my services
                  </li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Mail className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600">
                    Your message has been received. I&apos;ll be in touch within 24
                    hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">How Can I Help You?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about your insurance needs..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Send Message
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to be contacted regarding
                    insurance options.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
