"use client";

import { Download, Trash2, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface Site {
  id: string;
  slug: string;
  status: string;
  sourceUrl: string;
  createdAt: string;
  scrapedData: string;
}

interface SiteCardProps {
  site: Site;
  onDelete: (id: string) => void;
}

export function SiteCard({ site, onDelete }: SiteCardProps) {
  const scrapedData = JSON.parse(site.scrapedData);

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${site.slug}-website.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export site");
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    GENERATING: "bg-yellow-100 text-yellow-700",
    PREVIEW: "bg-blue-100 text-blue-700",
    PUBLISHED: "bg-green-100 text-green-700",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{scrapedData.name}</CardTitle>
            <CardDescription className="text-sm">
              /{site.slug}
            </CardDescription>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[site.status] || statusColors.DRAFT
            }`}
          >
            {site.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Products:</span>{" "}
            {scrapedData.products?.join(", ") || "Health, Dental, Vision"}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/sites/${site.slug}`}>
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/customize/${site.id}`}>
                <Settings className="w-4 h-4 mr-1" />
                Customize
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(site.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
