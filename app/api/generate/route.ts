import { NextResponse } from "next/server";
import { generateSiteContent } from "@/lib/services/openai-generator";
import { prisma } from "@/lib/db/blob-store";
import type { AgentProfile } from "@/lib/services/jina-scraper";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { siteId, profile } = body;

    if (!siteId || !profile) {
      return NextResponse.json(
        { error: "Site ID and profile are required" },
        { status: 400 }
      );
    }

    // Update site status to generating
    await prisma.site.update({
      where: { id: siteId },
      data: { status: "GENERATING" },
    });

    // Generate content with OpenAI
    const generatedContent = await generateSiteContent(profile as AgentProfile);

    // Update site with generated content
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        generatedContent: JSON.stringify(generatedContent),
        status: "PREVIEW",
      },
    });

    return NextResponse.json({
      success: true,
      site: updatedSite,
      generatedContent,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
