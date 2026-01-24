import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/memory-store";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Target dimensions for headshot (portrait orientation) - higher res for quality
const HEADSHOT_WIDTH = 800;
const HEADSHOT_HEIGHT = 1000;

// Check if we're on Vercel (production)
const isVercel = process.env.VERCEL === "1";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const siteId = formData.get("siteId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!siteId) {
      return NextResponse.json({ error: "Site ID required" }, { status: 400 });
    }

    // Get site to use slug for filename
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get original image metadata
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    console.log(`Original image: ${originalWidth}x${originalHeight}`);

    // Calculate if we need to upscale
    const needsUpscale = originalWidth < HEADSHOT_WIDTH || originalHeight < HEADSHOT_HEIGHT;

    let processedImage = sharp(buffer);

    if (needsUpscale) {
      // Calculate scale factor needed
      const scaleX = HEADSHOT_WIDTH / originalWidth;
      const scaleY = HEADSHOT_HEIGHT / originalHeight;
      const scale = Math.max(scaleX, scaleY, 1);

      const upscaleWidth = Math.round(originalWidth * scale * 1.2); // 20% extra for cropping
      const upscaleHeight = Math.round(originalHeight * scale * 1.2);

      console.log(`Upscaling to: ${upscaleWidth}x${upscaleHeight}`);

      // Upscale with high-quality Lanczos algorithm
      processedImage = processedImage.resize(upscaleWidth, upscaleHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: "fill",
      });
    }

    // Process to final dimensions with sharpening
    const processedBuffer = await processedImage
      .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, {
        fit: "cover",
        position: "top", // Focus on top of image (where face usually is)
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({
        sigma: 1.0, // Light sharpening to improve clarity
        m1: 1.0,
        m2: 0.5,
      })
      .jpeg({ quality: 95, mozjpeg: true }) // Higher quality JPEG
      .toBuffer();

    const filename = `${site.slug}-headshot.jpg`;
    let headshotUrl: string;

    if (isVercel && process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Use Vercel Blob storage
      console.log("Uploading to Vercel Blob...");
      const blob = await put(filename, processedBuffer, {
        access: "public",
        contentType: "image/jpeg",
      });
      headshotUrl = blob.url;
      console.log("Uploaded to Vercel Blob:", headshotUrl);
    } else {
      // Development: Use local file storage
      if (!existsSync(UPLOADS_DIR)) {
        await mkdir(UPLOADS_DIR, { recursive: true });
      }

      const filepath = path.join(UPLOADS_DIR, filename);
      const fs = await import("fs/promises");
      await fs.writeFile(filepath, processedBuffer);

      headshotUrl = `/uploads/${filename}`;
      console.log(`Saved locally: ${headshotUrl}`);
    }

    console.log(`Saved high-quality headshot: ${HEADSHOT_WIDTH}x${HEADSHOT_HEIGHT}`);

    // Update site with new headshot URL
    await prisma.site.update({
      where: { id: siteId },
      data: { headshotUrl },
    });

    return NextResponse.json({
      success: true,
      headshotUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
