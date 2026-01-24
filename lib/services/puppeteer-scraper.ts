import sharp from "sharp";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const HEADSHOT_WIDTH = 800;
const HEADSHOT_HEIGHT = 1000;

// Check if we're on Vercel (production)
const isVercel = process.env.VERCEL === "1";

export async function scrapeHeadshotWithPuppeteer(
  pageUrl: string,
  slug: string
): Promise<string | null> {
  // Skip Puppeteer on Vercel - it doesn't work on serverless functions
  if (isVercel) {
    console.log("Puppeteer scraping disabled on Vercel - headshot must be uploaded manually");
    return null;
  }

  // Dynamically import puppeteer only when needed (not on Vercel)
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch {
    console.log("Puppeteer not available - headshot must be uploaded manually");
    return null;
  }

  let browser;

  try {
    console.log("Launching Puppeteer to scrape headshot from:", pageUrl);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set viewport to ensure consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the page and wait for network to be idle
    console.log("Navigating to page...");
    await page.goto(pageUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the specific agent photo element to load
    // The ushagent.com site loads the photo dynamically with this ID
    console.log("Waiting for agent photo element...");

    // Primary selector - the specific agent photo element
    const agentPhotoSelector = "#ContentPlaceHolder1_PAWdata_imgPersonalPic";

    try {
      await page.waitForSelector(agentPhotoSelector, { timeout: 10000 });
      console.log("Found agent photo element!");
    } catch {
      console.log("Primary selector not found, trying alternatives...");
    }

    // Wait a bit more for the image to be populated with data
    await new Promise((r) => setTimeout(r, 3000));

    // Try to extract the image from the specific element first
    let imageData = await page.evaluate((selector) => {
      const img = document.querySelector(selector) as HTMLImageElement;
      if (img && img.src) {
        return {
          src: img.src,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        };
      }
      return null;
    }, agentPhotoSelector);

    // If not found, try alternative selectors
    if (!imageData || !imageData.src || imageData.src === "data:,") {
      console.log("Trying alternative selectors...");

      const alternativeSelectors = [
        ".agent-image img",
        ".profile-photo img",
        "img.img-responsive[src^='data:image']",
        "img[src^='data:image/png']",
        "img[src^='data:image/jpeg']",
      ];

      for (const selector of alternativeSelectors) {
        imageData = await page.evaluate((sel) => {
          const img = document.querySelector(sel) as HTMLImageElement;
          if (img && img.src && img.src.startsWith("data:image")) {
            return {
              src: img.src,
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
            };
          }
          return null;
        }, selector);

        if (imageData && imageData.src && imageData.src.startsWith("data:image")) {
          console.log(`Found image with selector: ${selector}`);
          break;
        }
      }
    }

    // If still not found, scan all images for the largest base64 image
    if (!imageData || !imageData.src || !imageData.src.startsWith("data:image")) {
      console.log("Scanning all images for base64 data...");

      imageData = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        let bestImg = null;
        let bestArea = 0;

        for (const img of imgs) {
          if (img.src && img.src.startsWith("data:image")) {
            const area = (img.naturalWidth || img.width) * (img.naturalHeight || img.height);
            // Must be a reasonable size (not a tiny icon)
            if (area > bestArea && area > 10000) {
              bestArea = area;
              bestImg = {
                src: img.src,
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height,
              };
            }
          }
        }

        return bestImg;
      });
    }

    if (!imageData || !imageData.src) {
      console.log("No base64 image found in page");
      return null;
    }

    console.log(`Found image: ${imageData.width}x${imageData.height}`);
    console.log(`Image data length: ${imageData.src.length} chars`);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filename = `${slug}-headshot.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Convert base64 to buffer
    let buffer: Buffer;

    if (imageData.src.startsWith("data:")) {
      // Extract base64 data from data URL
      const base64Data = imageData.src.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
      console.log(`Decoded base64 image: ${buffer.length} bytes`);
    } else {
      // It's a regular URL, fetch it
      const response = await fetch(imageData.src);
      if (!response.ok) {
        console.error("Failed to download image:", response.status);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Get original dimensions
    const metadata = await sharp(buffer).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Process and save the image
    let processedImage = sharp(buffer);

    // If image is smaller than target, upscale first
    if (metadata.width && metadata.height) {
      const needsUpscale =
        metadata.width < HEADSHOT_WIDTH || metadata.height < HEADSHOT_HEIGHT;

      if (needsUpscale) {
        const scaleX = HEADSHOT_WIDTH / metadata.width;
        const scaleY = HEADSHOT_HEIGHT / metadata.height;
        const scale = Math.max(scaleX, scaleY) * 1.2; // 20% extra for cropping

        console.log(`Upscaling by ${scale.toFixed(2)}x`);
        processedImage = processedImage.resize(
          Math.round(metadata.width * scale),
          Math.round(metadata.height * scale),
          {
            kernel: sharp.kernel.lanczos3,
            fit: "fill",
          }
        );
      }
    }

    await processedImage
      .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, {
        fit: "cover",
        position: "top",
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({ sigma: 1.0 })
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(filepath);

    console.log("Headshot saved to:", filepath);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error scraping headshot with Puppeteer:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
