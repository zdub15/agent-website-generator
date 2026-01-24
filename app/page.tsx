"use client";

import { useEffect, useState } from "react";
import { UrlSubmitForm } from "@/components/dashboard/UrlSubmitForm";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { Sparkles, Globe, Zap } from "lucide-react";

interface Site {
  id: string;
  slug: string;
  status: string;
  sourceUrl: string;
  createdAt: string;
  scrapedData: string;
}

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error("Failed to fetch sites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return;

    try {
      await fetch(`/api/sites/${id}`, { method: "DELETE" });
      setSites(sites.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete site:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Agent Website Generator</h1>
              <p className="text-xs text-gray-500">Transform your profile into a professional site</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Professional Insurance Website
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Turn your USHEALTH agent profile into a stunning, conversion-focused website in minutes.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>AI-Generated Content</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Instant Preview</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-5 h-5 text-green-600" />
              <span>Mobile Optimized</span>
            </div>
          </div>
        </div>

        {/* URL Submit Form */}
        <div className="mb-16">
          <UrlSubmitForm />
        </div>

        {/* Existing Sites */}
        {!isLoading && sites.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Websites</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => (
                <SiteCard key={site.id} site={site} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your sites...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Agent Website Generator - Turn your profile into a professional website</p>
        </div>
      </footer>
    </div>
  );
}
