import { GraphQLContext, requireAuth } from '../context'

const PAGE_SIZE = 20

export const jobPostResolvers = {
  Query: {
    jobPosts: async (
      _: unknown,
      args: { filter?: { status?: string; search?: string; startDate?: string; excludeProfileIds?: string[] }; page?: number; limit?: number },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const page = args.page ?? 1
      const limit = args.limit ?? PAGE_SIZE
      const skip = (page - 1) * limit
      const { filter } = args

      const where: any = { userId }
      if (filter?.status) where.status = filter.status
      if (filter?.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { postedBy: { contains: filter.search, mode: 'insensitive' } },
          { location: { contains: filter.search, mode: 'insensitive' } },
        ]
      }
      if (filter?.startDate) where.postedAt = { gte: new Date(filter.startDate) }
      if (filter?.excludeProfileIds?.length) {
        const saved = await ctx.prisma.jobApplication.findMany({
          where: { userId, jobProfileId: { in: filter.excludeProfileIds } },
          select: { jobPostId: true },
        })
        const excludeIds = [...new Set(saved.map((a: any) => a.jobPostId))]
        if (excludeIds.length) where.id = { notIn: excludeIds }
      }

      const [items, total] = await Promise.all([
        ctx.prisma.jobPost.findMany({
          where, skip, take: limit, orderBy: { postedAt: 'desc' },
          include: {
            _count: { select: { applications: true } },
            applications: { select: { jobProfileId: true } },
          },
        }),
        ctx.prisma.jobPost.count({ where }),
      ])

      return { items, total, page, totalPages: Math.ceil(total / limit) }
    },

    jobPost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.findFirst({ where: { id: args.id, userId }, include: { applications: true } })
    },

    jobPostInsights: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const [total, active, closed, inappropriate, savedToApply] = await Promise.all([
        ctx.prisma.jobPost.count({ where: { userId } }),
        ctx.prisma.jobPost.count({ where: { userId, status: 'active' } }),
        ctx.prisma.jobPost.count({ where: { userId, status: 'closed' } }),
        ctx.prisma.jobPost.count({ where: { userId, status: 'inappropriate' } }),
        ctx.prisma.jobApplication.count({ where: { userId } }),
      ])
      return { total, active, closed, inappropriate, savedToApply }
    },
  },

  Mutation: {
    createJobPost: async (_: unknown, args: { input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.create({
        data: { ...args.input, userId, postedAt: new Date(args.input.postedAt) },
      })
    },

    updateJobPost: async (_: unknown, args: { id: string; input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const data: any = { ...args.input }
      if (data.postedAt) data.postedAt = new Date(data.postedAt)
      return ctx.prisma.jobPost.update({ where: { id: args.id, userId }, data })
    },

    setJobPostStatus: async (_: unknown, args: { id: string; status: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.update({ where: { id: args.id, userId }, data: { status: args.status } })
    },

    deleteJobPost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      await ctx.prisma.jobPost.delete({ where: { id: args.id, userId } })
      return true
    },
  },

  JobPost: {
    applicationCount: (parent: any) => parent._count?.applications ?? 0,
    savedProfileIds: (parent: any) =>
      (parent.applications ?? []).map((a: any) => a.jobProfileId).filter(Boolean),
    applications: async (parent: any, _: unknown, ctx: GraphQLContext) => {
      if (parent.applications) return parent.applications
      return ctx.prisma.jobApplication.findMany({ where: { jobPostId: parent.id } })
    },
    postedAt: (parent: any) => parent.postedAt instanceof Date ? parent.postedAt.toISOString() : parent.postedAt,
    createdAt: (parent: any) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt,
    updatedAt: (parent: any) => parent.updatedAt instanceof Date ? parent.updatedAt.toISOString() : parent.updatedAt,
  },
}
