"use client";
import { useForm } from "react-hook-form";
import { AddSkillsFormSchema } from "@/models/addSkillsForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Loader, X } from "lucide-react";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { z } from "zod";
import { addResumeSkills, updateResumeSkills } from "@/actions/profile.actions";
import { SkillCategory } from "@/models/profile.model";

interface AddSkillsProps {
  resumeId: string | undefined;
  skillToEdit?: SkillCategory | null;
  skillIndex?: number;
  onClose: () => void;
  onLocalSave?: (skill: SkillCategory, index?: number) => void;
}

function AddSkills({
  resumeId,
  skillToEdit,
  skillIndex,
  onClose,
  onLocalSave,
}: AddSkillsProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!skillToEdit;

  const form = useForm<z.infer<typeof AddSkillsFormSchema> & { detailsText: string }>({
    resolver: zodResolver(AddSkillsFormSchema) as any,
    defaultValues: { resumeId, label: "", details: [], detailsText: "" },
  });

  const { reset, formState, setValue } = form;

  useEffect(() => {
    if (skillToEdit) {
      reset(
        {
          index: skillIndex,
          resumeId,
          label: skillToEdit.label,
          details: skillToEdit.details,
          detailsText: skillToEdit.details.join(", "),
        },
        { keepDefaultValues: true },
      );
    } else {
      reset({ resumeId, label: "", details: [], detailsText: "" });
    }
  }, [skillToEdit, skillIndex, resumeId, reset]);

  const onSubmit = (data: z.infer<typeof AddSkillsFormSchema> & { detailsText: string }) => {
    if (onLocalSave) {
      onLocalSave({ label: data.label, details: data.details }, skillIndex);
      reset(data);
      onClose();
      return;
    }
    startTransition(async () => {
      const res = isEditing
        ? await updateResumeSkills(data)
        : await addResumeSkills(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        onClose();
        toast({
          variant: "success",
          description: `Skills ${isEditing ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  const handleDetailsTextChange = (value: string) => {
    setValue("detailsText" as any, value);
    const parsed = value.split(",").map((s) => s.trim()).filter(Boolean);
    setValue("details", parsed, { shouldDirty: true });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {isEditing ? "Edit Skill" : "Add Skill"}
        </h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Programming Languages" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={() => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <Input
                    value={form.watch("detailsText" as any) ?? ""}
                    onChange={(e) => handleDetailsTextChange(e.target.value)}
                    placeholder="Ex: JavaScript, TypeScript, Python"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!formState.isDirty || isPending}>
              Save
              {isPending && <Loader className="h-4 w-4 shrink-0 animate-spin ml-1" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddSkills;
