"use client";

import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative w-full h-60 rounded-md overflow-hidden">
        <Image src={value} alt="Upload" fill className="object-cover" />
        <Button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-md hover:border-primary/50 transition-colors">
      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </label>
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-sm">Uploading...</div>
        </div>
      )}
    </div>
  );
}
