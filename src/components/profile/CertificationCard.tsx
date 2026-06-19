"use client";
import { LicenseOrCertification } from "@/models/profile.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, ExternalLink, Plus } from "lucide-react";
import { format } from "date-fns";

interface CertificationCardProps {
  certifications: LicenseOrCertification[];
  onEdit: (index: number) => void;
  onAdd: () => void;
}

function CertificationCard({ certifications, onEdit, onAdd }: CertificationCardProps) {
  return (
    <>
      <div className="flex items-center justify-between pl-4 pr-1 py-1">
        <span className="text-sm font-semibold">Certifications</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
        </Button>
      </div>
      {certifications.map((cert, index) => (
        <Card key={`${cert.title}_${cert.organization}`}>
          <CardHeader className="p-2 pb-0 flex-row justify-between relative">
            <CardTitle className="text-xl pl-4">{cert.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 absolute top-0 right-1"
              onClick={() => onEdit(index)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
            </Button>
          </CardHeader>
          <CardContent>
            <h3>{cert.organization}</h3>
            <CardDescription>
              {cert.issueDate && (
                <>Issued: {format(new Date(cert.issueDate), "MMM yyyy")}</>
              )}
              {cert.issueDate && cert.expirationDate && " · "}
              {cert.expirationDate ? (
                <>Expires: {format(new Date(cert.expirationDate), "MMM yyyy")}</>
              ) : (
                cert.issueDate && " · No Expiration"
              )}
            </CardDescription>
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline mt-1"
              >
                View Credential
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default CertificationCard;
