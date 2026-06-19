import { Metadata } from 'next'
import { NewJobProfileResumeView } from '@/components/job-profiles/NewJobProfileResumeView'

export const metadata: Metadata = { title: 'New Resume Template | JobSync' }

export default function NewJobProfileResumePage() {
  return <NewJobProfileResumeView />
}
