import { Metadata } from 'next'
import { JobPostsContainer } from '@/components/job-posts/JobPostsContainer'
import { getAllJobLocations } from '@/actions/jobLocation.actions'
import { getJobPostTags } from '@/actions/jobPost.actions'

export const metadata: Metadata = { title: 'Job Posts | JobSync' }

export default async function JobPostsPage() {
  const [locations, tags] = await Promise.all([
    getAllJobLocations(),
    getJobPostTags(),
  ])

  return (
    <JobPostsContainer
      initialLocations={Array.isArray(locations) ? locations : []}
      initialTags={Array.isArray(tags) ? tags : []}
    />
  )
}
