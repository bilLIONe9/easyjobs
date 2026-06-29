'use client'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JOB_PROFILE_QUERY } from '@/lib/graphql/queries'
import { ProfileInfoTab } from './ProfileInfoTab'
import { ResumeDraftsPageView } from './ResumeDraftsPageView'
import { ProfileLayoutHeader } from './ProfileLayoutHeader'

export function ProfilePageView() {
  const { id: profileId } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get('tab') ?? 'basic-info'

  const { data, loading } = useQuery(JOB_PROFILE_QUERY, {
    variables: { id: profileId },
  })
  const profile = (data as any)?.jobProfile

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'basic-info') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  if (loading) {
    return (
      <div className="col-span-3 space-y-4">
        <ProfileLayoutHeader />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="col-span-3 space-y-4">
        <ProfileLayoutHeader />
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="col-span-3 space-y-4">
      <ProfileLayoutHeader />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="resume-templates">
            Resume Templates
            {profile.resumeDraftCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs py-0 px-1.5">
                {profile.resumeDraftCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="mt-6">
          <ProfileInfoTab profile={profile} />
        </TabsContent>

        <TabsContent value="resume-templates" className="mt-6">
          <ResumeDraftsPageView profileId={profileId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
