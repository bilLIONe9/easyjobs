"use client";
import { Loader } from "lucide-react";
import { Button } from "../ui/button";
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
import { AddContactInfoFormSchema } from "@/models/addContactInfoForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { ContactInfo } from "@/models/profile.model";
import { saveContactInfo } from "@/actions/profile.actions";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  headline: "",
  phone: "",
  address: "",
  github: "",
  linkedin: "",
};

interface AddContactInfoProps {
  dialogOpen: boolean;
  setDialogOpen: (e: boolean) => void;
  contactInfoToEdit?: ContactInfo | null;
  resumeId: string | undefined;
}

function AddContactInfo({
  dialogOpen,
  setDialogOpen,
  contactInfoToEdit,
  resumeId,
}: AddContactInfoProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddContactInfoFormSchema>>({
    resolver: zodResolver(AddContactInfoFormSchema),
    defaultValues: { resumeId, ...EMPTY_FORM },
  });

  const { reset, formState } = form;

  useEffect(() => {
    if (contactInfoToEdit) {
      reset({
        resumeId,
        firstName: contactInfoToEdit.firstName,
        lastName: contactInfoToEdit.lastName,
        email: contactInfoToEdit.email,
        headline: contactInfoToEdit.headline ?? "",
        phone: contactInfoToEdit.phone ?? "",
        address: contactInfoToEdit.address ?? "",
        github: contactInfoToEdit.github ?? "",
        linkedin: contactInfoToEdit.linkedin ?? "",
      }, { keepDefaultValues: true });
    } else {
      reset({ resumeId, ...EMPTY_FORM });
    }
  }, [contactInfoToEdit, reset, resumeId]);

  const onSubmit = (data: z.infer<typeof AddContactInfoFormSchema>) => {
    startTransition(async () => {
      const res = await saveContactInfo(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        setDialogOpen(false);
        toast({
          variant: "success",
          description: `Contact info ${contactInfoToEdit ? "updated" : "saved"} successfully`,
        });
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:max-h-screen overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{contactInfoToEdit ? "Edit Contact Info" : "Add Contact Info"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input {...field} type="email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. Senior Software Engineer" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} type="tel" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Toronto, ON" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl><Input {...field} placeholder="linkedin.com/in/username" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl><Input {...field} placeholder="github.com/username" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

export default AddContactInfo;
