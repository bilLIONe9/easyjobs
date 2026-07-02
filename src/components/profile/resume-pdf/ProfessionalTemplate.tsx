import React from "react";
import { Document, Font, Page, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";
import { styles, SectionHeading } from "./primitives";
import { ResumeDocumentData, ResumeHtmlNodes } from "./generateResumePdf";

Font.registerHyphenationCallback((word) => [word]);

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "Present";
  return format(new Date(date), "MMM yyyy");
}

type Props = {
  resume: ResumeDocumentData;
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
      creator="easyjobs.tokadream.com"
      producer="react-pdf"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        {contactInfo && (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <View>
              <Text style={styles.heading}>
                {contactInfo.firstName} {contactInfo.lastName}
              </Text>
              {contactInfo.headline ? (
                <Text style={styles.subheading}>{contactInfo.headline}</Text>
              ) : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {contactParts.map((part, i) => (
                <Text key={i} style={styles.contactLine}>{part}</Text>
              ))}
              {linkParts.map((part, i) => (
                <Text key={i} style={styles.contactLine}>{part}</Text>
              ))}
            </View>
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
        {experiences && experiences.length > 0 &&
          experiences.map((exp, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 8 }}>
              {i === 0 && <SectionHeading title="Experience" />}
              <Text style={styles.entryTitle}>
                {exp.jobTitle} — {exp.company}
              </Text>
              <Text style={styles.entryMeta}>
                {exp.startDate} – {exp.endDate} ·{" "}
                {exp.location}
              </Text>
              {htmlNodes.experiences[i]}
            </View>
          ))
        }

        {/* Education */}
        {educations && educations.length > 0 &&
          educations.map((edu, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 8 }}>
              {i === 0 && <SectionHeading title="Education" />}
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
          ))
        }

        {/* Certifications */}
        {certifications && certifications.length > 0 &&
          certifications.map((cert, i) => (
            <View key={i} style={{ marginBottom: 6 }} wrap={false}>
              {i === 0 && <SectionHeading title="Certifications" />}
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
          ))
        }
      </Page>
    </Document>
  );
}
