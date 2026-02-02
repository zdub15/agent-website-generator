"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UrlSubmitForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setStatus("Scraping agent profile...");

    try {
      // Step 1: Create site and scrape profile
      const createRes = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: url }),
      });

      const createText = await createRes.text();
      let createData;
      try {
        createData = JSON.parse(createText);
      } catch {
        console.error("Failed to parse response:", createText.substring(0, 200));
        throw new Error("Invalid response from server");
      }

      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to scrape profile");
      }

      const { site, profile } = createData;
      setStatus("Generating content with AI...");

      // Step 2: Generate content
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id, profile }),
      });

      const generateText = await generateRes.text();
      let generateData;
      try {
        generateData = JSON.parse(generateText);
      } catch {
        console.error("Failed to parse generate response:", generateText.substring(0, 200));
        throw new Error("Invalid response from AI generation");
      }

      if (!generateRes.ok) {
        throw new Error(generateData.error || "Failed to generate content");
      }

      setStatus("Redirecting to preview...");

      // Redirect to the site preview
      router.push(`/sites/${site.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Generate Your Website
        </CardTitle>
        <CardDescription>
          Enter your USHEALTH agent profile URL to create a professional website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Agent Profile URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="url"
                type="url"
                placeholder="https://www.ushagent.com/YOURNAME"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500">
              Example: https://www.ushagent.com/KYLENISBET
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {status && !error && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {status}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Website
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
