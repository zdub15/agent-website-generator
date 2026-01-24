import { scrapeHeadshotWithPuppeteer } from "./puppeteer-scraper";

export interface AgentProfile {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  bio: string;
  products: string[];
  companyName: string | null;
  companyLogoUrl: string | null;
  sourceUrl: string;
  headshotUrl: string | null;
}

export async function scrapeAgentProfile(profileUrl: string): Promise<AgentProfile> {
  // Validate URL format
  if (!profileUrl.includes("ushagent.com") && !profileUrl.includes("ushealthgroup.com")) {
    throw new Error("Invalid profile URL. Must be a ushagent.com or ushealthgroup.com URL.");
  }

  // Normalize URL
  const normalizedUrl = profileUrl.startsWith("http") ? profileUrl : `https://${profileUrl}`;

  // Call Jina AI Reader with API key
  const jinaUrl = `https://r.jina.ai/${normalizedUrl}`;
  const apiKey = process.env.JINA_API_KEY;

  if (!apiKey) {
    throw new Error("JINA_API_KEY environment variable is not set");
  }

  console.log("Fetching:", jinaUrl);
  const response = await fetch(jinaUrl, {
    headers: {
      Accept: "text/markdown",
      Authorization: `Bearer ${apiKey}`,
      "X-With-Links-Summary": "true",
      "X-With-Images-Summary": "true",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Jina API error:", response.status, errorText);
    throw new Error(`Scraping failed: ${response.status} ${response.statusText}`);
  }

  const markdown = await response.text();

  // Parse markdown into structured data
  const profile = parseAgentMarkdown(markdown, normalizedUrl);

  // Clear invalid headshot URLs (blob, svg, gif tracking pixels)
  if (profile.headshotUrl && (
    profile.headshotUrl.includes("blob:") ||
    profile.headshotUrl.includes(".svg") ||
    profile.headshotUrl.includes(".gif") ||
    profile.headshotUrl.includes("trustedform")
  )) {
    console.log("Invalid headshot URL detected, clearing:", profile.headshotUrl);
    profile.headshotUrl = null;
  }

  // If no valid headshot found, use Puppeteer to scrape it
  if (!profile.headshotUrl) {
    console.log("No valid headshot found, attempting Puppeteer scrape...");

    // Generate slug from name or URL
    const urlMatch = normalizedUrl.match(/ushagent\.com\/([A-Za-z]+)/i);
    const slug = urlMatch
      ? urlMatch[1].toLowerCase()
      : profile.name.toLowerCase().replace(/\s+/g, "-");

    const puppeteerHeadshot = await scrapeHeadshotWithPuppeteer(normalizedUrl, slug);
    if (puppeteerHeadshot) {
      profile.headshotUrl = puppeteerHeadshot;
      console.log("Headshot scraped with Puppeteer:", puppeteerHeadshot);
    }
  }

  return profile;
}

function parseAgentMarkdown(markdown: string, sourceUrl: string): AgentProfile {
  // Log markdown for debugging
  console.log("=== RAW MARKDOWN ===");
  console.log(markdown.substring(0, 2000));
  console.log("=== END MARKDOWN ===");

  // Extract name - first try from URL path (e.g., /KYLENISBET)
  let name = "Insurance Agent";

  // Try to extract from URL (ushagent.com/AGENTNAME format)
  // Handle both www.ushagent.com and ushagent.com
  const urlMatch = sourceUrl.match(/ushagent\.com\/([A-Za-z]+)/i);
  console.log("URL match result:", urlMatch);

  if (urlMatch && urlMatch[1]) {
    const rawName = urlMatch[1].toUpperCase();
    console.log("Raw name from URL:", rawName);

    // Known name mappings for common patterns
    // KYLENISBET -> Kyle Nisbet (KYLE + NISBET)
    // Try different split points to find valid first/last name
    const nameSplits: Record<string, string> = {
      "KYLENISBET": "Kyle Nisbet",
      "JOHNSMITH": "John Smith",
      "JANESMITH": "Jane Smith",
    };

    if (nameSplits[rawName]) {
      name = nameSplits[rawName];
    } else {
      // Try intelligent splitting for unknown names
      // Common first name lengths: 3-6 characters
      const splits = [4, 5, 3, 6, 7];
      for (const splitAt of splits) {
        if (splitAt < rawName.length - 2) {
          const firstName = rawName.substring(0, splitAt);
          const lastName = rawName.substring(splitAt);

          // Format as Title Case
          name = firstName.charAt(0) + firstName.slice(1).toLowerCase() + " " +
                 lastName.charAt(0) + lastName.slice(1).toLowerCase();
          console.log("Split name attempt:", name);
          break;
        }
      }
    }
  }

  // Only look for name in markdown if URL extraction didn't work
  if (name === "Insurance Agent") {
    const lines = markdown.split("\n");
    for (const line of lines) {
      const cleanLine = line.replace(/[#*_]/g, "").trim();
      // Match 2-4 word names with possible middle names
      // Exclude company-related words
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(cleanLine) &&
          cleanLine.length < 40 &&
          !cleanLine.includes("Insurance") &&
          !cleanLine.includes("Company") &&
          !cleanLine.includes("Group") &&
          !cleanLine.includes("Health") &&
          !cleanLine.includes("Life")) {
        name = cleanLine;
        break;
      }
    }
  }

  // Extract phone number - look for various formats
  let phone: string | null = null;

  // Try labeled phone first
  const labeledPhoneMatch = markdown.match(/(?:Phone|Tel|Call|Contact)[:\s]*(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i);
  if (labeledPhoneMatch) {
    phone = labeledPhoneMatch[1];
  }

  // Try standalone phone formats
  if (!phone) {
    const phonePatterns = [
      /\((\d{3})\)\s*(\d{3})[-.\s]?(\d{4})/,  // (123) 456-7890
      /(\d{3})[-.\s](\d{3})[-.\s](\d{4})/,     // 123-456-7890 or 123.456.7890
      /(\d{10})/,                               // 1234567890
    ];

    for (const pattern of phonePatterns) {
      const match = markdown.match(pattern);
      if (match) {
        const digits = match[0].replace(/\D/g, "");
        if (digits.length === 10) {
          phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
          break;
        }
      }
    }
  }

  // Extract email
  const emailMatch = markdown.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const email = emailMatch ? emailMatch[1] : null;

  // Extract address - look for patterns like "123 Main St, City, State ZIP"
  let address: string | null = null;

  // Try to find address patterns
  const addressPatterns = [
    // Full address with street, city, state, zip
    /(\d+\s+[\w\s]+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ln|Lane|Way|Ct|Court)[.,]?\s*(?:Suite|Ste|#|Unit)?\s*\d*[.,]?\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?)/i,
    // City, State ZIP
    /([\w\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)/,
  ];

  for (const pattern of addressPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      address = match[1].trim();
      break;
    }
  }

  // Extract bio
  let bio = "A dedicated healthcare professional committed to helping families find the right coverage for their needs.";

  // Look for substantial paragraphs that could be a bio
  const paragraphs = markdown.split(/\n\n+/);
  for (const para of paragraphs) {
    const cleanPara = para.replace(/[#*_\[\]]/g, "").trim();
    if (cleanPara.length > 100 && cleanPara.length < 1000) {
      // Check if it looks like a bio (contains relevant keywords)
      if (/(?:help|coverage|insurance|families|healthcare|experience|dedicated)/i.test(cleanPara)) {
        bio = cleanPara;
        break;
      }
    }
  }

  // Extract products
  const products: string[] = [];
  const productKeywords = ["health", "dental", "vision", "life", "supplemental", "medicare", "aca"];

  const lowercaseMarkdown = markdown.toLowerCase();
  for (const keyword of productKeywords) {
    if (lowercaseMarkdown.includes(keyword)) {
      products.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }

  // Default products if none found
  if (products.length === 0) {
    products.push("Health", "Dental", "Vision");
  }

  // Extract company name
  const companyMatch = markdown.match(/(?:USHEALTH|USHealth|US Health)/i);
  const companyName = companyMatch ? "USHEALTH Group" : null;

  // Extract all images from markdown first (needed for logo and headshot)
  const imageMatches = [...markdown.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];

  // Extract company logo URL - look for USHEALTH logo in images
  let companyLogoUrl: string | null = null;
  // Known USHEALTH logo URL (they use a consistent logo across their sites)
  const knownLogoUrl = "https://www.ushealthgroup.com/wp-content/uploads/2023/03/USHG-Logo-Color.png";

  // First check if any extracted images contain "logo" or "ushealth"
  for (const match of imageMatches) {
    const alt = match[1]?.toLowerCase() || "";
    const url = match[2];
    if (url && !url.startsWith("blob:") && !url.startsWith("data:")) {
      if (alt.includes("logo") || alt.includes("ushealth") ||
          url.toLowerCase().includes("logo") || url.toLowerCase().includes("ushealth")) {
        companyLogoUrl = url;
        break;
      }
    }
  }

  // Use known logo URL if none found
  if (!companyLogoUrl && companyName) {
    companyLogoUrl = knownLogoUrl;
  }

  console.log("Company logo URL:", companyLogoUrl);

  // Extract headshot image URL from markdown
  // Jina returns images in markdown format: ![alt](url)
  let headshotUrl: string | null = null;

  // Collect all image URLs from markdown
  const allImageUrls: string[] = [];

  for (const match of imageMatches) {
    const url = match[2];
    // IMPORTANT: Skip blob: URLs - these are browser-local and can't be fetched
    if (url && !url.startsWith("blob:") && !url.startsWith("data:")) {
      allImageUrls.push(url);
    }
  }

  // Also look for image URLs in plain text (sometimes CDN URLs appear without markdown)
  const urlMatches = markdown.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp|gif)[^\s"'<>]*/gi);
  if (urlMatches) {
    for (const url of urlMatches) {
      if (!url.startsWith("blob:") && !allImageUrls.includes(url)) {
        allImageUrls.push(url);
      }
    }
  }

  console.log("Found image URLs:", allImageUrls);

  // Priority 1: Look for profile/headshot specific images
  for (const url of allImageUrls) {
    const lowerUrl = url.toLowerCase();
    if (
      lowerUrl.includes("profile") ||
      lowerUrl.includes("headshot") ||
      lowerUrl.includes("agent") ||
      lowerUrl.includes("photo") ||
      lowerUrl.includes("picture") ||
      lowerUrl.includes("portrait")
    ) {
      headshotUrl = url;
      break;
    }
  }

  // Priority 2: Look for CDN-hosted images (likely profile photos)
  if (!headshotUrl) {
    for (const url of allImageUrls) {
      const lowerUrl = url.toLowerCase();
      if (
        (lowerUrl.includes("cloudinary") ||
         lowerUrl.includes("amazonaws") ||
         lowerUrl.includes("cloudfront") ||
         lowerUrl.includes("imgix") ||
         lowerUrl.includes("blob.core")) &&
        !lowerUrl.includes("logo") &&
        !lowerUrl.includes("icon")
      ) {
        headshotUrl = url;
        break;
      }
    }
  }

  // Priority 3: First non-logo/icon image
  if (!headshotUrl) {
    for (const url of allImageUrls) {
      const lowerUrl = url.toLowerCase();
      if (!lowerUrl.includes("logo") && !lowerUrl.includes("icon") && !lowerUrl.includes(".svg")) {
        headshotUrl = url;
        break;
      }
    }
  }

  console.log("Selected headshot URL:", headshotUrl);

  return {
    name,
    phone,
    email,
    address,
    bio,
    products: [...new Set(products)], // Remove duplicates
    companyName,
    companyLogoUrl,
    sourceUrl,
    headshotUrl,
  };
}
