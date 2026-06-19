"use client";
import { AddCertificationFormSchema } from "@/models/addCertificationForm.schema";
import { LicenseOrCertification } from "@/models/profile.model";
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
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { Loader, X } from "lucide-react";
import { addCertification, updateCertification } from "@/actions/profile.actions";

type AddCertificationProps = {
  resumeId: string | undefined;
  certificationIndex: number | undefined;
  certifications: LicenseOrCertification[] | undefined;
  onClose: () => void;
  onLocalSave?: (cert: LicenseOrCertification, index?: number) => void;
};

function AddCertification({
  resumeId,
  certificationIndex,
  certifications,
  onClose,
  onLocalSave,
}: AddCertificationProps) {
  const certificationToEdit =
    certificationIndex !== undefined
      ? certifications?.[certificationIndex]
      : undefined;

  const pageTitle = certificationToEdit
    ? "Edit Certification / License"
    : "Add Certification / License";
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddCertificationFormSchema>>({
    resolver: zodResolver(AddCertificationFormSchema),
    defaultValues: { resumeId, noExpiration: false },
  });

  const { watch, reset, formState, resetField } = form;
  const noExpirationValue = watch("noExpiration");

  useEffect(() => {
    if (certificationToEdit) {
      reset(
        {
          index: certificationIndex,
          resumeId,
          title: certificationToEdit.title,
          organization: certificationToEdit.organization,
          issueDate: certificationToEdit.issueDate
            ? new Date(certificationToEdit.issueDate)
            : undefined,
          expirationDate: certificationToEdit.expirationDate
            ? new Date(certificationToEdit.expirationDate)
            : undefined,
          credentialUrl: certificationToEdit.credentialUrl ?? "",
          noExpiration: !certificationToEdit.expirationDate,
        },
        { keepDefaultValues: true },
      );
    } else {
      reset({ resumeId, noExpiration: false }, { keepDefaultValues: true });
    }
  }, [certificationToEdit, certificationIndex, resumeId, reset]);

  const onNoExpirationChange = (checked: boolean) => {
    if (checked) resetField("expirationDate");
  };

  const onSubmit = (data: z.infer<typeof AddCertificationFormSchema>) => {
    if (onLocalSave) {
      onLocalSave(
        {
          title: data.title ?? "",
          organization: data.organization ?? "",
          issueDate: data.issueDate ?? null,
          expirationDate: data.expirationDate ?? null,
          credentialUrl: data.credentialUrl ?? undefined,
        },
        certificationIndex,
      );
      reset(data);
      onClose();
      return;
    }
    startTransition(async () => {
      const res = certificationToEdit
        ? await updateCertification(data)
        : await addCertification(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        onClose();
        toast({
          variant: "success",
          description: `Certification has been ${certificationToEdit ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{pageTitle}</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification / License Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: AWS Certified Solutions Architect"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issuing Organization</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: Amazon Web Services"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date</FormLabel>
                <DatePicker field={field} presets={false} isEnabled={true} captionLayout={true} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiration Date</FormLabel>
                <DatePicker field={field} presets={false} isEnabled={!noExpirationValue} captionLayout={true} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="noExpiration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 pt-1">
                <Switch
                  checked={field.value}
                  onCheckedChange={(c) => {
                    field.onChange(c);
                    onNoExpirationChange(c);
                  }}
                />
                <FormLabel className="mb-0">
                  {field.value ? "No Expiration" : "Has Expiration Date"}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="credentialUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credential URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://www.credly.com/badges/..."
                    />
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

export default AddCertification;
