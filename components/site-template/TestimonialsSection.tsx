"use client";

import { Star, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  primaryColor: string;
  secondaryColor: string;
}

export function TestimonialsSection({
  testimonials,
  primaryColor,
  secondaryColor,
}: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-600">
            Don&apos;t just take our word for it. Here&apos;s what families we&apos;ve helped
            have to say about their experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {/* Quote icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <Quote className="w-5 h-5" style={{ color: primaryColor }} />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    fill={i < testimonial.rating ? secondaryColor : "transparent"}
                    style={{
                      color: i < testimonial.rating ? secondaryColor : "#e5e7eb",
                    }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="border-t border-gray-100 pt-4">
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-500">{testimonial.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
