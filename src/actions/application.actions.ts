'use server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/utils/user.utils'

export async function getApplicationById(id: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const app = await prisma.jobApplication.findUnique({
    where: { id, userId: user.id },
    include: {
      jobPost: true,
      jobProfile: true,
      resume: {
        select: {
          id: true,
          title: true,
          summary: true,
          contactInfo: true,
          experiences: true,
          skills: true,
        },
      },
      statusHistory: { orderBy: { changedAt: 'asc' } },
      customQuestions: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!app) return null

  return {
    ...app,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    jobPost: {
      ...app.jobPost,
      postedAt: app.jobPost.postedAt.toISOString(),
      createdAt: app.jobPost.createdAt.toISOString(),
      updatedAt: app.jobPost.updatedAt.toISOString(),
    },
    statusHistory: app.statusHistory.map((h, i) => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
      durationFromPreviousMinutes:
        i === 0
          ? null
          : Math.floor(
              (h.changedAt.getTime() - app.statusHistory[i - 1].changedAt.getTime()) / 60000,
            ),
    })),
    customQuestions: app.customQuestions.map((q) => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    })),
  }
}

export type ApplicationDetail = NonNullable<Awaited<ReturnType<typeof getApplicationById>>>
