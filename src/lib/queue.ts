import { Queue } from 'bullmq'

// Upstash Redis connection — TLS required
const connection = {
  host: process.env.UPSTASH_REDIS_HOST!,
  port: Number(process.env.UPSTASH_REDIS_PORT ?? 6379),
  password: process.env.UPSTASH_REDIS_PASSWORD!,
  tls: {},
  maxRetriesPerRequest: null, // required by BullMQ
}

// Producer only — the external CV generation server consumes from this queue
export const CV_GENERATION_QUEUE = 'cv-generation'

export const cvGenerationQueue = new Queue(CV_GENERATION_QUEUE, { connection })
