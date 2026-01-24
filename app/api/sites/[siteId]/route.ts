import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/memory-store";

// GET - Get single site
export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({
      site,
      scrapedData: JSON.parse(site.scrapedData),
      generatedContent: site.generatedContent
        ? JSON.parse(site.generatedContent)
        : null,
      customization: site.customization
        ? JSON.parse(site.customization)
        : null,
    });
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}

// PATCH - Update site
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const updates = await request.json();

    // Handle JSON fields
    const data: Record<string, unknown> = {};

    if (updates.customization) {
      data.customization = JSON.stringify(updates.customization);
    }
    if (updates.generatedContent) {
      data.generatedContent = JSON.stringify(updates.generatedContent);
    }
    if (updates.status) {
      data.status = updates.status;
    }
    if (updates.calendlyUrl !== undefined) {
      data.calendlyUrl = updates.calendlyUrl;
    }
    if (updates.headshotUrl !== undefined) {
      data.headshotUrl = updates.headshotUrl;
    }

    const site = await prisma.site.update({
      where: { id: siteId },
      data,
    });

    return NextResponse.json({ success: true, site });
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

// DELETE - Delete site
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    await prisma.site.delete({
      where: { id: siteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
