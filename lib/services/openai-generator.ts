import OpenAI from "openai";
import type { AgentProfile } from "./jina-scraper";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  enhancedBio: string;
  services: {
    id: string;
    title: string;
    description: string;
    benefits: string[];
  }[];
  testimonials: {
    quote: string;
    author: string;
    location: string;
    rating: number;
  }[];
  processSteps: {
    step: number;
    title: string;
    description: string;
  }[];
  stats: {
    familiesHelped: string;
    satisfactionRate: string;
    coverageIssued: string;
  };
}

export async function generateSiteContent(profile: AgentProfile): Promise<GeneratedContent> {
  const prompt = `You are an expert insurance marketing copywriter. Generate professional, engaging website content for a health insurance agent.

Agent Information:
- Name: ${profile.name}
- Products: ${profile.products.join(", ")}
- Bio: ${profile.bio}
- Company: ${profile.companyName || "Independent Agent"}

Generate a complete JSON object with the following structure. Make the content warm, professional, and trustworthy. Emphasize personalized service.

Required JSON structure:
{
  "headline": "A compelling 5-8 word headline for the hero section",
  "subheadline": "A 15-25 word supporting statement",
  "enhancedBio": "A 100-150 word professional bio that positions the agent as a trusted expert",
  "services": [
    {
      "id": "private-ppo",
      "title": "Private PPO Plans",
      "description": "40-60 word description",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    },
    {
      "id": "aca",
      "title": "ACA/Marketplace Plans",
      "description": "40-60 word description",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    },
    {
      "id": "group",
      "title": "Group Insurance",
      "description": "40-60 word description",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    },
    {
      "id": "supplemental",
      "title": "Supplemental Benefits",
      "description": "40-60 word description",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    },
    {
      "id": "dental",
      "title": "Dental Coverage",
      "description": "40-60 word description",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    },
    {
      "id": "vision",
      "title": "Vision Plans",
      "description": "40-60 word description",
      "benefits": ["benefit 1", "benefit 2", "benefit 3"]
    }
  ],
  "testimonials": [
    {
      "quote": "A realistic 30-50 word testimonial",
      "author": "First name and last initial",
      "location": "City, State",
      "rating": 5
    }
  ] (generate 5 testimonials),
  "processSteps": [
    {
      "step": 1,
      "title": "Free Consultation",
      "description": "20-30 word description"
    },
    {
      "step": 2,
      "title": "Personalized Options",
      "description": "20-30 word description"
    },
    {
      "step": 3,
      "title": "Easy Enrollment",
      "description": "20-30 word description"
    }
  ],
  "stats": {
    "familiesHelped": "150+",
    "satisfactionRate": "98%",
    "coverageIssued": "$1M+"
  }
}

Return ONLY valid JSON, no markdown or explanation.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert insurance marketing copywriter. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content generated");
    }

    return JSON.parse(content) as GeneratedContent;
  } catch (error) {
    console.error("OpenAI generation error:", error);
    // Return default content if AI fails
    return getDefaultContent(profile);
  }
}

function getDefaultContent(profile: AgentProfile): GeneratedContent {
  return {
    headline: "Personalized Health Coverage Made Simple",
    subheadline: `Work with ${profile.name} to find the perfect health insurance plan for you and your family.`,
    enhancedBio: profile.bio,
    services: [
      {
        id: "private-ppo",
        title: "Private PPO Plans",
        description: "Premium health coverage with nationwide provider networks and comprehensive benefits for individuals and families seeking quality care.",
        benefits: ["Choose any doctor or hospital", "No referrals needed", "Nationwide coverage"],
      },
      {
        id: "aca",
        title: "ACA/Marketplace Plans",
        description: "Affordable Care Act compliant plans with essential health benefits and potential premium subsidies based on your income.",
        benefits: ["Essential health benefits", "Preventive care covered", "Subsidy eligible"],
      },
      {
        id: "group",
        title: "Group Insurance",
        description: "Comprehensive coverage solutions for businesses of all sizes, from startups to established companies.",
        benefits: ["Tax advantages", "Employee retention", "Customizable plans"],
      },
      {
        id: "supplemental",
        title: "Supplemental Benefits",
        description: "Additional coverage including accident, critical illness, and hospital indemnity plans to fill gaps in your primary coverage.",
        benefits: ["Cash benefits", "No network restrictions", "Affordable premiums"],
      },
      {
        id: "dental",
        title: "Dental Coverage",
        description: "Comprehensive dental plans covering preventive care, basic procedures, and major dental work.",
        benefits: ["Preventive care 100% covered", "Large provider network", "Orthodontic options"],
      },
      {
        id: "vision",
        title: "Vision Plans",
        description: "Quality vision coverage including annual exams, glasses, and contact lenses at affordable rates.",
        benefits: ["Annual eye exams", "Frames and lenses", "Contact lens coverage"],
      },
    ],
    testimonials: [
      {
        quote: "Finding the right health insurance was overwhelming until I worked with this team. They made everything simple and found me a plan that fit my budget perfectly.",
        author: "Sarah M.",
        location: "Miami, FL",
        rating: 5,
      },
      {
        quote: "As a small business owner, I needed help finding group coverage for my employees. The process was seamless and my team is now well protected.",
        author: "Michael R.",
        location: "Dallas, TX",
        rating: 5,
      },
      {
        quote: "I was skeptical about private health insurance, but the savings compared to my old plan were incredible. Plus, I have better coverage now!",
        author: "Jennifer L.",
        location: "Phoenix, AZ",
        rating: 5,
      },
      {
        quote: "The personal attention I received was amazing. They took the time to understand my family's needs and found us the perfect plan.",
        author: "David K.",
        location: "Atlanta, GA",
        rating: 5,
      },
      {
        quote: "Quick, professional, and truly cared about getting me the best coverage. Highly recommend to anyone looking for health insurance!",
        author: "Amanda T.",
        location: "Denver, CO",
        rating: 5,
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Free Consultation",
        description: "Schedule a no-obligation call to discuss your coverage needs and budget.",
      },
      {
        step: 2,
        title: "Personalized Options",
        description: "Receive a customized selection of plans tailored to your specific situation.",
      },
      {
        step: 3,
        title: "Easy Enrollment",
        description: "Complete your enrollment with guided support every step of the way.",
      },
    ],
    stats: {
      familiesHelped: "150+",
      satisfactionRate: "98%",
      coverageIssued: "$1M+",
    },
  };
}
