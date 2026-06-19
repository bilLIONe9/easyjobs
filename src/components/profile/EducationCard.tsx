"use client";
import { Education } from "@/models/profile.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { TipTapContentViewer } from "../TipTapContentViewer";
import { useState, useTransition } from "react";
import { deleteEducation } from "@/actions/profile.actions";
import { toast } from "../ui/use-toast";
import AddEducation from "./AddEducation";

type ActiveAction = { mode: "add" } | { mode: "edit"; index: number } | null;

interface EducationCardProps {
  resumeId: string;
  educations: Education[];
  onLocalChange?: (educations: Education[]) => void;
}

function EducationCard({ resumeId, educations, onLocalChange }: EducationCardProps) {
  const [action, setAction] = useState<ActiveAction>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (index: number) => {
    if (onLocalChange) {
      onLocalChange(educations.filter((_, i) => i !== index));
      return;
    }
    startTransition(async () => {
      const res = await deleteEducation(index, resumeId);
      if (!res?.success) {
        toast({ variant: "destructive", title: "Failed to delete education." });
      }
    });
  };

  const handleLocalSave = (edu: Education, index?: number) => {
    if (!onLocalChange) return;
    onLocalChange(
      index !== undefined
        ? educations.map((e, i) => (i === index ? edu : e))
        : [...educations, edu],
    );
  };

  const toggleAdd = () =>
    setAction((prev) => (prev?.mode === "add" ? null : { mode: "add" }));

  const toggleEdit = (index: number) =>
    setAction((prev) =>
      prev?.mode === "edit" && prev.index === index ? null : { mode: "edit", index }
    );

  return (
    <>
      <div className="flex items-center justify-between pl-4 pr-1 py-1">
        <span className="text-sm font-semibold">Education</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={toggleAdd}>
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
        </Button>
      </div>

      {educations.map((edu, index) => {
        const cardKey = `${edu.institution}_${String(edu.startDate)}`;

        if (action?.mode === "edit" && action.index === index) {
          return (
            <AddEducation
              key={`edit_${cardKey}`}
              resumeId={resumeId}
              educationIndex={index}
              educations={educations}
              onClose={() => setAction(null)}
              onLocalSave={onLocalChange ? handleLocalSave : undefined}
            />
          );
        }

        return (
          <Card key={cardKey}>
            <CardHeader className="p-2 pb-0 flex-row justify-between relative">
              <CardTitle className="text-xl pl-4">{edu.institution}</CardTitle>
              <div className="flex gap-0.5 absolute top-0 right-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleEdit(index)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3>
                {edu.degree}, {edu.fieldOfStudy}
              </h3>
              <CardDescription>
                {edu.startDate} – {edu.endDate ? edu.endDate : "Present"}
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
        );
      })}

      {action?.mode === "add" && (
        <AddEducation
          resumeId={resumeId}
          educationIndex={undefined}
          educations={educations}
          onClose={() => setAction(null)}
          onLocalSave={onLocalChange ? handleLocalSave : undefined}
        />
      )}
    </>
  );
}

export default EducationCard;
