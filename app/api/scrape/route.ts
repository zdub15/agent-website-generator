import { NextResponse } from "next/server";
import { scrapeAgentProfile } from "@/lib/services/jina-scraper";

export async function POST(request: Request) {
  try {
    const { profileUrl } = await request.json();

    if (!profileUrl) {
      return NextResponse.json(
        { error: "Profile URL is required" },
        { status: 400 }
      );
    }

    const profile = await scrapeAgentProfile(profileUrl);

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape profile" },
      { status: 500 }
    );
  }
}
