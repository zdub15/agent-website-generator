import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ushealthgroup.com",
      },
      {
        protocol: "https",
        hostname: "ushealthgroup.com",
      },
      {
        protocol: "https",
        hostname: "*.ushagent.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // Required for puppeteer-core and chromium to work in serverless
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
  ],
};

export default nextConfig;
