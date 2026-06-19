'use client'
import { useQuery } from '@apollo/client/react'
import { ChevronRight, FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PROFILE_RESUME_DRAFTS_QUERY } from '@/lib/graphql/queries'

interface Props {
  profileId: string
}

export function ResumeDraftsPageView({ profileId }: Props) {
  const { data, loading } = useQuery(PROFILE_RESUME_DRAFTS_QUERY, { variables: { profileId } })
  const drafts: any[] = (data as any)?.profileResumeDrafts ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Reusable resume templates for this profile.
        </p>
        <Link href={`/dashboard/job-profiles/${profileId}/resume/new`}>
          <Button size="sm" className="gap-1 shrink-0">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
          <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No resume templates yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create one to reuse when applying to jobs.
          </p>
          <Link href={`/dashboard/job-profiles/${profileId}/resume/new`} className="mt-4">
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((d: any) => (
            <Link
              key={d.id}
              href={`/dashboard/job-profiles/${profileId}/resume/${d.id}`}
              className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate group-hover:underline">{d.title}</p>
                  {d.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {d.summary}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
