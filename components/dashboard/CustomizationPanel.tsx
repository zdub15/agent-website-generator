"use client";

import { HexColorPicker } from "react-colorful";
import { useState, useRef } from "react";
import { Palette, BarChart3, Calendar, User, Upload, Check } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomizationStore } from "@/store/customization-store";
import Image from "next/image";

interface CustomizationPanelProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  siteId: string;
  currentHeadshotUrl?: string | null;
  onHeadshotUploaded?: (url: string) => void;
}

export function CustomizationPanel({
  onSave,
  isSaving,
  siteId,
  currentHeadshotUrl,
  onHeadshotUploaded,
}: CustomizationPanelProps) {
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    familiesHelped,
    satisfactionRate,
    coverageIssued,
    calendlyUrl,
    setColor,
    setStat,
    setCalendlyUrl,
    isDirty,
  } = useCustomizationStore();

  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [headshotUrl, setHeadshotUrl] = useState<string | null>(currentHeadshotUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await res.json();
      setHeadshotUrl(data.headshotUrl + "?t=" + Date.now()); // Cache bust
      setUploadSuccess(true);
      onHeadshotUploaded?.(data.headshotUrl);

      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Customize Your Site</CardTitle>
        <CardDescription>
          Personalize colors, stats, and integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="theme" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Calendar className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-4">
            <div className="space-y-4">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <button
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() =>
                      setActiveColorPicker(
                        activeColorPicker === "primary" ? null : "primary"
                      )
                    }
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setColor("primaryColor", e.target.value)}
                    className="font-mono"
                  />
                </div>
                {activeColorPicker === "primary" && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={primaryColor}
                      onChange={(color) => setColor("primaryColor", color)}
                    />
                  </div>
                )}
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <button
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                    onClick={() =>
                      setActiveColorPicker(
                        activeColorPicker === "secondary" ? null : "secondary"
                      )
                    }
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setColor("secondaryColor", e.target.value)}
                    className="font-mono"
                  />
                </div>
                {activeColorPicker === "secondary" && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={secondaryColor}
                      onChange={(color) => setColor("secondaryColor", color)}
                    />
                  </div>
                )}
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <button
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: accentColor }}
                    onClick={() =>
                      setActiveColorPicker(
                        activeColorPicker === "accent" ? null : "accent"
                      )
                    }
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setColor("accentColor", e.target.value)}
                    className="font-mono"
                  />
                </div>
                {activeColorPicker === "accent" && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={accentColor}
                      onChange={(color) => setColor("accentColor", color)}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familiesHelped">Families Helped</Label>
                <Input
                  id="familiesHelped"
                  value={familiesHelped}
                  onChange={(e) => setStat("familiesHelped", e.target.value)}
                  placeholder="e.g., 150+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satisfactionRate">Satisfaction Rate</Label>
                <Input
                  id="satisfactionRate"
                  value={satisfactionRate}
                  onChange={(e) => setStat("satisfactionRate", e.target.value)}
                  placeholder="e.g., 98%"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageIssued">Coverage Issued</Label>
                <Input
                  id="coverageIssued"
                  value={coverageIssued}
                  onChange={(e) => setStat("coverageIssued", e.target.value)}
                  placeholder="e.g., $1M+"
                />
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendlyUrl">Calendly URL</Label>
                <Input
                  id="calendlyUrl"
                  type="url"
                  value={calendlyUrl}
                  onChange={(e) => setCalendlyUrl(e.target.value)}
                  placeholder="https://calendly.com/your-link"
                />
                <p className="text-xs text-gray-500">
                  Add your Calendly link to enable appointment booking
                </p>
              </div>

              <div className="space-y-2">
                <Label>Headshot Photo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {headshotUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-32 h-40 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={headshotUrl}
                        alt="Current headshot"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : uploadSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Uploaded!
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Change Photo
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <User className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Upload your professional headshot
                        </p>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </Button>
                      </>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Image will be cropped to 400x500px portrait format
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
