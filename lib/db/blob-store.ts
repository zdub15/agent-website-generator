// Blob-based store for serverless deployment
// Uses Vercel Blob for persistent storage

import { put, list, del, head } from "@vercel/blob";

interface Site {
  id: string;
  slug: string;
  status: string;
  sourceUrl: string;
  scrapedData: string;
  generatedContent: string | null;
  customization: string | null;
  headshotUrl: string | null;
  calendlyUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const SITES_PREFIX = "sites/";

// Check if blob storage is available
const hasBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;

// Fallback in-memory store for local development
const memoryStore = new Map<string, Site>();

async function saveSite(site: Site): Promise<void> {
  if (hasBlobStorage) {
    console.log("Saving site to blob storage:", site.id, site.slug);
    // Delete existing blob if it exists (for updates)
    try {
      const { blobs } = await list({ prefix: `${SITES_PREFIX}${site.id}.json` });
      if (blobs.length > 0) {
        await del(blobs[0].url);
      }
    } catch {
      // Ignore delete errors
    }
    const result = await put(`${SITES_PREFIX}${site.id}.json`, JSON.stringify(site), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    console.log("Site saved to:", result.url);
  } else {
    console.log("Saving site to memory store:", site.id);
    memoryStore.set(site.id, site);
  }
}

async function getSiteById(id: string): Promise<Site | null> {
  if (hasBlobStorage) {
    try {
      const { blobs } = await list({ prefix: `${SITES_PREFIX}${id}.json` });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        if (response.ok) {
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (parseError) {
            console.error("Error parsing site JSON:", parseError, "Content:", text.substring(0, 100));
            return null;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching site by id:", error);
      return null;
    }
  } else {
    return memoryStore.get(id) || null;
  }
}

async function getSiteBySlug(slug: string): Promise<Site | null> {
  if (hasBlobStorage) {
    try {
      console.log("Searching for site with slug:", slug);
      const { blobs } = await list({ prefix: SITES_PREFIX });
      console.log("Found blobs:", blobs.length);
      for (const blob of blobs) {
        if (blob.pathname.endsWith(".json")) {
          const response = await fetch(blob.url);
          if (response.ok) {
            const text = await response.text();
            try {
              const site: Site = JSON.parse(text);
              console.log("Checking site:", site.slug);
              if (site.slug === slug) {
                return site;
              }
            } catch (parseError) {
              console.error("Error parsing site JSON:", parseError, "Content:", text.substring(0, 100));
              continue;
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching site by slug:", error);
      return null;
    }
  } else {
    return Array.from(memoryStore.values()).find((s) => s.slug === slug) || null;
  }
}

async function getAllSites(): Promise<Site[]> {
  if (hasBlobStorage) {
    try {
      const { blobs } = await list({ prefix: SITES_PREFIX });
      const sites: Site[] = [];
      for (const blob of blobs) {
        if (blob.pathname.endsWith(".json")) {
          const response = await fetch(blob.url);
          if (response.ok) {
            const text = await response.text();
            try {
              sites.push(JSON.parse(text));
            } catch (parseError) {
              console.error("Error parsing site JSON:", parseError, "Content:", text.substring(0, 100));
              continue;
            }
          }
        }
      }
      return sites.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  } else {
    return Array.from(memoryStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

async function deleteSite(id: string): Promise<Site | null> {
  if (hasBlobStorage) {
    const site = await getSiteById(id);
    if (site) {
      try {
        const { blobs } = await list({ prefix: SITES_PREFIX });
        for (const blob of blobs) {
          if (blob.pathname === `${SITES_PREFIX}${id}.json`) {
            await del(blob.url);
            break;
          }
        }
      } catch {
        // Ignore delete errors
      }
    }
    return site;
  } else {
    const site = memoryStore.get(id);
    if (site) {
      memoryStore.delete(id);
    }
    return site || null;
  }
}

export const prisma = {
  site: {
    findMany: async (options?: { orderBy?: { createdAt: "desc" | "asc" } }) => {
      const sites = await getAllSites();
      if (options?.orderBy?.createdAt === "asc") {
        return sites.reverse();
      }
      return sites;
    },

    findUnique: async (options: { where: { id?: string; slug?: string } }) => {
      if (options.where.id) {
        return await getSiteById(options.where.id);
      }
      if (options.where.slug) {
        return await getSiteBySlug(options.where.slug);
      }
      return null;
    },

    create: async (options: {
      data: Omit<Site, "id" | "createdAt" | "updatedAt">;
    }) => {
      const id = generateId();
      const now = new Date().toISOString();
      const site: Site = {
        ...options.data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await saveSite(site);
      return site;
    },

    update: async (options: { where: { id: string }; data: Partial<Site> }) => {
      const site = await getSiteById(options.where.id);
      if (!site) {
        throw new Error("Site not found");
      }
      const updatedSite: Site = {
        ...site,
        ...options.data,
        updatedAt: new Date().toISOString(),
      };
      await saveSite(updatedSite);
      return updatedSite;
    },

    delete: async (options: { where: { id: string } }) => {
      const site = await deleteSite(options.where.id);
      if (!site) {
        throw new Error("Site not found");
      }
      return site;
    },
  },
};
