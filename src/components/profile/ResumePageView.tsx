"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Loader,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Save,
} from "lucide-react";
import { Resume } from "@/models/profile.model";
import { Button } from "../ui/button";
import { ResumePdfPanel } from "./ResumePdfPanel";
import { ResumeEditorPanel } from "./ResumeEditorPanel";
import { generateResumePdfBlob } from "./resume-pdf/generateResumePdf";
import { saveFullResume } from "@/actions/profile.actions";
import { toast } from "../ui/use-toast";

interface ResumePageViewProps {
  resume: Resume;
}

export function ResumePageView({ resume }: ResumePageViewProps) {
  const [showEdit, setShowEdit] = useState(true);
  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const savedRef = useRef<Resume>(resume);

  const backHref = resume.jobProfileId ? "/dashboard/job-profiles" : "/dashboard/profile";

  const updateLocal = (updates: Partial<Resume>) => {
    setLocalResume((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = () => {
    startSaveTransition(async () => {
      const res = await saveFullResume(localResume);
      if (!res.success) {
        toast({ variant: "destructive", title: "Failed to save.", description: res.message });
      } else {
        savedRef.current = localResume;
        setIsDirty(false);
        toast({ variant: "success", description: "Resume saved." });
      }
    });
  };

  const handleDiscard = () => {
    setLocalResume(savedRef.current);
    setIsDirty(false);
  };

  const handleDownload = async () => {
    try {
      const { blob, filename } = await generateResumePdfBlob(localResume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "Failed to generate PDF." });
    }
  };

  return (
    <div className="col-span-3 flex flex-col gap-3 h-[calc(100dvh-5.5rem)]">

      {/* Top bar */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>

        <span className="font-semibold text-sm truncate flex-1 min-w-0">
          {localResume.title}
        </span>

        {isDirty && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 shrink-0 text-muted-foreground"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? <Loader className="h-4 w-4 animate-spin" />
                : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {isSaving ? "Saving…" : "Save"}
              </span>
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>

        <Button
          variant={showEdit ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setShowEdit((v) => !v)}
        >
          {showEdit
            ? <PanelRightClose className="h-4 w-4" />
            : <PanelRightOpen className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {showEdit ? "Hide Edit" : "Edit"}
          </span>
        </Button>
      </div>

      {/* Split view: PDF preview + editor */}
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 min-w-0 min-h-0">
          <ResumePdfPanel resume={localResume} />
        </div>

        {showEdit && (
          <ResumeEditorPanel
            resumeId={resume.id}
            localResume={localResume}
            updateLocal={updateLocal}
          />
        )}
      </div>

    </div>
  );
}
