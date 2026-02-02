import { prisma } from "@/lib/db/blob-store";
import type { AgentProfile } from "./jina-scraper";
import type { GeneratedContent } from "./openai-generator";
import type { Customization } from "@/types/site";

interface SiteExportData {
  agent: AgentProfile;
  content: GeneratedContent;
  customization: Customization;
  calendlyUrl: string | null;
  headshotUrl: string | null;
}

function safeJsonParse<T>(data: string | null | undefined): T | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function generateStaticHtml(siteId: string): Promise<string> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });

  if (!site) {
    throw new Error("Site not found");
  }

  const agent = safeJsonParse<AgentProfile>(site.scrapedData);
  if (!agent) {
    throw new Error("Site has corrupted data and cannot be exported");
  }

  const content = safeJsonParse<GeneratedContent>(site.generatedContent) || getDefaultContent(agent);
  const customization = safeJsonParse<Customization>(site.customization) || getDefaultCustomization();

  const data: SiteExportData = {
    agent,
    content,
    customization,
    calendlyUrl: site.calendlyUrl,
    headshotUrl: site.headshotUrl,
  };

  return renderFullHtml(data);
}

function getDefaultCustomization(): Customization {
  return {
    primaryColor: "#003478",
    secondaryColor: "#ffc440",
    accentColor: "#042b2b",
    fontFamily: "Inter",
  };
}

function getDefaultContent(agent: AgentProfile): GeneratedContent {
  return {
    headline: "Personalized Health Coverage Made Simple",
    subheadline: `Work with ${agent.name} to find the perfect health insurance plan.`,
    enhancedBio: agent.bio,
    services: [
      { id: "private-ppo", title: "Private PPO Plans", description: "Premium health coverage with nationwide networks.", benefits: ["Choose any doctor", "No referrals", "Nationwide"] },
      { id: "aca", title: "ACA/Marketplace", description: "Affordable Care Act compliant plans.", benefits: ["Essential benefits", "Subsidies available", "Preventive care"] },
      { id: "group", title: "Group Insurance", description: "Coverage for businesses.", benefits: ["Tax advantages", "Employee retention", "Customizable"] },
      { id: "supplemental", title: "Supplemental", description: "Additional coverage options.", benefits: ["Cash benefits", "No network", "Affordable"] },
      { id: "dental", title: "Dental", description: "Comprehensive dental coverage.", benefits: ["Preventive 100%", "Large network", "Orthodontics"] },
      { id: "vision", title: "Vision", description: "Quality vision coverage.", benefits: ["Annual exams", "Frames", "Contacts"] },
    ],
    testimonials: [
      { quote: "Excellent service!", author: "Sarah M.", location: "Miami, FL", rating: 5 },
      { quote: "Very helpful!", author: "John D.", location: "Dallas, TX", rating: 5 },
      { quote: "Highly recommend!", author: "Lisa K.", location: "Phoenix, AZ", rating: 5 },
    ],
    processSteps: [
      { step: 1, title: "Consultation", description: "Free consultation call" },
      { step: 2, title: "Options", description: "Personalized plan options" },
      { step: 3, title: "Enrollment", description: "Easy enrollment process" },
    ],
    stats: { familiesHelped: "150+", satisfactionRate: "98%", coverageIssued: "$1M+" },
  };
}

function renderFullHtml(data: SiteExportData): string {
  const { agent, content, customization } = data;
  const stats = customization.stats || content.stats;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agent.name} - Health Insurance Professional</title>
  <meta name="description" content="${content.subheadline}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }

    /* Header */
    header { position: sticky; top: 0; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); z-index: 50; }
    header .container { display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
    .logo { display: flex; align-items: center; gap: 0.5rem; }
    .logo-icon { width: 40px; height: 40px; border-radius: 50%; background: ${customization.primaryColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    nav { display: flex; gap: 1.5rem; }
    nav a { color: #4b5563; text-decoration: none; }
    nav a:hover { color: #1f2937; }
    .cta-btn { background: ${customization.primaryColor}; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; }
    .cta-btn:hover { opacity: 0.9; }

    /* Hero */
    .hero { background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.primaryColor}dd 100%); color: white; padding: 5rem 0; text-align: center; }
    .hero h1 { font-size: 3rem; font-weight: 700; margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
    .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .hero-btns .primary { background: ${customization.secondaryColor}; color: ${customization.primaryColor}; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
    .hero-btns .secondary { background: transparent; border: 2px solid white; color: white; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; text-decoration: none; }

    /* Services */
    .services { padding: 5rem 0; }
    .section-title { text-align: center; margin-bottom: 3rem; }
    .section-title h2 { font-size: 2.5rem; color: #1f2937; margin-bottom: 1rem; }
    .section-title p { color: #6b7280; font-size: 1.125rem; max-width: 600px; margin: 0 auto; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .service-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; }
    .service-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #1f2937; }
    .service-card p { color: #6b7280; margin-bottom: 1rem; }
    .service-card ul { list-style: none; }
    .service-card li { color: #6b7280; font-size: 0.875rem; padding: 0.25rem 0; }
    .service-card li::before { content: "•"; color: ${customization.secondaryColor}; margin-right: 0.5rem; }

    /* Stats */
    .stats { background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.primaryColor}dd 100%); color: white; padding: 4rem 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center; }
    .stat-item h3 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .stat-item p { opacity: 0.8; }

    /* About */
    .about { padding: 5rem 0; background: #f9fafb; }
    .about-content { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
    .about-image { width: 100%; height: 400px; background: ${customization.primaryColor}15; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .about-image svg { width: 120px; height: 120px; color: ${customization.primaryColor}; }
    .about-text h2 { font-size: 2rem; margin-bottom: 1rem; color: #1f2937; }
    .about-text p { color: #6b7280; margin-bottom: 2rem; }
    .about-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .about-stat { background: white; padding: 1rem; border-radius: 12px; text-align: center; }
    .about-stat h4 { font-size: 1.5rem; color: ${customization.primaryColor}; }
    .about-stat p { font-size: 0.75rem; color: #6b7280; }

    /* Process */
    .process { padding: 5rem 0; }
    .process-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
    .process-step { text-align: center; padding: 2rem; background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .step-number { width: 40px; height: 40px; background: ${customization.primaryColor}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: 600; }
    .process-step h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .process-step p { color: #6b7280; }

    /* Testimonials */
    .testimonials { padding: 5rem 0; background: white; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .testimonial-card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; }
    .stars { color: ${customization.secondaryColor}; margin-bottom: 1rem; }
    .testimonial-card blockquote { color: #4b5563; margin-bottom: 1rem; font-style: italic; }
    .testimonial-author { font-weight: 600; color: #1f2937; }
    .testimonial-location { color: #6b7280; font-size: 0.875rem; }

    /* Contact */
    .contact { padding: 5rem 0; background: #f9fafb; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    .contact-info h3 { font-size: 1.5rem; margin-bottom: 1rem; }
    .contact-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 12px; margin-bottom: 1rem; text-decoration: none; color: inherit; }
    .contact-item:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .contact-icon { width: 48px; height: 48px; background: ${customization.primaryColor}15; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .contact-icon svg { width: 24px; height: 24px; color: ${customization.primaryColor}; }
    .contact-form { background: white; padding: 2rem; border-radius: 16px; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: inherit; }
    .form-group textarea { min-height: 100px; resize: vertical; }
    .submit-btn { width: 100%; background: ${customization.primaryColor}; color: white; padding: 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; }
    .submit-btn:hover { opacity: 0.9; }

    /* Footer */
    footer { background: ${customization.primaryColor}; color: white; padding: 3rem 0; }
    .footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { color: rgba(255,255,255,0.7); text-decoration: none; }
    .footer-links a:hover { color: white; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      nav { display: none; }
      .about-content, .contact-grid { grid-template-columns: 1fr; }
      .about-image { height: 250px; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="container">
      <div class="logo">
        <div class="logo-icon">${agent.name.charAt(0)}</div>
        <span style="font-weight: 600;">${agent.name}</span>
      </div>
      <nav>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#testimonials">Testimonials</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#contact" class="cta-btn">Get a Quote</a>
    </div>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <h1>${content.headline}</h1>
      <p>${content.subheadline}</p>
      <div class="hero-btns">
        <a href="#contact" class="primary">Request Free Quote</a>
        ${agent.phone ? `<a href="tel:${agent.phone.replace(/[^\d]/g, "")}" class="secondary">📞 Call ${agent.phone}</a>` : ""}
      </div>
    </div>
  </section>

  <!-- Services -->
  <section class="services" id="services">
    <div class="container">
      <div class="section-title">
        <h2>Coverage Options for Every Need</h2>
        <p>From individual health plans to group coverage, I offer comprehensive insurance solutions tailored to your unique situation.</p>
      </div>
      <div class="services-grid">
        ${content.services.map((service) => `
          <div class="service-card">
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <ul>
              ${service.benefits.map((b) => `<li>${b}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-item">
          <h3>${stats.familiesHelped}</h3>
          <p>Families Helped</p>
        </div>
        <div class="stat-item">
          <h3>${stats.satisfactionRate}</h3>
          <p>Client Satisfaction</p>
        </div>
        <div class="stat-item">
          <h3>${stats.coverageIssued}</h3>
          <p>Coverage Issued</p>
        </div>
        <div class="stat-item">
          <h3>24/7</h3>
          <p>Support Available</p>
        </div>
      </div>
    </div>
  </section>

  <!-- About -->
  <section class="about" id="about">
    <div class="container">
      <div class="about-content">
        <div class="about-image">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="about-text">
          <h2>Meet ${agent.name}</h2>
          <p>${content.enhancedBio}</p>
          <div class="about-stats">
            <div class="about-stat">
              <h4>${stats.familiesHelped}</h4>
              <p>Families Helped</p>
            </div>
            <div class="about-stat">
              <h4>${stats.satisfactionRate}</h4>
              <p>Satisfaction</p>
            </div>
            <div class="about-stat">
              <h4>${stats.coverageIssued}</h4>
              <p>Coverage Issued</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Process -->
  <section class="process">
    <div class="container">
      <div class="section-title">
        <h2>How It Works</h2>
        <p>Getting the right coverage is simple. Here's how we'll work together.</p>
      </div>
      <div class="process-grid">
        ${content.processSteps.map((step) => `
          <div class="process-step">
            <div class="step-number">${step.step}</div>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="testimonials" id="testimonials">
    <div class="container">
      <div class="section-title">
        <h2>What Our Clients Say</h2>
        <p>Don't just take our word for it. Here's what families we've helped have to say.</p>
      </div>
      <div class="testimonials-grid">
        ${content.testimonials.map((t) => `
          <div class="testimonial-card">
            <div class="stars">${"★".repeat(t.rating)}</div>
            <blockquote>"${t.quote}"</blockquote>
            <div class="testimonial-author">${t.author}</div>
            <div class="testimonial-location">${t.location}</div>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- Contact -->
  <section class="contact" id="contact">
    <div class="container">
      <div class="section-title">
        <h2>Get Your Free Quote</h2>
        <p>Ready to explore your coverage options? Fill out the form or reach out directly.</p>
      </div>
      <div class="contact-grid">
        <div class="contact-info">
          <h3>Contact Information</h3>
          ${agent.phone ? `
            <a href="tel:${agent.phone.replace(/[^\d]/g, "")}" class="contact-item">
              <div class="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #6b7280;">Phone</div>
                <div style="font-weight: 600;">${agent.phone}</div>
              </div>
            </a>
          ` : ""}
          ${agent.email ? `
            <a href="mailto:${agent.email}" class="contact-item">
              <div class="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #6b7280;">Email</div>
                <div style="font-weight: 600;">${agent.email}</div>
              </div>
            </a>
          ` : ""}
        </div>
        <div class="contact-form">
          <form>
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Smith" required>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" required>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="(555) 123-4567" required>
            </div>
            <div class="form-group">
              <label>How Can I Help You?</label>
              <textarea placeholder="Tell me about your insurance needs..."></textarea>
            </div>
            <button type="submit" class="submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="footer-content">
        <p>© ${new Date().getFullYear()} ${agent.name}. All rights reserved.</p>
        <div class="footer-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
