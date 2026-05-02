"use client";

import { useState, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploaderProps {
  onUploadComplete?: (data: { r2Key: string; r2Url: string; fileName: string; fileSize: number; mimeType: string }) => void;
  docType?: string;
}

export default function FileUploader({ onUploadComplete, docType = "resume" }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = async (f: File) => {
    if (!f.type.includes("pdf")) {
      alert("Only PDF files are allowed");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("docType", docType);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFile(f);
      onUploadComplete?.(data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-2">
      {file ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <File className="w-5 h-5" />
            <span className="text-sm">{file.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop your PDF here, or click to browse
          </p>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            id="file-upload"
            onChange={handleChange}
          />
          <label htmlFor="file-upload">
            <Button asChild variant="secondary">
              <span>Select File</span>
            </Button>
          </label>
          {uploading && <p className="mt-2 text-sm">Uploading...</p>}
        </div>
      )}
    </div>
  );
}