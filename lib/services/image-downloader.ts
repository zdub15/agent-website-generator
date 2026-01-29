import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { put, del, list } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Target dimensions for headshot (portrait orientation) - higher res for quality
const HEADSHOT_WIDTH = 800;
const HEADSHOT_HEIGHT = 1000;

// Check if we're on Vercel (production)
const isVercel = process.env.VERCEL === "1";
const hasBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function downloadAndSaveImage(
  imageUrl: string,
  slug: string
): Promise<string | null> {
  try {
    // Validate URL - skip blob: and data: URLs
    if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
      console.error("Cannot download blob or data URLs:", imageUrl.substring(0, 50));
      return null;
    }

    // If already a Vercel Blob URL, return it as-is
    if (imageUrl.includes("vercel-storage.com") || imageUrl.includes("blob.vercel-storage")) {
      console.log("Image already on Vercel Blob, using directly:", imageUrl);
      return imageUrl;
    }

    console.log("Downloading image:", imageUrl);

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/*",
      },
    });

    if (!response.ok) {
      console.error("Failed to download image:", response.status, response.statusText);
      return null;
    }

    // Get image data as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 1000) {
      console.error("Image too small, likely not a valid image:", buffer.length, "bytes");
      return null;
    }

    console.log("Downloaded image size:", buffer.length, "bytes");

    // Process image with sharp: resize and crop to headshot dimensions
    const processedBuffer = await sharp(buffer)
      .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, {
        fit: "cover",
        position: "top", // Focus on top of image (usually where face is)
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({
        sigma: 1.0,
        m1: 1.0,
        m2: 0.5,
      })
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    const filename = `${slug}-headshot.jpg`;

    if (isVercel && hasBlobStorage) {
      // Production: Use Vercel Blob storage
      console.log("Uploading to Vercel Blob...");

      // Delete existing blob if it exists
      try {
        const { blobs } = await list({ prefix: `headshots/${filename}` });
        if (blobs.length > 0) {
          await del(blobs[0].url);
        }
      } catch {
        // Ignore delete errors
      }

      const blob = await put(`headshots/${filename}`, processedBuffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      });

      console.log("Image uploaded to Vercel Blob:", blob.url);
      return blob.url;
    } else {
      // Development: Use local file storage
      if (!existsSync(UPLOADS_DIR)) {
        await mkdir(UPLOADS_DIR, { recursive: true });
      }

      const filepath = path.join(UPLOADS_DIR, filename);
      const fs = await import("fs/promises");
      await fs.writeFile(filepath, processedBuffer);

      console.log("Image processed and saved locally:", filepath);
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error("Error downloading/processing image:", error);
    return null;
  }
}

// Also export a function to process an already-downloaded image
export async function processHeadshotImage(
  inputBuffer: Buffer,
  slug: string
): Promise<string | null> {
  try {
    const processedBuffer = await sharp(inputBuffer)
      .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, {
        fit: "cover",
        position: "top",
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({
        sigma: 1.0,
        m1: 1.0,
        m2: 0.5,
      })
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    const filename = `${slug}-headshot.jpg`;

    if (isVercel && hasBlobStorage) {
      // Production: Use Vercel Blob storage
      try {
        const { blobs } = await list({ prefix: `headshots/${filename}` });
        if (blobs.length > 0) {
          await del(blobs[0].url);
        }
      } catch {
        // Ignore delete errors
      }

      const blob = await put(`headshots/${filename}`, processedBuffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      });

      return blob.url;
    } else {
      // Development: Use local file storage
      if (!existsSync(UPLOADS_DIR)) {
        await mkdir(UPLOADS_DIR, { recursive: true });
      }

      const filepath = path.join(UPLOADS_DIR, filename);
      const fs = await import("fs/promises");
      await fs.writeFile(filepath, processedBuffer);

      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}
