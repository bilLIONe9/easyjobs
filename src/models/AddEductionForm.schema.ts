import { z } from "zod";

export const AddEducationFormSchema = z.object({
  index: z.number().optional(),
  resumeId: z.string().optional(),
  institution: z
    .string({
      error: "Institution name is required.",
    })
    .min(2),
  degree: z
    .string({
      error: "Degree is required.",
    })
    .min(2),
  fieldOfStudy: z
    .string({
      error: "Field of study is required.",
    })
    .min(2),
  location: z
    .string({
      error: "Location is required.",
    })
    .min(2, {
      message: "Location name must be at least 2 characters.",
    }),
  cgpa: z.string().optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().min(1, { message: "Start year is required." }),
  endDate: z.string().nullable().optional(),
  degreeCompleted: z.boolean().default(true).optional(),
});
