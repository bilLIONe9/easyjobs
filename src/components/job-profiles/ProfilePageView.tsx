'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JOB_PROFILE_QUERY } from '@/lib/graphql/queries'
import { ProfileInfoTab } from './ProfileInfoTab'
import { ResumeDraftsPageView } from './ResumeDraftsPageView'

export function ProfilePageView() {
  const { id: profileId } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') ?? 'basic-info'

  const { data, loading } = useQuery(JOB_PROFILE_QUERY, {
    variables: { id: profileId },
  })
  const profile = (data as any)?.jobProfile

  if (loading) {
    return (
      <div className="col-span-3 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="col-span-3 space-y-4">
        <Link href="/dashboard/job-profiles">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />Back to Profiles
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="col-span-3 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/job-profiles">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />Back to Profiles
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        {profile.isDefault && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        <Badge variant="outline" className="text-xs ml-1">
          {profile.applicationCount} app{profile.applicationCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Tabs defaultValue={defaultTab}>
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
