'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusTimeline } from './StatusTimeline'
import { UPDATE_APPLICATION_STATUS } from '@/lib/graphql/queries'

const APPLICATION_STATUSES = [
  'saved', 'applied', 'phone_screen', 'interview', 'technical_test', 'offer', 'rejected', 'withdrawn',
]

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface StatusEntry {
  id: string
  status: string
  changedAt: string
  note?: string | null
  durationFromPreviousMinutes?: number | null
}

interface Props {
  id: string
  jobPostId: string
  jobTitle: string
  company: string
  currentStatus: string
  statusHistory: StatusEntry[]
}

export function ApplicationStatusCard({ id, jobPostId, jobTitle, company, currentStatus, statusHistory }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [history, setHistory] = useState<StatusEntry[]>(statusHistory)

  const [updateStatus] = useMutation(UPDATE_APPLICATION_STATUS, {
    onCompleted: (data: any) => {
      const result = data?.updateApplicationStatus
      if (result) {
        setStatus(result.currentStatus)
        setHistory(result.statusHistory)
      }
    },
  })

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/job-posts/${jobPostId}`}
            className="group inline-flex items-center gap-1.5 hover:underline"
          >
            <h1 className="text-xl font-bold">{jobTitle}</h1>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5">{company}</p>
        </div>
        <Badge variant="outline" className="shrink-0">{formatLabel(status)}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground whitespace-nowrap">Update status:</Label>
        <Select
          value={status}
          onValueChange={(v) => updateStatus({ variables: { id, status: v } })}
        >
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{formatLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {history.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Status History</p>
          <StatusTimeline history={history} />
        </div>
      )}
    </div>
  )
}
