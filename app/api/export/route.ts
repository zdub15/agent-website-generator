import { NextResponse } from "next/server";
import { generateStaticHtml } from "@/lib/services/site-exporter";
import { prisma } from "@/lib/db/memory-store";

export async function POST(request: Request) {
  try {
    const { siteId } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Get site info for filename
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Generate HTML
    const html = await generateStaticHtml(siteId);

    // Return as downloadable HTML file
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${site.slug}-website.html"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export site" },
      { status: 500 }
    );
  }
}
