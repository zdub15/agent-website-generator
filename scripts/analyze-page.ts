/**
 * Diagnostic script to analyze ushagent.com page structure
 * and understand how agent photos are loaded
 */

import puppeteer from "puppeteer";

async function analyzePage() {
  const url = "https://www.ushagent.com/KYLENISBET";

  console.log("=".repeat(60));
  console.log("ANALYZING PAGE:", url);
  console.log("=".repeat(60));

  const browser = await puppeteer.launch({
    headless: false, // Show browser for visual inspection
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Log all network requests for images
  const imageRequests: string[] = [];
  page.on("response", async (response) => {
    const url = response.url();
    const contentType = response.headers()["content-type"] || "";
    if (contentType.includes("image") ||
        url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)) {
      imageRequests.push(url);
    }
  });

  console.log("\n[1] Navigating to page...");
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Wait for any lazy loading
  console.log("[2] Waiting for dynamic content...");
  await new Promise(r => setTimeout(r, 5000));

  // Scroll down to trigger lazy loading
  console.log("[3] Scrolling to trigger lazy loading...");
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 1000));

  // Log all image network requests
  console.log("\n[4] IMAGE NETWORK REQUESTS:");
  console.log("-".repeat(60));
  for (const imgUrl of imageRequests) {
    console.log("  ", imgUrl.substring(0, 100));
  }

  // Find all img elements
  console.log("\n[5] ALL IMG ELEMENTS IN DOM:");
  console.log("-".repeat(60));
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.map((img, index) => ({
      index,
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      className: img.className,
      id: img.id,
      parentClass: img.parentElement?.className || "",
      isVisible: img.offsetParent !== null,
    }));
  });

  for (const img of images) {
    if (img.src && !img.src.includes("data:") && img.width > 50) {
      console.log(`\n  [${img.index}] ${img.src.substring(0, 80)}`);
      console.log(`      Size: ${img.width}x${img.height}`);
      console.log(`      Alt: "${img.alt}"`);
      console.log(`      Class: "${img.className}"`);
      console.log(`      Parent: "${img.parentClass}"`);
      console.log(`      Visible: ${img.isVisible}`);
    }
  }

  // Find background images
  console.log("\n[6] ELEMENTS WITH BACKGROUND IMAGES:");
  console.log("-".repeat(60));
  const bgImages = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("*"));
    const results: { selector: string; bgImage: string }[] = [];

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== "none" && !bgImage.includes("gradient")) {
        results.push({
          selector: el.tagName + (el.className ? "." + el.className.split(" ").join(".") : ""),
          bgImage: bgImage.substring(0, 100),
        });
      }
    }
    return results;
  });

  for (const bg of bgImages) {
    console.log(`  ${bg.selector}`);
    console.log(`    -> ${bg.bgImage}`);
  }

  // Look for specific agent-related elements
  console.log("\n[7] SEARCHING FOR AGENT-RELATED ELEMENTS:");
  console.log("-".repeat(60));

  const agentSelectors = [
    ".agent",
    ".profile",
    ".photo",
    ".headshot",
    ".portrait",
    "#agent",
    "#profile",
    "[class*='agent']",
    "[class*='profile']",
    "[class*='photo']",
    "[id*='agent']",
    "[id*='profile']",
  ];

  for (const selector of agentSelectors) {
    try {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`\n  Found ${elements.length} element(s) for: ${selector}`);
        for (const el of elements) {
          const info = await el.evaluate((e) => ({
            tag: e.tagName,
            className: e.className,
            id: e.id,
            innerHTML: e.innerHTML.substring(0, 200),
          }));
          console.log(`    <${info.tag}> class="${info.className}" id="${info.id}"`);
        }
      }
    } catch {
      // Selector didn't match
    }
  }

  // Take a screenshot
  console.log("\n[8] Taking screenshot...");
  await page.screenshot({
    path: "c:\\Users\\Zayne\\OneDrive\\Documents\\Anti-Gravity Projects\\Insurance Agents\\debug-screenshot.png",
    fullPage: true,
  });
  console.log("  Saved to debug-screenshot.png");

  // Get page HTML for analysis
  console.log("\n[9] Saving page HTML...");
  const html = await page.content();
  const fs = await import("fs/promises");
  await fs.writeFile(
    "c:\\Users\\Zayne\\OneDrive\\Documents\\Anti-Gravity Projects\\Insurance Agents\\debug-page.html",
    html
  );
  console.log("  Saved to debug-page.html");

  // Check for iframes that might contain the agent photo
  console.log("\n[10] CHECKING FOR IFRAMES:");
  console.log("-".repeat(60));
  const iframes = await page.$$("iframe");
  console.log(`  Found ${iframes.length} iframe(s)`);

  for (let i = 0; i < iframes.length; i++) {
    const src = await iframes[i].evaluate((el) => el.src);
    console.log(`  [${i}] ${src}`);
  }

  // Look for any data attributes that might contain image URLs
  console.log("\n[11] DATA ATTRIBUTES WITH URLS:");
  console.log("-".repeat(60));
  const dataUrls = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("[data-src], [data-image], [data-background], [data-bg]"));
    return elements.map(el => ({
      tag: el.tagName,
      dataSrc: el.getAttribute("data-src"),
      dataImage: el.getAttribute("data-image"),
      dataBg: el.getAttribute("data-background") || el.getAttribute("data-bg"),
    }));
  });

  for (const item of dataUrls) {
    console.log(`  <${item.tag}>`);
    if (item.dataSrc) console.log(`    data-src: ${item.dataSrc}`);
    if (item.dataImage) console.log(`    data-image: ${item.dataImage}`);
    if (item.dataBg) console.log(`    data-bg: ${item.dataBg}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("ANALYSIS COMPLETE");
  console.log("=".repeat(60));

  // Keep browser open for manual inspection
  console.log("\nBrowser left open for manual inspection. Press Ctrl+C to close.");

  // Wait indefinitely
  await new Promise(() => {});
}

analyzePage().catch(console.error);
