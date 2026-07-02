import { GraphQLContext, requireAuth } from '../context'

const PAGE_SIZE = 20

export const jobPostResolvers = {
  Query: {
    jobPosts: async (
      _: unknown,
      args: { filter?: { status?: string; search?: string; startDate?: string; createdAfter?: string; excludeProfileIds?: string[]; location?: string; locations?: string[]; tags?: string[] }; page?: number; limit?: number },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      const page = args.page ?? 1
      const limit = args.limit ?? PAGE_SIZE
      const skip = (page - 1) * limit
      const { filter } = args

      const where: any = {}
      if (filter?.status) where.status = filter.status
      if (filter?.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { postedBy: { contains: filter.search, mode: 'insensitive' } },
        ]
      }
      if (filter?.locations?.length) {
        where.locations = { hasSome: filter.locations }
      } else if (filter?.location) {
        where.locations = { has: filter.location }
      }
      if (filter?.startDate) where.postedAt = { gte: new Date(filter.startDate) }
      if (filter?.createdAfter) where.createdAt = { gte: new Date(filter.createdAfter) }
      if (filter?.tags?.length) {
        where.tags = { some: { value: { in: filter.tags } } }
      }
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
          where, skip, take: limit, orderBy: { updatedAt: 'desc' },
          include: {
            _count: { select: { applications: true } },
            applications: { select: { jobProfileId: true } },
            tags: true,
          },
        }),
        ctx.prisma.jobPost.count({ where }),
      ])

      return { items, total, page, totalPages: Math.ceil(total / limit) }
    },

    jobPost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.findFirst({
        where: { id: args.id, userId },
        include: { applications: true, tags: true },
      })
    },

    checkDuplicateJobPosts: async (
      _: unknown,
      args: { title: string; postedBy: string; excludeId?: string },
      ctx: GraphQLContext,
    ) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.findMany({
        where: {
          userId,
          title: { contains: args.title, mode: 'insensitive' },
          postedBy: { contains: args.postedBy, mode: 'insensitive' },
          ...(args.excludeId ? { id: { not: args.excludeId } } : {}),
        },
        orderBy: { postedAt: 'desc' },
        take: 5,
        include: { tags: true },
      })
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

    jobPostTags: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx.userId)
      return ctx.prisma.jobPostTag.findMany({ orderBy: { label: 'asc' } })
    },
  },

  Mutation: {
    createJobPost: async (_: unknown, args: { input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const { tagIds, ...rest } = args.input
      return ctx.prisma.jobPost.create({
        data: {
          ...rest,
          userId,
          postedAt: new Date(rest.postedAt),
          ...(tagIds?.length ? { tags: { connect: tagIds.map((id: string) => ({ id })) } } : {}),
        },
        include: { tags: true },
      })
    },

    updateJobPost: async (_: unknown, args: { id: string; input: any }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      const { tagIds, ...rest } = args.input
      const data: any = { ...rest }
      if (data.postedAt) data.postedAt = new Date(data.postedAt)
      if (tagIds !== undefined) {
        data.tags = { set: tagIds.map((id: string) => ({ id })) }
      }
      return ctx.prisma.jobPost.update({
        where: { id: args.id, userId },
        data,
        include: { tags: true },
      })
    },

    setJobPostStatus: async (_: unknown, args: { id: string; status: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.update({
        where: { id: args.id, userId },
        data: { status: args.status },
        include: { tags: true },
      })
    },

    deleteJobPost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      await ctx.prisma.jobPost.delete({ where: { id: args.id, userId } })
      return true
    },

    createJobPostTag: async (_: unknown, args: { label: string }, ctx: GraphQLContext) => {
      requireAuth(ctx.userId)
      const value = args.label.toLowerCase().trim().replace(/\s+/g, '-')
      return ctx.prisma.jobPostTag.upsert({
        where: { value },
        update: {},
        create: { label: args.label.trim(), value },
      })
    },

    setJobPostTags: async (_: unknown, args: { jobPostId: string; tagIds: string[] }, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx.userId)
      return ctx.prisma.jobPost.update({
        where: { id: args.jobPostId, userId },
        data: { tags: { set: args.tagIds.map((id) => ({ id })) } },
        include: { tags: true },
      })
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
    tags: (parent: any) => parent.tags ?? [],
    postedAt: (parent: any) => parent.postedAt instanceof Date ? parent.postedAt.toISOString() : parent.postedAt,
    createdAt: (parent: any) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt,
    updatedAt: (parent: any) => parent.updatedAt instanceof Date ? parent.updatedAt.toISOString() : parent.updatedAt,
  },

  JobPostTag: {
    id: (parent: any) => parent.id,
    label: (parent: any) => parent.label,
    value: (parent: any) => parent.value,
  },
}
