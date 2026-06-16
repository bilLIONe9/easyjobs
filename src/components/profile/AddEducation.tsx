"use client";
import { AddEducationFormSchema } from "@/models/AddEductionForm.schema";
import { Education } from "@/models/profile.model";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import TiptapEditor from "../TiptapEditor";
import { Button } from "../ui/button";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { Loader } from "lucide-react";
import { addEducation, updateEducation } from "@/actions/profile.actions";

type AddEducationProps = {
  resumeId: string | undefined;
  educationIndex: number | undefined;
  educations: Education[] | undefined;
  dialogOpen: boolean;
  setDialogOpen: (e: boolean) => void;
};

function AddEducation({
  resumeId,
  educationIndex,
  educations,
  dialogOpen,
  setDialogOpen,
}: AddEducationProps) {
  const educationToEdit = educationIndex !== undefined
    ? educations?.[educationIndex]
    : undefined;

  const pageTitle = educationToEdit ? "Edit Education" : "Add Education";
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddEducationFormSchema>>({
    resolver: zodResolver(AddEducationFormSchema),
    defaultValues: {
      resumeId,
      degreeCompleted: true,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      cgpa: "",
    },
  });

  const { watch, reset, setValue, formState } = form;
  const degreeCompletedValue = watch("degreeCompleted");

  useEffect(() => {
    if (!dialogOpen) return;
    if (educationToEdit) {
      reset(
        {
          index: educationIndex,
          resumeId,
          institution: educationToEdit.institution,
          degree: educationToEdit.degree,
          fieldOfStudy: educationToEdit.fieldOfStudy,
          location: educationToEdit.location,
          startDate: String(educationToEdit.startDate),
          endDate: educationToEdit.endDate ? String(educationToEdit.endDate) : "",
          cgpa: educationToEdit.cgpa ?? "",
          description: educationToEdit.description,
          degreeCompleted: !!educationToEdit.endDate,
        },
        { keepDefaultValues: true },
      );
    } else {
      reset(
        { resumeId, degreeCompleted: true, institution: "", degree: "", fieldOfStudy: "", location: "", startDate: "", endDate: "", cgpa: "" },
        { keepDefaultValues: true },
      );
    }
  }, [dialogOpen, educationToEdit, educationIndex, resumeId, reset]);

  const onDegreeCompleted = (completed: boolean) => {
    if (!completed) setValue("endDate", "");
  };

  const onSubmit = (data: z.infer<typeof AddEducationFormSchema>) => {
    startTransition(async () => {
      const res = educationToEdit
        ? await updateEducation(data)
        : await addEducation(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        setDialogOpen(false);
        toast({
          variant: "success",
          description: `Education has been ${educationToEdit ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="h-full md:h-[85%] lg:max-h-screen md:max-w-[40rem] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{pageTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2"
          >
            <div>
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>School</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Stanford" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Toronto, ON" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Bachelor's" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Field of study</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Computer Science" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Year</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 2018" maxLength={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Year</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="e.g. 2022"
                        maxLength={4}
                        disabled={!degreeCompletedValue}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center">
              <FormField
                control={form.control}
                name="degreeCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <Switch
                      checked={field.value}
                      onCheckedChange={(c) => { field.onChange(c); onDegreeCompleted(c); }}
                    />
                    <FormLabel className="flex items-center ml-4 mb-2">
                      {field.value ? "Degree Completed" : "Currently Studying"}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="cgpa"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>GPA / CGPA <span className="text-xs text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 3.76/4.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TiptapEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <DialogFooter>
                <Button type="reset" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formState.isDirty}>
                  Save
                  {isPending && <Loader className="h-4 w-4 shrink-0 spinner" />}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddEducation;
