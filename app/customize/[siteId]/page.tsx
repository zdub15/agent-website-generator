"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomizationPanel } from "@/components/dashboard/CustomizationPanel";
import { useCustomizationStore } from "@/store/customization-store";
import Link from "next/link";

export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const { loadFromSite, primaryColor, secondaryColor, accentColor, familiesHelped, satisfactionRate, coverageIssued, calendlyUrl, markClean } = useCustomizationStore();

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  const fetchSite = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}`);
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setSite(data);

      // Load customization into store
      if (data.customization) {
        loadFromSite({
          ...data.customization,
          familiesHelped: data.customization.stats?.familiesHelped || "150+",
          satisfactionRate: data.customization.stats?.satisfactionRate || "98%",
          coverageIssued: data.customization.stats?.coverageIssued || "$1M+",
          calendlyUrl: data.site.calendlyUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch site:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customization: {
            primaryColor,
            secondaryColor,
            accentColor,
            stats: {
              familiesHelped,
              satisfactionRate,
              coverageIssued,
            },
          },
          calendlyUrl,
        }),
      });
      markClean();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!site) {
    return null;
  }

  const previewUrl = `/sites/${site.site.slug}?preview=true&pc=${encodeURIComponent(primaryColor)}&sc=${encodeURIComponent(secondaryColor)}&ac=${encodeURIComponent(accentColor)}`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">
                Customize: {site.scrapedData?.name || "Site"}
              </h1>
              <p className="text-xs text-gray-500">/{site.site.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded ${
                  previewDevice === "desktop"
                    ? "bg-white shadow-sm"
                    : "text-gray-500"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded ${
                  previewDevice === "mobile"
                    ? "bg-white shadow-sm"
                    : "text-gray-500"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/sites/${site.site.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Preview
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Customization Panel */}
        <div className="w-96 bg-white border-r overflow-y-auto p-4">
          <CustomizationPanel
            onSave={handleSave}
            isSaving={isSaving}
            siteId={siteId}
            currentHeadshotUrl={site.site.headshotUrl}
            onHeadshotUploaded={() => {
              // Refresh iframe to show new headshot
              const iframe = document.querySelector("iframe");
              if (iframe) {
                iframe.src = iframe.src;
              }
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 p-6 overflow-hidden">
          <div
            className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden h-full ${
              previewDevice === "mobile" ? "max-w-[375px]" : "w-full"
            }`}
          >
            <iframe
              src={`/sites/${site.site.slug}`}
              className="w-full h-full border-0"
              title="Site Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
