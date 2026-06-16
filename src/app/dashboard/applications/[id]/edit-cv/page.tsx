'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  JOB_APPLICATION_QUERY,
  PROFILE_RESUME_DRAFTS_QUERY,
  RESUME_DRAFT_QUERY,
  UPDATE_RESUME_CV_DATA,
} from '@/lib/graphql/queries'

export default function EditCvPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [cvJson, setCvJson] = useState('')
  const [cvError, setCvError] = useState<string | null>(null)
  const [selectedDraftId, setSelectedDraftId] = useState<string>('none')

  const { data, loading } = useQuery(JOB_APPLICATION_QUERY, { variables: { id } })
  const app = (data as any)?.jobApplication
  const resumeId = app?.resume?.id
  const profileId = app?.jobProfile?.id

  const { data: resumeData, loading: resumeLoading } = useQuery(RESUME_DRAFT_QUERY, {
    variables: { id: resumeId },
    skip: !resumeId,
  })
  const linkedResume = (resumeData as any)?.resumeDraft

  const { data: draftsData, loading: draftsLoading } = useQuery(PROFILE_RESUME_DRAFTS_QUERY, {
    variables: { profileId },
    skip: !profileId,
  })
  const drafts: any[] = (draftsData as any)?.profileResumeDrafts ?? []

  useEffect(() => {
    if (linkedResume?.cvData) {
      setCvJson(JSON.stringify(linkedResume.cvData, null, 2))
    }
  }, [linkedResume])

  const [updateResumeCvData, { loading: saving }] = useMutation(UPDATE_RESUME_CV_DATA, {
    onCompleted: () => {
      router.push(`/dashboard/applications/${id}`)
    },
  })

  const applyDraft = () => {
    if (selectedDraftId === 'none') return
    const draft = drafts.find((d: any) => d.id === selectedDraftId)
    if (draft) {
      setCvJson(JSON.stringify(draft.cvData, null, 2))
      setCvError(null)
    }
  }

  const handleSave = () => {
    if (!resumeId) return
    setCvError(null)
    let parsed: any
    try {
      parsed = JSON.parse(cvJson)
    } catch {
      setCvError('Invalid JSON — please fix the syntax before saving.')
      return
    }
    updateResumeCvData({ variables: { id: resumeId, cvData: parsed } })
  }

  if (loading) {
    return (
      <div className="col-span-3 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (!app) {
    return <div className="col-span-3 text-muted-foreground text-sm">Application not found.</div>
  }

  if (!resumeId) {
    return (
      <div className="col-span-3 max-w-3xl space-y-4">
        <Link href={`/dashboard/applications/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          No resume linked yet. Generate a CV first from the application page.
        </p>
      </div>
    )
  }

  return (
    <div className="col-span-3 max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/applications/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold">Edit CV</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {app.jobPost.title} — {app.jobPost.postedBy}
        </p>
        {linkedResume && (
          <p className="text-xs text-muted-foreground mt-1">Resume: {linkedResume.title}</p>
        )}
      </div>

      {/* Clone from profile draft */}
      {profileId && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">Clone from Profile Draft</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a resume draft from your <span className="font-medium">{app.jobProfile.name}</span> profile to pre-fill the editor.
            </p>
          </div>
          {draftsLoading ? (
            <p className="text-xs text-muted-foreground">Loading drafts...</p>
          ) : drafts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No resume drafts for this profile yet. Create one on the{' '}
              <Link href="/dashboard/job-profiles" className="underline">Job Profiles</Link> page.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={selectedDraftId} onValueChange={setSelectedDraftId}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Select a draft..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">Select a draft...</SelectItem>
                  {drafts.map((d: any) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">{d.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 shrink-0"
                disabled={selectedDraftId === 'none'}
                onClick={applyDraft}
              >
                <Copy className="h-3.5 w-3.5" />
                Apply
              </Button>
            </div>
          )}
        </div>
      )}

      {/* JSON Editor */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">CV Data (JSON)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {resumeLoading ? 'Loading...' : 'Edit the raw CV structure directly.'}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs sr-only">CV JSON</Label>
          <Textarea
            value={cvJson}
            onChange={(e) => { setCvJson(e.target.value); setCvError(null) }}
            rows={28}
            className="font-mono text-xs"
            disabled={resumeLoading}
            placeholder={'{\n  "contactInfo": {},\n  "summary": "",\n  "workExperiences": [],\n  "skills": []\n}'}
          />
          {cvError && <p className="text-xs text-destructive">{cvError}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pb-8">
        <Link href={`/dashboard/applications/${id}`}>
          <Button variant="outline" size="sm">Cancel</Button>
        </Link>
        <Button size="sm" disabled={saving || resumeLoading} onClick={handleSave}>
          {saving ? 'Saving...' : 'Save CV'}
        </Button>
      </div>
    </div>
  )
}
