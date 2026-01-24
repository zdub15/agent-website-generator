// In-memory store for serverless deployment
// Data persists within the same serverless function instance
// but may be lost between deployments or cold starts

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
  createdAt: Date;
  updatedAt: Date;
}

// Global store that persists across requests in the same instance
const globalForStore = globalThis as unknown as {
  sites: Map<string, Site> | undefined;
};

const sites = globalForStore.sites ?? new Map<string, Site>();
globalForStore.sites = sites;

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const memoryStore = {
  site: {
    findMany: async (options?: { orderBy?: { createdAt: "desc" | "asc" } }) => {
      const allSites = Array.from(sites.values());
      if (options?.orderBy?.createdAt === "desc") {
        return allSites.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return allSites;
    },

    findUnique: async (options: { where: { id?: string; slug?: string } }) => {
      if (options.where.id) {
        return sites.get(options.where.id) || null;
      }
      if (options.where.slug) {
        return Array.from(sites.values()).find(s => s.slug === options.where.slug) || null;
      }
      return null;
    },

    create: async (options: { data: Omit<Site, "id" | "createdAt" | "updatedAt"> }) => {
      const id = generateId();
      const now = new Date();
      const site: Site = {
        ...options.data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      sites.set(id, site);
      return site;
    },

    update: async (options: { where: { id: string }; data: Partial<Site> }) => {
      const site = sites.get(options.where.id);
      if (!site) {
        throw new Error("Site not found");
      }
      const updatedSite: Site = {
        ...site,
        ...options.data,
        updatedAt: new Date(),
      };
      sites.set(options.where.id, updatedSite);
      return updatedSite;
    },

    delete: async (options: { where: { id: string } }) => {
      const site = sites.get(options.where.id);
      if (!site) {
        throw new Error("Site not found");
      }
      sites.delete(options.where.id);
      return site;
    },
  },
};

// Export as prisma for compatibility
export const prisma = memoryStore;
