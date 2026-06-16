"use client";
import { Education } from "@/models/profile.model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import { TipTapContentViewer } from "../TipTapContentViewer";

interface EducationCardProps {
  educations: Education[];
  openDialogForEdit: (index: number) => void;
}

function EducationCard({ educations, openDialogForEdit }: EducationCardProps) {
  return (
    <>
      <CardTitle className="pl-6 py-3">Education</CardTitle>
      {educations.map((edu, index) => (
        <Card key={`${edu.institution}_${String(edu.startDate)}`}>
          <CardHeader className="p-2 pb-0 flex-row justify-between relative">
            <CardTitle className="text-xl pl-4">{edu.institution}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 absolute top-0 right-1"
              onClick={() => openDialogForEdit(index)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Edit
              </span>
            </Button>
          </CardHeader>
          <CardContent>
            <h3>
              {edu.degree}, {edu.fieldOfStudy}
            </h3>
            <CardDescription>
              {format(new Date(edu.startDate), "MMM yyyy")} -{" "}
              {edu.endDate ? format(new Date(edu.endDate), "MMM yyyy") : "Present"}
              {edu.cgpa && <> · GPA: {edu.cgpa}</>}
              <br />
              {edu.location}
            </CardDescription>
            {edu.description && (
              <div className="pt-2">
                <TipTapContentViewer content={edu.description} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default EducationCard;
