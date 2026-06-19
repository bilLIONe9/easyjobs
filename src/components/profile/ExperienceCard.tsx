"use client";
import { WorkExperience } from "@/models/profile.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { TipTapContentViewer } from "../TipTapContentViewer";
import { useState, useTransition } from "react";
import { deleteExperience } from "@/actions/profile.actions";
import { toast } from "../ui/use-toast";
import AddExperience from "./AddExperience";

type ActiveAction = { mode: "add" } | { mode: "edit"; index: number } | null;

interface ExperienceCardProps {
  resumeId: string;
  experiences: WorkExperience[];
  onLocalChange?: (experiences: WorkExperience[]) => void;
}

function ExperienceCard({ resumeId, experiences, onLocalChange }: ExperienceCardProps) {
  const [action, setAction] = useState<ActiveAction>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (index: number) => {
    if (onLocalChange) {
      onLocalChange(experiences.filter((_, i) => i !== index));
      return;
    }
    startTransition(async () => {
      const res = await deleteExperience(index, resumeId);
      if (!res?.success) {
        toast({ variant: "destructive", title: "Failed to delete experience." });
      }
    });
  };

  const handleLocalSave = (exp: WorkExperience, index?: number) => {
    if (!onLocalChange) return;
    onLocalChange(
      index !== undefined
        ? experiences.map((e, i) => (i === index ? exp : e))
        : [...experiences, exp],
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
        <span className="text-sm font-semibold">Experience</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={toggleAdd}>
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
        </Button>
      </div>

      {experiences.map((exp, index) => {
        const cardKey = `${exp.company}_${exp.jobTitle}_${exp.startDate}`;

        if (action?.mode === "edit" && action.index === index) {
          return (
            <AddExperience
              key={`edit_${cardKey}`}
              resumeId={resumeId}
              experienceIndex={index}
              experiences={experiences}
              onClose={() => setAction(null)}
              onLocalSave={onLocalChange ? handleLocalSave : undefined}
            />
          );
        }

        return (
          <Card key={cardKey}>
            <CardHeader className="p-2 pb-0 flex-row justify-between relative">
              <CardTitle className="text-xl pl-4">{exp.jobTitle}</CardTitle>
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
              <h3>{exp.company}</h3>
              <CardDescription>
                {exp.startDate} – {exp.endDate ? exp.endDate : "Present"}
                <br />
                {exp.location}
              </CardDescription>
              <div className="pt-2">
                <TipTapContentViewer content={exp.description ?? ""} />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {action?.mode === "add" && (
        <AddExperience
          resumeId={resumeId}
          experienceIndex={undefined}
          experiences={experiences}
          onClose={() => setAction(null)}
          onLocalSave={onLocalChange ? handleLocalSave : undefined}
        />
      )}
    </>
  );
}

export default ExperienceCard;
