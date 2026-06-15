import { GraphQLContext, requireAuth } from '../context'

const PAGE_SIZE = 20

export const jobApplicationResolvers = {
  Query: {
    jobApplications: async (
      _: unknown,
      args: { filter?: any; page?: number; limit?: number },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const page = args.page ?? 1
      const limit = args.limit ?? PAGE_SIZE
      const skip = (page - 1) * limit
      const { filter } = args

      const where: any = { userId }
      if (filter?.status) where.currentStatus = filter.status
      if (filter?.profileId) where.jobProfileId = filter.profileId
      if (filter?.cvReady === true) where.cvGenerationStatus = 'done'
      if (filter?.startDate) where.createdAt = { ...where.createdAt, gte: new Date(filter.startDate) }
      if (filter?.endDate) where.createdAt = { ...where.createdAt, lte: new Date(filter.endDate) }
      if (filter?.search) {
        where.jobPost = { title: { contains: filter.search, mode: 'insensitive' } }
      }

      const [items, total] = await Promise.all([
        ctx.prisma.jobApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            jobPost: true,
            jobProfile: true,
            resume: { select: { id: true, title: true } },
          },
        }),
        ctx.prisma.jobApplication.count({ where }),
      ])

      return { items, total, page, totalPages: Math.ceil(total / limit) }
    },

    jobApplication: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobApplication.findFirst({
        where: { id: args.id, userId },
        include: {
          jobPost: true,
          jobProfile: true,
          resume: { select: { id: true, title: true } },
          statusHistory: { orderBy: { changedAt: 'asc' } },
          customQuestions: { orderBy: { sortOrder: 'asc' } },
        },
      })
    },

    applicationInsights: async (
      _: unknown,
      args: { startDate?: string; endDate?: string },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const dateFilter: any = {}
      if (args.startDate) dateFilter.gte = new Date(args.startDate)
      if (args.endDate) dateFilter.lte = new Date(args.endDate)

      const where: any = { userId }
      if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter

      const [applications, allHistories, cvReadyCount] = await Promise.all([
        ctx.prisma.jobApplication.findMany({ where, select: { id: true, currentStatus: true } }),
        ctx.prisma.applicationStatusHistory.findMany({
          where: { application: { userId } },
          orderBy: { changedAt: 'asc' },
        }),
        ctx.prisma.jobApplication.count({ where: { userId, cvGenerationStatus: 'done' } }),
      ])

      // Status counts
      const statusMap: Record<string, number> = {}
      for (const app of applications) {
        statusMap[app.currentStatus] = (statusMap[app.currentStatus] ?? 0) + 1
      }
      const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

      // Group histories by applicationId and compute durations
      const historyByApp: Record<string, any[]> = {}
      for (const h of allHistories) {
        if (!historyByApp[h.applicationId]) historyByApp[h.applicationId] = []
        historyByApp[h.applicationId].push(h)
      }

      const transitions: Record<string, { total: number; count: number }> = {}
      for (const entries of Object.values(historyByApp)) {
        for (let i = 1; i < entries.length; i++) {
          const key = `${entries[i - 1].status}→${entries[i].status}`
          const diffDays = (entries[i].changedAt.getTime() - entries[i - 1].changedAt.getTime()) / 86400000
          if (!transitions[key]) transitions[key] = { total: 0, count: 0 }
          transitions[key].total += diffDays
          transitions[key].count++
        }
      }

      const avgDaysByStatus = Object.entries(transitions).map(([key, val]) => {
        const [fromStatus, toStatus] = key.split('→')
        return { fromStatus, toStatus, avgDays: Math.round((val.total / val.count) * 10) / 10 }
      })

      // Recent status changes (last 10)
      const recentHistories = await ctx.prisma.applicationStatusHistory.findMany({
        where: { application: { userId } },
        orderBy: { changedAt: 'desc' },
        take: 10,
        include: { application: { include: { jobPost: { select: { title: true } } } } },
      })

      const now = new Date()
      const recentStatusChanges = recentHistories.map((h: any) => ({
        applicationId: h.applicationId,
        jobTitle: h.application.jobPost.title,
        toStatus: h.status,
        fromStatus: null,
        changedAt: h.changedAt.toISOString(),
        daysSinceChange: Math.floor((now.getTime() - h.changedAt.getTime()) / 86400000),
      }))

      return {
        totalApplications: applications.length,
        byStatus,
        cvReadyCount,
        avgDaysByStatus,
        recentStatusChanges,
      }
    },
  },

  Mutation: {
    saveJobPostToApply: async (
      _: unknown,
      args: { jobPostId: string; profileId?: string },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const application = await ctx.prisma.jobApplication.create({
        data: {
          userId,
          jobPostId: args.jobPostId,
          jobProfileId: args.profileId ?? null,
          currentStatus: 'saved',
          cvGenerationStatus: null,
          statusHistory: { create: { status: 'saved' } },
        },
        include: {
          jobPost: true,
          jobProfile: true,
          statusHistory: true,
          customQuestions: true,
        },
      })

      return application
    },

    updateApplicationStatus: async (
      _: unknown,
      args: { id: string; status: string; note?: string },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const [application] = await ctx.prisma.$transaction([
        ctx.prisma.jobApplication.update({
          where: { id: args.id, userId },
          data: {
            currentStatus: args.status,
            statusHistory: { create: { status: args.status, note: args.note ?? null } },
          },
          include: {
            jobPost: true,
            jobProfile: true,
            statusHistory: { orderBy: { changedAt: 'asc' } },
            customQuestions: { orderBy: { sortOrder: 'asc' } },
          },
        }),
      ])
      return application
    },

    updateApplication: async (_: unknown, args: { id: string; input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const { customQuestions, ...data } = args.input

      return ctx.prisma.$transaction(async (tx: any) => {
        if (customQuestions) {
          // Upsert questions
          for (const q of customQuestions) {
            if (q.id) {
              await tx.applicationQuestion.update({
                where: { id: q.id },
                data: { question: q.question, answer: q.answer, questionType: q.questionType, sortOrder: q.sortOrder },
              })
            } else {
              await tx.applicationQuestion.create({
                data: { applicationId: args.id, question: q.question, answer: q.answer, questionType: q.questionType ?? 'text', sortOrder: q.sortOrder ?? 0 },
              })
            }
          }
        }

        return tx.jobApplication.update({
          where: { id: args.id, userId },
          data,
          include: {
            jobPost: true,
            jobProfile: true,
            statusHistory: { orderBy: { changedAt: 'asc' } },
            customQuestions: { orderBy: { sortOrder: 'asc' } },
          },
        })
      })
    },

    deleteApplicationQuestion: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const question = await ctx.prisma.applicationQuestion.findFirst({
        where: { id: args.id, application: { userId } },
      })
      if (!question) throw new Error('Question not found')
      await ctx.prisma.applicationQuestion.delete({ where: { id: args.id } })
      return true
    },

    deleteApplication: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      await ctx.prisma.jobApplication.delete({ where: { id: args.id, userId } })
      return true
    },
  },

  JobApplication: {
    createdAt: (parent: any) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt,
    updatedAt: (parent: any) => parent.updatedAt instanceof Date ? parent.updatedAt.toISOString() : parent.updatedAt,

    statusHistory: async (parent: any, _: unknown, ctx: GraphQLContext) => {
      const histories =
        parent.statusHistory ??
        (await ctx.prisma.applicationStatusHistory.findMany({
          where: { applicationId: parent.id },
          orderBy: { changedAt: 'asc' },
        }))

      return histories.map((h: any, i: number) => ({
        ...h,
        changedAt: h.changedAt instanceof Date ? h.changedAt.toISOString() : h.changedAt,
        durationFromPreviousMinutes:
          i === 0
            ? null
            : Math.floor((new Date(h.changedAt).getTime() - new Date(histories[i - 1].changedAt).getTime()) / 60000),
      }))
    },
  },
}
