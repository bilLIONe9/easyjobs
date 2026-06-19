'use client'
import Link from 'next/link'
import { useMutation, useLazyQuery } from '@apollo/client/react'
import {
  Sparkles, Loader2, CheckCircle2, XCircle,
  ChevronDown, FileText, Copy,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GENERATE_CV,
  JOB_APPLICATION_QUERY,
  UPDATE_APPLICATION,
  PROFILE_RESUME_DRAFTS_QUERY,
} from '@/lib/graphql/queries'

interface Props {
  applicationId: string
  jobProfileId?: string | null
  resume?: { id: string; title: string } | null
  initialStatus?: string | null
}

function CloneFromProfileButton({
  jobProfileId,
  drafts,
  loading,
  onOpen,
  onSelect,
}: {
  jobProfileId: string
  drafts: any[]
  loading: boolean
  onOpen: () => void
  onSelect: (id: string) => void
}) {
  return (
    <DropdownMenu onOpenChange={(open) => { if (open) onOpen() }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" disabled={loading}>
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Copy className="h-3.5 w-3.5" />}
          Clone from Profile
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-[240px]">
        {loading ? (
          <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading drafts…
          </div>
        ) : drafts.length === 0 ? (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">No resume drafts on this profile.</div>
        ) : (
          drafts.map((d: any) => (
            <DropdownMenuItem key={d.id} onClick={() => onSelect(d.id)}>
              <FileText className="h-3.5 w-3.5 mr-2 shrink-0" />
              <span className="truncate">{d.title}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CVActionButton({ applicationId, jobProfileId, resume, initialStatus }: Props) {
  const refetchQueries = [{ query: JOB_APPLICATION_QUERY, variables: { id: applicationId } }]

  const [loadDrafts, { data: draftsData, loading: draftsLoading }] = useLazyQuery(
    PROFILE_RESUME_DRAFTS_QUERY,
  )

  const [generateCV, { loading: generating }] = useMutation(GENERATE_CV, {
    variables: { applicationId },
    refetchQueries,
  })

  const [linkResume, { loading: linking }] = useMutation(UPDATE_APPLICATION, {
    refetchQueries,
  })

  const cloneFromDraft = (draftId: string) => {
    linkResume({ variables: { id: applicationId, input: { resumeId: draftId } } })
  }

  const drafts = (draftsData as any)?.profileResumeDrafts ?? []
  const cloneLoading = draftsLoading || linking

  // ── In progress ──────────────────────────────────────────────────────────────
  if (initialStatus === 'pending' || initialStatus === 'queued' || initialStatus === 'generating') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {initialStatus === 'generating' ? 'Generating resume…' : 'Queued…'}
      </div>
    )
  }

  // ── Has resume ───────────────────────────────────────────────────────────────
  if (resume) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm text-green-600 min-w-0">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="truncate text-foreground font-medium">{resume.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link href={`/dashboard/profile/resume/${resume.id}`} target='_blank'>
              <ExternalLink className="h-3.5 w-3.5" />
              View Resume
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={generating}>
                {generating
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ChevronDown className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => generateCV()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate with AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  // ── Generation failed ─────────────────────────────────────────────────────
  if (initialStatus === 'failed') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-destructive">Resume generation failed.</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
            disabled={generating}
            onClick={() => generateCV()}
          >
            {generating
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <XCircle className="h-3.5 w-3.5" />}
            Retry with AI
          </Button>
          {jobProfileId && (
            <CloneFromProfileButton
              jobProfileId={jobProfileId}
              drafts={drafts}
              loading={cloneLoading}
              onOpen={() => loadDrafts({ variables: { profileId: jobProfileId } })}
              onSelect={cloneFromDraft}
            />
          )}
        </div>
      </div>
    )
  }

  // ── No resume ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={generating}
        onClick={() => generateCV()}
      >
        {generating
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Sparkles className="h-3.5 w-3.5" />}
        Generate with AI
      </Button>
      {jobProfileId ? (
        <CloneFromProfileButton
          jobProfileId={jobProfileId}
          drafts={drafts}
          loading={cloneLoading}
          onOpen={() => loadDrafts({ variables: { profileId: jobProfileId } })}
          onSelect={cloneFromDraft}
        />
      ) : (
        <p className="text-xs text-muted-foreground self-center">
          Assign a job profile to clone from profile drafts.
        </p>
      )}
    </div>
  )
}
