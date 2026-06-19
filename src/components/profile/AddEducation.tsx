"use client";
import { AddEducationFormSchema } from "@/models/AddEductionForm.schema";
import { Education } from "@/models/profile.model";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import TiptapEditor from "../TiptapEditor";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { toast } from "../ui/use-toast";
import { Loader, X } from "lucide-react";
import { addEducation, updateEducation } from "@/actions/profile.actions";

export type AddEducationProps = {
  resumeId: string | undefined;
  educationIndex: number | undefined;
  educations: Education[] | undefined;
  onClose: () => void;
  onLocalSave?: (edu: Education, index?: number) => void;
};

function AddEducation({ resumeId, educationIndex, educations, onClose, onLocalSave }: AddEducationProps) {
  const educationToEdit =
    educationIndex !== undefined ? educations?.[educationIndex] : undefined;

  const isEdit = !!educationToEdit;
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddEducationFormSchema>>({
    resolver: zodResolver(AddEducationFormSchema),
    defaultValues: isEdit
      ? {
          index: educationIndex,
          resumeId,
          institution: educationToEdit.institution,
          degree: educationToEdit.degree,
          fieldOfStudy: educationToEdit.fieldOfStudy,
          location: educationToEdit.location,
          startDate: String(educationToEdit.startDate),
          endDate: educationToEdit.endDate ? String(educationToEdit.endDate) : "",
          cgpa: educationToEdit.cgpa ?? "",
          description: educationToEdit.description ?? "",
          degreeCompleted: true,
        }
      : {
          resumeId,
          institution: "",
          degree: "",
          fieldOfStudy: "",
          location: "",
          startDate: "",
          endDate: "",
          cgpa: "",
          description: "",
          degreeCompleted: true,
        },
  });

  const { formState } = form;

  const onSubmit = (data: z.infer<typeof AddEducationFormSchema>) => {
    if (onLocalSave) {
      onLocalSave(
        {
          institution: data.institution,
          degree: data.degree,
          fieldOfStudy: data.fieldOfStudy,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate ?? null,
          cgpa: data.cgpa || undefined,
          description: data.description || undefined,
        },
        educationIndex,
      );
      form.reset(data);
      onClose();
      return;
    }
    startTransition(async () => {
      const res = isEdit ? await updateEducation(data) : await addEducation(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        form.reset();
        onClose();
        toast({
          variant: "success",
          description: `Education has been ${isEdit ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{isEdit ? "Edit Education" : "Add Education"}</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Stanford" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Toronto, ON" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Bachelor's" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Computer Science" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 2018" maxLength={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Year</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g. 2022 (leave blank if current)"
                    maxLength={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cgpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  GPA / CGPA{" "}
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 3.76/4.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TiptapEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
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

export default AddEducation;
