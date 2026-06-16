import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { Resume } from "@/models/profile.model";
import { styles, SectionHeading } from "./primitives";
import { ResumeHtmlNodes } from "./generateResumePdf";

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "Present";
  return format(new Date(date), "MMM yyyy");
}

type Props = {
  resume: Resume;
  htmlNodes: ResumeHtmlNodes;
};

export function ProfessionalResumeDocument({ resume, htmlNodes }: Props) {
  const { contactInfo, skills, experiences, educations, certifications } = resume;

  const contactParts = [
    contactInfo?.email,
    contactInfo?.phone,
    contactInfo?.address,
  ].filter(Boolean);

  const linkParts = [
    contactInfo?.linkedin,
    contactInfo?.github,
  ].filter(Boolean);

  return (
    <Document
      author={`${contactInfo?.firstName ?? ""} ${contactInfo?.lastName ?? ""}`.trim()}
      creator="jobsync.ca"
      producer="react-pdf"
      title={resume.title}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        {contactInfo && (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.heading}>
              {contactInfo.firstName} {contactInfo.lastName}
            </Text>
            {contactInfo.headline ? (
              <Text style={styles.subheading}>{contactInfo.headline}</Text>
            ) : null}
            {contactParts.length > 0 ? (
              <Text style={styles.contactLine}>{contactParts.join(" · ")}</Text>
            ) : null}
            {linkParts.length > 0 ? (
              <Text style={styles.contactLine}>{linkParts.join(" · ")}</Text>
            ) : null}
          </View>
        )}

        {/* Summary */}
        {htmlNodes.summary.length > 0 && (
          <View>
            <SectionHeading title="Summary" />
            {htmlNodes.summary}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View>
            <SectionHeading title="Skills" />
            {skills.map((sc, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <Text style={styles.bodyText}>
                  <Text style={styles.bold}>{sc.label}: </Text>
                  {sc.details.join(", ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <View>
            <SectionHeading title="Experience" />
            {experiences.map((exp, i) => (
              <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                <Text style={styles.entryTitle}>
                  {exp.jobTitle} — {exp.company}
                </Text>
                <Text style={styles.entryMeta}>
                  {exp.startDate} – {exp.endDate} ·{" "}
                  {exp.location}
                </Text>
                {htmlNodes.experiences[i]}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {educations && educations.length > 0 && (
          <View>
            <SectionHeading title="Education" />
            {educations.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }} wrap={false}>
                <Text style={styles.entryTitle}>{edu.institution}</Text>
                <Text style={styles.entryMeta}>
                  {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ")}
                </Text>
                <Text style={styles.entryMeta}>
                  {edu.startDate} –{" "}
                  {edu.endDate ? edu.endDate : "Present"}
                  {edu.cgpa ? ` · GPA: ${edu.cgpa}` : ""} ·{" "}
                  {edu.location}
                </Text>
                {htmlNodes.educations[i]}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <View>
            <SectionHeading title="Certifications" />
            {certifications.map((cert, i) => (
              <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                <Text style={styles.entryTitle}>{cert.title}</Text>
                <Text style={styles.entryMeta}>{cert.organization}</Text>
                {(cert.issueDate || cert.expirationDate) && (
                  <Text style={styles.entryMeta}>
                    {cert.issueDate
                      ? `Issued: ${formatDate(cert.issueDate)}`
                      : ""}
                    {cert.issueDate && cert.expirationDate ? " · " : ""}
                    {cert.expirationDate
                      ? `Expires: ${formatDate(cert.expirationDate)}`
                      : ""}
                  </Text>
                )}
                {cert.credentialUrl && (
                  <Text style={styles.entryMeta}>{cert.credentialUrl}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
