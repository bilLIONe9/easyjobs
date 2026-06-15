'use client'
import { useState } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client/react'
import { MapPin, DollarSign, User, Calendar, ExternalLink, MoreHorizontal, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SET_JOB_POST_STATUS, DELETE_JOB_POST, JOB_POSTS_QUERY, JOB_POST_QUERY } from '@/lib/graphql/queries'
import { SaveToApplyDialog } from './SaveToApplyDialog'
import { JobPostForm } from './JobPostForm'
import { format } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  inappropriate: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
}

interface JobPostCardProps {
  post: {
    id: string
    title: string
    salary?: string | null
    locations?: string[] | null
    postedAt: string
    postedBy: string
    sourceUrl?: string | null
    status: string
    applicationCount: number
    savedProfileIds: string[]
  }
  onSaved?: () => void
}

export function JobPostCard({ post, onSaved }: JobPostCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [setStatus] = useMutation(SET_JOB_POST_STATUS, { refetchQueries: [JOB_POSTS_QUERY] })
  const [deletePost] = useMutation(DELETE_JOB_POST, { refetchQueries: [JOB_POSTS_QUERY] })
  const [fetchPost, { data: fullPostData, loading: fetchingPost }] = useLazyQuery(JOB_POST_QUERY)

  function handleEditClick() {
    setEditOpen(true)
    fetchPost({ variables: { id: post.id } })
  }

  const fullPost = (fullPostData as any)?.jobPost
  const locations = post.locations ?? []

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">{post.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <User className="h-3 w-3" />
                {post.postedBy}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge className={`text-xs ${STATUS_COLORS[post.status] ?? ''}`} variant="outline">
                {post.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditClick}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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
                    onClick={() => deletePost({ variables: { id: post.id } })}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {locations.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {locations.join(' · ')}
              </span>
            )}
            {post.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {post.salary}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(post.postedAt), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {post.applicationCount > 0
                ? `${post.applicationCount} application${post.applicationCount !== 1 ? 's' : ''}`
                : 'Not applied yet'}
            </span>
            <div className="flex items-center gap-1">
              {post.sourceUrl && (
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                  <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={post.status !== 'active'}
                onClick={() => setDialogOpen(true)}
              >
                Save to Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SaveToApplyDialog
        jobPostId={post.id}
        jobPostTitle={post.title}
        savedProfileIds={post.savedProfileIds}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={onSaved}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Post</DialogTitle>
          </DialogHeader>
          {fetchingPost || !fullPost ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <JobPostForm
              editPost={fullPost}
              onSuccess={() => setEditOpen(false)}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
