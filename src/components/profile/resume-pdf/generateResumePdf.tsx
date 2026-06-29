import React from "react";
import type { Resume } from "@/models/profile.model";
import { htmlToPdfNodes } from "./html-to-pdf";
import { ProfessionalResumeDocument } from "./ProfessionalTemplate";

export type ResumeDocumentData = Pick<
  Resume,
  "summary" | "contactInfo" | "skills" | "experiences" | "educations" | "certifications"
>;

export type ResumeHtmlNodes = {
  summary: React.ReactElement[];
  experiences: React.ReactElement[][];
  educations: React.ReactElement[][];
};

export function sanitizeFilename(name: string): string {
  const sanitized = name
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return sanitized || "resume";
}

export async function generateResumePdfBlob(
  data: ResumeDocumentData,
  title: string,
): Promise<{ blob: Blob; filename: string }> {
  const htmlNodes: ResumeHtmlNodes = {
    summary: data.summary ? htmlToPdfNodes(data.summary) : [],
    experiences:
      data.experiences?.map((exp) =>
        exp.description ? htmlToPdfNodes(exp.description) : [],
      ) ?? [],
    educations:
      data.educations?.map((edu) =>
        edu.description ? htmlToPdfNodes(edu.description) : [],
      ) ?? [],
  };

  const { pdf } = await import("@react-pdf/renderer");
  const blob = await pdf(
    <ProfessionalResumeDocument resume={data} htmlNodes={htmlNodes} />,
  ).toBlob();
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const filename = `${sanitizeFilename(title)}_${mm}_${dd}.pdf`;
  return { blob, filename };
}

export async function downloadResumePdf(data: ResumeDocumentData, title: string): Promise<void> {
  const { blob, filename } = await generateResumePdfBlob(data, title);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
