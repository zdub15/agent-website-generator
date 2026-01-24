import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/memory-store";
import { scrapeAgentProfile } from "@/lib/services/jina-scraper";
import { downloadAndSaveImage } from "@/lib/services/image-downloader";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET - List all sites
export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

// POST - Create new site from URL
export async function POST(request: Request) {
  try {
    const { profileUrl } = await request.json();

    if (!profileUrl) {
      return NextResponse.json(
        { error: "Profile URL is required" },
        { status: 400 }
      );
    }

    // Scrape the profile
    const profile = await scrapeAgentProfile(profileUrl);

    // Generate a unique slug
    let slug = generateSlug(profile.name);
    let slugExists = await prisma.site.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(profile.name)}-${counter}`;
      slugExists = await prisma.site.findUnique({ where: { slug } });
      counter++;
    }

    // Download and save headshot image locally (skip if already local)
    let localHeadshotUrl: string | null = null;
    if (profile.headshotUrl) {
      // If already a local path (from Puppeteer scraping), use it directly
      if (profile.headshotUrl.startsWith("/uploads/")) {
        localHeadshotUrl = profile.headshotUrl;
      } else {
        localHeadshotUrl = await downloadAndSaveImage(profile.headshotUrl, slug);
      }
    }

    // Create the site
    const site = await prisma.site.create({
      data: {
        slug,
        sourceUrl: profileUrl,
        scrapedData: JSON.stringify(profile),
        status: "DRAFT",
        headshotUrl: localHeadshotUrl || profile.headshotUrl,
        generatedContent: null,
        calendlyUrl: null,
        customization: JSON.stringify({
          primaryColor: "#003478",
          secondaryColor: "#ffc440",
          accentColor: "#042b2b",
          fontFamily: "Inter",
        }),
      },
    });

    return NextResponse.json({
      success: true,
      site,
      profile,
    });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create site" },
      { status: 500 }
    );
  }
}
