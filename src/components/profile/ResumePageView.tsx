"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Download, Loader, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Resume, SkillCategory } from "@/models/profile.model";
import { Button } from "../ui/button";
import AddResumeSection, { AddResumeSectionRef } from "./AddResumeSection";
import ContactInfoCard from "./ContactInfoCard";
import SummarySectionCard from "./SummarySectionCard";
import SkillsCard from "./SkillsCard";
import ExperienceCard from "./ExperienceCard";
import EducationCard from "./EducationCard";
import CertificationCard from "./CertificationCard";
import { generateResumePdfBlob } from "./resume-pdf/generateResumePdf";
import type { ResumeHtmlNodes } from "./resume-pdf/generateResumePdf";
import { toast } from "../ui/use-toast";

// Dynamically import the PDF viewer so @react-pdf/renderer never runs on the server
const PdfViewerPanel = dynamic(
  () => import("./resume-pdf/PdfViewerPanel").then((m) => ({ default: m.PdfViewerPanel })),
  { ssr: false },
);

// ─── PDF preview ──────────────────────────────────────────────────────────────

function PdfPanel({ resume }: { resume: Resume }) {
  const [htmlNodes, setHtmlNodes] = useState<ResumeHtmlNodes | null>(null);

  useEffect(() => {
    import("./resume-pdf/html-to-pdf").then(({ htmlToPdfNodes }) => {
      setHtmlNodes({
        summary: resume.summary ? htmlToPdfNodes(resume.summary) : [],
        experiences: resume.experiences?.map((e) => e.description ? htmlToPdfNodes(e.description) : []) ?? [],
        educations: resume.educations?.map((e) => e.description ? htmlToPdfNodes(e.description) : []) ?? [],
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.id, String(resume.updatedAt)]);

  if (!htmlNodes) {
    return (
      <div className="h-full rounded-lg border bg-muted flex items-center justify-center">
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border overflow-hidden shadow-sm">
      <PdfViewerPanel resume={resume} htmlNodes={htmlNodes} />
    </div>
  );
}

// ─── Page view ────────────────────────────────────────────────────────────────

export function ResumePageView({ resume }: { resume: Resume }) {
  const sectionRef = useRef<AddResumeSectionRef>(null);
  const [showEdit, setShowEdit] = useState(true);

  const { contactInfo, summary, skills, experiences, educations, certifications } = resume;

  const backHref = resume.jobProfileId ? "/dashboard/job-profiles" : "/dashboard/profile";

  const handleDownload = async () => {
    try {
      const { blob, filename } = await generateResumePdfBlob(resume);
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
        <span className="font-semibold text-sm truncate flex-1 min-w-0">{resume.title}</span>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button
          variant={showEdit ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setShowEdit((v) => !v)}
        >
          {showEdit ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          <span className="hidden sm:inline">{showEdit ? "Hide Edit" : "Edit"}</span>
        </Button>
      </div>

      {/* Split content area */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: PDF preview */}
        <div className="flex-1 min-w-0 min-h-0">
          <PdfPanel resume={resume} />
        </div>

        {/* Right: edit panel */}
        {showEdit && (
          <div className="w-[380px] xl:w-[430px] shrink-0 flex flex-col gap-3 min-h-0">
            {/* Edit panel header */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Editor</span>
              <AddResumeSection resume={resume} ref={sectionRef} />
            </div>

            {/* Scrollable section cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!contactInfo && (
                <button
                  type="button"
                  onClick={() => sectionRef.current?.openContactInfoDialog({ firstName: "", lastName: "", email: "" })}
                  className="w-full rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors text-left"
                >
                  + Add contact info
                </button>
              )}
              {contactInfo && (
                <ContactInfoCard
                  contactInfo={contactInfo}
                  openDialog={() => sectionRef.current?.openContactInfoDialog(contactInfo)}
                />
              )}
              {summary && (
                <SummarySectionCard
                  summary={summary}
                  openDialogForEdit={() => sectionRef.current?.openSummaryDialog(summary)}
                />
              )}
              {skills && skills.length > 0 && (
                <SkillsCard
                  resumeId={resume.id!}
                  skills={skills}
                  openDialogForEdit={(sc: SkillCategory, index: number) => sectionRef.current?.openSkillsCategoryDialog(sc, index)}
                  openDialogForAdd={() => sectionRef.current?.openSkillsCategoryDialog()}
                />
              )}
              {experiences && experiences.length > 0 && (
                <ExperienceCard
                  experiences={experiences}
                  openDialogForEdit={(index: number) => sectionRef.current?.openExperienceDialog(index)}
                />
              )}
              {educations && educations.length > 0 && (
                <EducationCard
                  educations={educations}
                  openDialogForEdit={(index: number) => sectionRef.current?.openEducationDialog(index)}
                />
              )}
              {certifications && certifications.length > 0 && (
                <CertificationCard
                  certifications={certifications}
                  openDialogForEdit={(index: number) => sectionRef.current?.openCertificationDialog(index)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
