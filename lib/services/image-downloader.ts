import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Target dimensions for headshot (portrait orientation)
const HEADSHOT_WIDTH = 400;
const HEADSHOT_HEIGHT = 500;

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

    // Ensure uploads directory exists
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    console.log("Downloading image:", imageUrl);

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.error("Failed to download image:", response.status);
      return null;
    }

    // Get image data as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename (always save as jpg for consistency)
    const filename = `${slug}-headshot.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Process image with sharp: resize and crop to headshot dimensions
    await sharp(buffer)
      .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, {
        fit: "cover", // Crop to fill the dimensions
        position: "top", // Focus on top of image (usually where face is)
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    console.log("Image processed and saved to:", filepath);

    // Return the public URL path
    return `/uploads/${filename}`;
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
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    const filename = `${slug}-headshot.jpg`;
    const filepath = path.join(UPLOADS_DIR, filename);

    await sharp(inputBuffer)
      .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, {
        fit: "cover",
        position: "top",
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}
