import { prisma } from "@/lib/db/memory-store";
import { notFound } from "next/navigation";
import {
  Header,
  HeroSection,
  AgentBioSection,
  ServiceCards,
  StatsSection,
  ProcessFlow,
  TestimonialsSection,
  ContactForm,
  TrustSignals,
  Footer,
} from "@/components/site-template";
import type { AgentProfile } from "@/lib/services/jina-scraper";
import type { GeneratedContent } from "@/lib/services/openai-generator";
import type { Customization } from "@/types/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SitePage({ params }: PageProps) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
  });

  if (!site) {
    notFound();
  }

  const scrapedData = JSON.parse(site.scrapedData) as AgentProfile;
  const generatedContent = site.generatedContent
    ? (JSON.parse(site.generatedContent) as GeneratedContent)
    : null;
  const customization = site.customization
    ? (JSON.parse(site.customization) as Customization)
    : {
        primaryColor: "#003478",
        secondaryColor: "#ffc440",
        accentColor: "#042b2b",
        fontFamily: "Inter",
      };

  // Use generated content or defaults
  const content = generatedContent || {
    headline: "Personalized Health Coverage Made Simple",
    subheadline: `Work with ${scrapedData.name} to find the perfect health insurance plan for you and your family.`,
    enhancedBio: scrapedData.bio,
    services: [
      {
        id: "private-ppo",
        title: "Private PPO Plans",
        description: "Premium health coverage with nationwide provider networks.",
        benefits: ["Choose any doctor", "No referrals needed", "Nationwide coverage"],
      },
      {
        id: "aca",
        title: "ACA/Marketplace",
        description: "Affordable Care Act compliant plans with subsidies.",
        benefits: ["Essential benefits", "Preventive care", "Subsidy eligible"],
      },
      {
        id: "group",
        title: "Group Insurance",
        description: "Coverage solutions for businesses of all sizes.",
        benefits: ["Tax advantages", "Employee retention", "Customizable"],
      },
      {
        id: "supplemental",
        title: "Supplemental Benefits",
        description: "Additional coverage for accidents and critical illness.",
        benefits: ["Cash benefits", "No network", "Affordable"],
      },
      {
        id: "dental",
        title: "Dental Coverage",
        description: "Comprehensive dental plans for the whole family.",
        benefits: ["Preventive 100%", "Large network", "Orthodontic options"],
      },
      {
        id: "vision",
        title: "Vision Plans",
        description: "Quality vision coverage at affordable rates.",
        benefits: ["Annual exams", "Frames & lenses", "Contacts"],
      },
    ],
    testimonials: [
      {
        quote: "Finding the right health insurance was overwhelming until I worked with this team.",
        author: "Sarah M.",
        location: "Miami, FL",
        rating: 5,
      },
      {
        quote: "The personal attention I received was amazing. Highly recommend!",
        author: "Michael R.",
        location: "Dallas, TX",
        rating: 5,
      },
      {
        quote: "Quick, professional, and truly cared about getting me the best coverage.",
        author: "Jennifer L.",
        location: "Phoenix, AZ",
        rating: 5,
      },
    ],
    processSteps: [
      { step: 1, title: "Free Consultation", description: "Schedule a no-obligation call." },
      { step: 2, title: "Personalized Options", description: "Receive customized plan options." },
      { step: 3, title: "Easy Enrollment", description: "Enroll with guided support." },
    ],
    stats: {
      familiesHelped: "150+",
      satisfactionRate: "98%",
      coverageIssued: "$1M+",
    },
  };

  const stats = customization.stats || content.stats;

  return (
    <div className="min-h-screen bg-white">
      <Header
        agentName={scrapedData.name}
        phone={scrapedData.phone}
        primaryColor={customization.primaryColor}
        companyName={scrapedData.companyName}
        companyLogoUrl={scrapedData.companyLogoUrl}
      />

      <HeroSection
        headline={content.headline}
        subheadline={content.subheadline}
        phone={scrapedData.phone}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <ServiceCards
        services={content.services}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <StatsSection
        stats={stats}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <AgentBioSection
        name={scrapedData.name}
        bio={content.enhancedBio}
        headshotUrl={site.headshotUrl}
        stats={stats}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <ProcessFlow
        steps={content.processSteps}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <TestimonialsSection
        testimonials={content.testimonials}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <ContactForm
        agentName={scrapedData.name}
        phone={scrapedData.phone}
        email={scrapedData.email}
        calendlyUrl={site.calendlyUrl}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <TrustSignals
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      />

      <Footer
        agentName={scrapedData.name}
        phone={scrapedData.phone}
        email={scrapedData.email}
        primaryColor={customization.primaryColor}
      />
    </div>
  );
}
