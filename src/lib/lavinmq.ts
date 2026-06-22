import amqp from 'amqplib'

export const QUEUES = {
  GENERATE_CV: 'generate_cv',
} as const

export interface GenerateCVProfile {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  linkedin?: string
  github?: string
  details: string
}

export interface GenerateCVPayload {
  profile: GenerateCVProfile
  applicationId: string
  jobDescription: string
}

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>

let connection: AmqpConnection | null = null
let channel: AmqpChannel | null = null

async function getChannel(): Promise<AmqpChannel> {
  if (channel) return channel

  const url = process.env.LAVINMQ_URL
  if (!url) throw new Error('LAVINMQ_URL is not set')

  const conn = await amqp.connect(url)
  connection = conn
  const ch = await conn.createChannel()
  channel = ch
  await ch.assertQueue(QUEUES.GENERATE_CV, { durable: true })

  conn.on('close', () => { connection = null; channel = null })
  conn.on('error', () => { connection = null; channel = null })

  return ch
}

export async function enqueueGenerateCV(payload: GenerateCVPayload): Promise<void> {
  const ch = await getChannel()
  ch.sendToQueue(
    QUEUES.GENERATE_CV,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true },
  )
}
