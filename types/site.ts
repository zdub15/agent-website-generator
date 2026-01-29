export interface SiteData {
  agent: {
    name: string;
    phone: string | null;
    email: string | null;
    headshotUrl: string | null;
  };
  content: {
    headline: string;
    subheadline: string;
    bio: string;
  };
  services: {
    id: string;
    title: string;
    description: string;
    benefits: string[];
  }[];
  stats: {
    familiesHelped: string;
    satisfactionRate: string;
    coverageIssued: string;
  };
  processSteps: {
    step: number;
    title: string;
    description: string;
  }[];
  testimonials: {
    quote: string;
    author: string;
    location: string;
    rating: number;
  }[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  integrations: {
    calendlyUrl: string | null;
  };
}

export interface Customization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  stats?: {
    familiesHelped: string;
    satisfactionRate: string;
    coverageIssued: string;
  };
}
