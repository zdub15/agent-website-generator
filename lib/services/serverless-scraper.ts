import { processHeadshotImage } from "./image-downloader";

// Chromium version to use - must match @sparticuz/chromium-min package version
// Check https://github.com/Sparticuz/chromium/releases for available versions
const CHROMIUM_VERSION = "143.0.4";

/**
 * Scrape the headshot image from a ushagent.com profile using serverless Puppeteer
 * Uses @sparticuz/chromium-min which downloads Chromium from GitHub CDN (free, no limits)
 */
export async function scrapeHeadshotServerless(
  profileUrl: string,
  slug: string
): Promise<string | null> {
  console.log("Attempting serverless Puppeteer scrape for:", profileUrl);

  let browser = null;

  try {
    // Dynamic imports to avoid bundling issues
    const puppeteerCore = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium-min");

    // Detect architecture - Vercel can run on x64 or arm64
    const arch = process.arch === "arm64" ? "arm64" : "x64";
    console.log("Detected architecture:", arch);

    // Get the executable path - downloads from GitHub CDN if needed
    const executablePath = await chromium.default.executablePath(
      `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-pack.${arch}.tar`
    );

    console.log("Launching browser with executable:", executablePath);

    browser = await puppeteerCore.default.launch({
      args: [
        ...chromium.default.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
      defaultViewport: {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
      },
      executablePath,
      headless: "shell", // Use shell mode for faster startup (recommended for serverless)
    });

    const page = await browser.newPage();

    // Set a user agent to appear more like a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to:", profileUrl);
    await page.goto(profileUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait a bit for any lazy-loaded images
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Try to find the profile image using multiple selectors
    const imageSelectors = [
      "#ContentPlaceHolder1_PAWdata_imgPersonalPic",
      "img[id*='PersonalPic']",
      "img[id*='profilePic']",
      "img[id*='ProfilePic']",
      ".agent-photo img",
      ".profile-image img",
      "img.headshot",
      "img.profile-photo",
    ];

    let imageUrl: string | null = null;
    let base64Data: string | null = null;

    for (const selector of imageSelectors) {
      try {
        const imgElement = await page.$(selector);
        if (imgElement) {
          const src = await imgElement.evaluate((el) => el.getAttribute("src"));
          if (src) {
            // Handle base64 data URLs - this is what ushagent.com uses!
            if (src.startsWith("data:image/")) {
              console.log(`Found base64 image with selector "${selector}"`);
              base64Data = src;
              break;
            }
            // Skip blob URLs
            if (src.includes("blob:")) {
              continue;
            }
            // Make URL absolute if relative
            if (src.startsWith("/")) {
              const urlObj = new URL(profileUrl);
              imageUrl = `${urlObj.origin}${src}`;
            } else if (src.startsWith("http")) {
              imageUrl = src;
            } else {
              const urlObj = new URL(profileUrl);
              imageUrl = `${urlObj.origin}/${src}`;
            }
            console.log(`Found image with selector "${selector}":`, imageUrl);
            break;
          }
        }
      } catch (e) {
        // Selector not found, try next
        continue;
      }
    }

    // If no image found via selectors, try to find any large image (including base64)
    if (!imageUrl && !base64Data) {
      console.log("No image found via selectors, searching for large images...");

      const images = await page.$$eval("img", (imgs) =>
        imgs
          .filter((img) => {
            const src = img.getAttribute("src") || "";
            const width = img.naturalWidth || img.width || 0;
            const height = img.naturalHeight || img.height || 0;
            // Include base64 images if they're large enough
            const isBase64 = src.startsWith("data:image/");
            const isValidUrl = !src.includes("logo") &&
              !src.includes("icon") &&
              !src.includes(".svg") &&
              !src.includes(".gif") &&
              !src.includes("blob:");
            return (
              src &&
              (isBase64 || isValidUrl) &&
              width > 100 &&
              height > 100
            );
          })
          .map((img) => ({
            src: img.getAttribute("src"),
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          }))
      );

      if (images.length > 0) {
        // Sort by size and pick the largest
        images.sort((a, b) => (b.width * b.height) - (a.width * a.height));
        const largestImage = images[0];
        if (largestImage.src) {
          if (largestImage.src.startsWith("data:image/")) {
            console.log("Found large base64 image");
            base64Data = largestImage.src;
          } else if (largestImage.src.startsWith("/")) {
            const urlObj = new URL(profileUrl);
            imageUrl = `${urlObj.origin}${largestImage.src}`;
          } else if (largestImage.src.startsWith("http")) {
            imageUrl = largestImage.src;
          }
          console.log("Found largest image:", imageUrl || "base64 data");
        }
      }
    }

    await browser.close();
    browser = null;

    // Handle base64 image data
    if (base64Data) {
      console.log("Processing base64 image data with sharp...");

      // Extract the base64 content (format: data:image/png;base64,xxxxx)
      const base64Match = base64Data.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
      if (!base64Match) {
        console.log("Invalid base64 data format");
        return null;
      }

      const base64Content = base64Match[2];
      const buffer = Buffer.from(base64Content, "base64");

      console.log("Base64 image decoded:", buffer.length, "bytes");

      if (buffer.length < 5000) {
        console.log("Base64 image too small:", buffer.length, "bytes");
        return null;
      }

      // Use processHeadshotImage for cropping, upscaling, and quality enhancement
      const processedUrl = await processHeadshotImage(buffer, slug);
      if (processedUrl) {
        console.log("Base64 headshot processed and saved:", processedUrl);
        return processedUrl;
      }
      return null;
    }

    if (!imageUrl) {
      console.log("No valid image found on page");
      return null;
    }

    // Download and save the image from URL
    console.log("Downloading image:", imageUrl);

    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/*",
        Referer: profileUrl,
      },
    });

    if (!imageResponse.ok) {
      console.error("Failed to download image:", imageResponse.status);
      return null;
    }

    const contentType = imageResponse.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      console.log("Response is not an image:", contentType);
      return null;
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 5000) {
      console.log("Image too small:", buffer.length, "bytes");
      return null;
    }

    console.log("Downloaded image:", buffer.length, "bytes");

    // Use processHeadshotImage for cropping, upscaling, and quality enhancement
    const processedUrl = await processHeadshotImage(buffer, slug);
    if (processedUrl) {
      console.log("URL headshot processed and saved:", processedUrl);
      return processedUrl;
    }

    // Fallback: return original URL if processing fails
    return imageUrl;
  } catch (error) {
    console.error("Serverless Puppeteer scraping error:", error);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close errors
      }
    }
  }
}
