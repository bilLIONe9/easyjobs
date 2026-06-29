'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft, ExternalLink, MapPin, DollarSign, Calendar,
  Briefcase, Pencil, Loader2, MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { JOB_POST_QUERY, JOB_POSTS_QUERY, SET_JOB_POST_STATUS, DELETE_JOB_POST } from '@/lib/graphql/queries'
import { JobPostForm } from '@/components/job-posts/JobPostForm'
import { SaveToApplyDialog } from '@/components/job-posts/SaveToApplyDialog'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  inappropriate: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
}

export default function JobPostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const { data, loading } = useQuery(JOB_POST_QUERY, { variables: { id } })
  const [setStatus] = useMutation(SET_JOB_POST_STATUS, { refetchQueries: [JOB_POST_QUERY, JOB_POSTS_QUERY] })
  const [deletePost, { loading: deleting }] = useMutation(DELETE_JOB_POST, {
    refetchQueries: [JOB_POSTS_QUERY],
    onCompleted: () => router.push('/dashboard/job-posts'),
  })

  const post = (data as any)?.jobPost

  if (loading) {
    return (
      <div className="col-span-3 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground text-sm">Job post not found.</p>
        <Link href="/dashboard/job-posts" className="mt-2">
          <Button variant="outline" size="sm">Back to job posts</Button>
        </Link>
      </div>
    )
  }

  const locations: string[] = post.locations ?? []

  return (
    <div className="col-span-3 max-w-3xl space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard/job-posts">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Job Posts
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {post.sourceUrl && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Source
              </a>
            </Button>
          )}
          <Button
            variant={editing ? 'secondary' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => setEditing((v) => !v)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {editing ? 'Cancel Edit' : 'Edit'}
          </Button>
          <Button
            size="sm"
            disabled={post.status !== 'active'}
            onClick={() => setSaveDialogOpen(true)}
          >
            Save to Apply
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.status !== 'closed' && (
                <DropdownMenuItem onClick={() => setStatus({ variables: { id: post.id, status: 'closed' } })}>
                  Mark as Closed
                </DropdownMenuItem>
              )}
              {post.status !== 'inappropriate' && (
                <DropdownMenuItem onClick={() => setStatus({ variables: { id: post.id, status: 'inappropriate' } })}>
                  Mark as Inappropriate
                </DropdownMenuItem>
              )}
              {post.status !== 'active' && (
                <DropdownMenuItem onClick={() => setStatus({ variables: { id: post.id, status: 'active' } })}>
                  Mark as Active
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                disabled={deleting}
                onClick={() => deletePost({ variables: { id: post.id } })}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl font-bold leading-tight flex-1">{post.title}</h1>
          <Badge className={`text-sm shrink-0 ${STATUS_COLORS[post.status] ?? ''}`} variant="outline">
            {post.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{post.postedBy}</span>
          {locations.length > 0 && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {locations.join(' · ')}
            </span>
          )}
          {post.salary && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {post.salary}
            </span>
          )}
          {post.jobType && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {post.jobType}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Posted {format(new Date(post.postedAt.slice(0, 10) + 'T00:00:00'), 'MMM d, yyyy')}
          </span>
          <span>
            {post.applicationCount > 0
              ? `${post.applicationCount} application${post.applicationCount !== 1 ? 's' : ''}`
              : 'No applications yet'}
          </span>
        </div>
        {post.jobSource && (
          <p className="text-xs text-muted-foreground mt-1">Source: {post.jobSource}</p>
        )}
      </div>

      <Separator />

      {editing ? (
        <div>
          <h2 className="text-base font-semibold mb-4">Edit Job Post</h2>
          <JobPostForm
            editPost={post}
            onSuccess={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        post.description && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />
        )
      )}

      <SaveToApplyDialog
        jobPostId={post.id}
        jobPostTitle={post.title}
        savedProfileIds={post.savedProfileIds ?? []}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
    </div>
  )
}
