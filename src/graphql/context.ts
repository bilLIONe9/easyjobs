import { YogaInitialContext } from 'graphql-yoga'
import { auth } from '@/auth'
import prisma from '@/lib/db'

export type GraphQLContext = {
  prisma: typeof prisma
  userId: string | null
  isWebhook: boolean
}

export async function createContext(initialContext: YogaInitialContext): Promise<GraphQLContext> {
  const session = await auth()
  const authHeader = initialContext.request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const isWebhook =
    !!token && !!process.env.CV_WEBHOOK_SECRET && token === process.env.CV_WEBHOOK_SECRET

  return {
    prisma,
    userId: session?.user?.id ?? null,
    isWebhook,
  }
}

export function requireAuth(userId: string | null): string {
  if (!userId) throw new Error('Not authenticated')
  return userId
}
