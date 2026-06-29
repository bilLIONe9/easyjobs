import { Metadata } from 'next'
import { ProfileApplicationsView } from '@/components/job-profiles/ProfileApplicationsView'

export const metadata: Metadata = { title: 'Applications | JobSync' }

export default function ProfileApplicationsPage() {
  return <ProfileApplicationsView />
}
