"use client";
import { PDFViewer } from "@react-pdf/renderer";
import { Resume } from "@/models/profile.model";
import { ResumeHtmlNodes } from "./generateResumePdf";
import { ProfessionalResumeDocument } from "./ProfessionalTemplate";

interface Props {
  resume: Resume;
  htmlNodes: ResumeHtmlNodes;
}

export function PdfViewerPanel({ resume, htmlNodes }: Props) {
  return (
    <PDFViewer
      showToolbar={false}
      style={{ width: "100%", height: "100%", border: "none", borderRadius: "0.5rem" }}
    >
      <ProfessionalResumeDocument resume={resume} htmlNodes={htmlNodes} />
    </PDFViewer>
  );
}
