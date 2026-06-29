"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader } from "lucide-react";
import { ResumeDocumentData, generateResumePdfBlob, sanitizeFilename } from "./generateResumePdf";

interface Props {
  resume: ResumeDocumentData | null;
  title: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ResumePdfPreviewDialog({ resume, title, open, onOpenChange }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !resume) return;

    let url: string | null = null;
    setGenerating(true);
    setError(null);
    setBlobUrl(null);

    generateResumePdfBlob(resume, title)
      .then(({ blob }) => {
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => setError("Failed to generate PDF."))
      .finally(() => setGenerating(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, resume, title]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${sanitizeFilename(title)}.pdf`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between shrink-0">
          <DialogTitle className="truncate pr-4">{title || "Resume Preview"}</DialogTitle>
          {blobUrl && (
            <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 rounded border overflow-hidden bg-muted">
          {generating && (
            <div className="h-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              Generating PDF…
            </div>
          )}
          {error && (
            <div className="h-full flex items-center justify-center text-sm text-destructive">
              {error}
            </div>
          )}
          {blobUrl && (
            <iframe
              src={blobUrl}
              className="w-full h-full"
              title="Resume PDF Preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
