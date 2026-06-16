"use client";
import { ContactInfo } from "@/models/profile.model";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";

interface ContactInfoCardProps {
  contactInfo: ContactInfo;
  openDialog: () => void;
}

function ContactInfoCard({ contactInfo, openDialog }: ContactInfoCardProps) {
  const { firstName, lastName, email, headline, phone, address, github, linkedin } = contactInfo;

  const details = [email, phone, address].filter(Boolean).join(" · ");
  const links = [linkedin, github].filter(Boolean).join(" · ");

  return (
    <Card>
      <CardHeader className="flex-row justify-between relative">
        <div className="min-w-0">
          <CardTitle>{firstName} {lastName}</CardTitle>
          {headline && <CardDescription>{headline}</CardDescription>}
          {details && <CardDescription className="mt-0.5">{details}</CardDescription>}
          {links && <CardDescription className="mt-0.5 text-xs">{links}</CardDescription>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 absolute top-0 right-1 shrink-0"
          onClick={openDialog}
        >
          <Edit className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
        </Button>
      </CardHeader>
    </Card>
  );
}

export default ContactInfoCard;
