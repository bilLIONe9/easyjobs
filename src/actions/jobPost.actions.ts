"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { getCurrentUser } from "@/utils/user.utils";

export const getJobPostTags = async (): Promise<
  { id: string; label: string; value: string }[] | undefined
> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    return await prisma.jobPostTag.findMany({ orderBy: { label: "asc" } });
  } catch (error) {
    handleError(error, "Failed to fetch job post tags.");
    return undefined;
  }
};

export const getJobPostUniqueLocations = async (): Promise<string[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    const posts = await prisma.jobPost.findMany({
      where: { userId: user.id, status: 'active' },
      select: { locations: true },
    });
    const all = posts.flatMap((p) => p.locations);
    return [...new Set(all)].sort();
  } catch {
    return [];
  }
};
