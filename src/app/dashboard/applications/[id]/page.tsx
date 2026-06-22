'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useMutation } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, DollarSign, ExternalLink, Calendar, Plus, Pencil, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusTimeline } from '@/components/applications/StatusTimeline'
import { CVActionButton } from '@/components/applications/CVActionButton'
import {
  JOB_APPLICATION_QUERY,
  UPDATE_APPLICATION_STATUS,
  UPDATE_APPLICATION,
  DELETE_APPLICATION_QUESTION,
} from '@/lib/graphql/queries'

const CoverLetterPdfDialog = dynamic(
  () => import('@/components/applications/CoverLetterPdfDialog').then((m) => ({ default: m.CoverLetterPdfDialog })),
  { ssr: false },
)

const APPLICATION_STATUSES = [
  'saved', 'applied', 'phone_screen', 'interview', 'technical_test', 'offer', 'rejected', 'withdrawn',
]

const QUESTION_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'cover_letter', label: 'Cover letter' },
  { value: 'essay', label: 'Essay / long answer' },
]

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── CV Data display ──────────────────────────────────────────────────────────

function CVDataView({ data }: { data: any }) {
  if (!data) return null
  return (
    <div className="space-y-3 text-sm">
      {data.contactInfo && (
        <div>
          <p className="font-medium">{data.contactInfo.firstName} {data.contactInfo.lastName}</p>
          <p className="text-xs text-muted-foreground">{data.contactInfo.headline}</p>
          <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
            {data.contactInfo.email && <span>{data.contactInfo.email}</span>}
            {data.contactInfo.phone && <span>{data.contactInfo.phone}</span>}
            {data.contactInfo.location && <span>{data.contactInfo.location}</span>}
          </div>
        </div>
      )}
      {data.summary && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-0.5">Summary</p>
          <p className="text-xs">{data.summary}</p>
        </div>
      )}
      {data.workExperiences?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">Experience</p>
          <div className="space-y-2">
            {data.workExperiences.map((w: any, i: number) => (
              <div key={i}>
                <p className="text-xs font-medium">{w.title} — {w.company}</p>
                <p className="text-xs text-muted-foreground">{w.startDate}{w.endDate ? ` – ${w.endDate}` : w.isCurrent ? ' – Present' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.skills?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">Skills</p>
          <div className="flex flex-wrap gap-1">
            {data.skills.flatMap((s: any) => s.items ?? []).map((skill: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Question item ────────────────────────────────────────────────────────────

function QuestionItem({
  question,
  onSave,
  onDelete,
}: {
  question: any
  onSave: (id: string, data: { question: string; answer: string; questionType: string }) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(question.question)
  const [a, setA] = useState(question.answer ?? '')
  const [type, setType] = useState(question.questionType ?? 'text')

  const handleSave = () => {
    onSave(question.id, { question: q, answer: a, questionType: type })
    setEditing(false)
  }

  const handleCancel = () => {
    setQ(question.question)
    setA(question.answer ?? '')
    setType(question.questionType ?? 'text')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="rounded border p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">{question.question}</p>
            <p className="text-xs text-muted-foreground capitalize">{formatLabel(question.questionType ?? 'text')}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {question.answer ? (
          <p className="text-xs whitespace-pre-wrap">{question.answer}</p>
        ) : (
          <p className="text-xs text-muted-foreground italic">No answer yet — click edit to add one.</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded border p-3 space-y-2 bg-muted/30">
      <div className="grid gap-1.5">
        <Label className="text-xs">Question</Label>
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="text-xs h-8" />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Answer</Label>
        <Textarea value={a} onChange={(e) => setA(e.target.value)} rows={4} className="text-xs" placeholder="Your answer..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}

// ─── Add question form ────────────────────────────────────────────────────────

function AddQuestionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { question: string; answer: string; questionType: string }) => void
  onCancel: () => void
}) {
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [type, setType] = useState('text')

  return (
    <div className="rounded border border-dashed p-3 space-y-2">
      <div className="grid gap-1.5">
        <Label className="text-xs">Question</Label>
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="text-xs h-8" placeholder="e.g. Why do you want to work here?" />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Answer (optional)</Label>
        <Textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} className="text-xs" placeholder="Your answer..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" disabled={!q.trim()} onClick={() => { if (q.trim()) onSubmit({ question: q, answer: a, questionType: type }) }}>
          Add
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()

  // Cover letter / notes state
  const [coverLetter, setCoverLetter] = useState('')
  const [notes, setNotes] = useState('')
  const [editingCoverLetter, setEditingCoverLetter] = useState(false)
  const [showCoverLetterPdf, setShowCoverLetterPdf] = useState(false)

  // Add-question form visibility
  const [addingQuestion, setAddingQuestion] = useState(false)

  const { data, loading } = useQuery(JOB_APPLICATION_QUERY, {
    variables: { id },
  })

  useEffect(() => {
    const app = (data as any)?.jobApplication
    if (app) {
      setCoverLetter(app.coverLetter ?? '')
      setNotes(app.notes ?? '')
    }
  }, [data])

  const [updateStatus] = useMutation(UPDATE_APPLICATION_STATUS, {
    refetchQueries: [{ query: JOB_APPLICATION_QUERY, variables: { id } }],
  })

  const [updateApplication, { loading: saving }] = useMutation(UPDATE_APPLICATION, {
    refetchQueries: [{ query: JOB_APPLICATION_QUERY, variables: { id } }],
    onCompleted: () => {
      setEditingCoverLetter(false)
      setAddingQuestion(false)
    },
  })

  const [deleteQuestion] = useMutation(DELETE_APPLICATION_QUESTION, {
    refetchQueries: [{ query: JOB_APPLICATION_QUERY, variables: { id } }],
  })

  const saveCoverLetter = () => {
    updateApplication({ variables: { id: app.id, input: { coverLetter, notes } } })
  }

  const saveQuestion = (questionId: string, data: { question: string; answer: string; questionType: string }) => {
    updateApplication({
      variables: {
        id: app.id,
        input: {
          customQuestions: [{ id: questionId, ...data }],
        },
      },
    })
  }

  const addQuestion = (data: { question: string; answer: string; questionType: string }) => {
    updateApplication({
      variables: {
        id: app.id,
        input: {
          customQuestions: [{ ...data }],
        },
      },
    })
  }

  const removeQuestion = (questionId: string) => {
    deleteQuestion({ variables: { id: questionId } })
  }

  if (loading) return <div className="col-span-3"><Skeleton className="h-96 rounded-lg" /></div>

  const app = (data as any)?.jobApplication
  if (!app) return <div className="col-span-3 text-muted-foreground text-sm">Application not found.</div>

  return (
    <div className="col-span-3 space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/applications">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{app.jobPost.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{app.jobPost.postedBy}</p>
          </div>
          <Badge variant="outline" className="shrink-0">{formatLabel(app.currentStatus)}</Badge>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {app.jobPost.locations?.length > 0 && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{app.jobPost.locations.join(' · ')}</span>}
          {app.jobPost.salary && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{app.jobPost.salary}</span>}
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Posted {format(new Date(app.jobPost.postedAt), 'MMM d, yyyy')}</span>
          {app.jobPost.sourceUrl && (
            <a href={app.jobPost.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="h-3 w-3" />View original
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Update status:</Label>
          <Select
            value={app.currentStatus}
            onValueChange={(v) => updateStatus({ variables: { id: app.id, status: v } })}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CV */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">Resume / CV</h2>
          <CVActionButton
            applicationId={app.id}
            initialStatus={app.cvGenerationStatus}
            resume={app.resume}
            jobProfileId={app.jobProfile?.id}
            profileDetails={app.jobProfile?.details}
          />
        </div>

        {/* Job Profile */}
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">Applied With</h2>
          {app.jobProfile ? (
            <div className="text-sm space-y-1">
              <p className="font-medium">{app.jobProfile.name}</p>
              {app.jobProfile.linkedin && <p className="text-xs text-muted-foreground">{app.jobProfile.linkedin}</p>}
              {app.jobProfile.location && <p className="text-xs text-muted-foreground">{app.jobProfile.location}</p>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No profile selected.</p>
          )}
        </div>
      </div>

      {/* Cover Letter & Notes */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Cover Letter & Notes</h2>
          {!editingCoverLetter ? (
            <div className="flex items-center gap-1">
              {app.coverLetter && (
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowCoverLetterPdf(true)}>
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setEditingCoverLetter(true)}>Edit</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingCoverLetter(false)}>Cancel</Button>
              <Button size="sm" disabled={saving} onClick={saveCoverLetter}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {editingCoverLetter ? (
          <>
            <div className="grid gap-1.5">
              <Label className="text-xs">Cover Letter</Label>
              <Textarea value={coverLetter} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoverLetter(e.target.value)} rows={6} placeholder="Write your cover letter..." />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea value={notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)} rows={3} placeholder="Personal notes about this application..." />
            </div>
          </>
        ) : (
          <>
            {app.coverLetter ? <p className="text-sm whitespace-pre-wrap">{app.coverLetter}</p> : <p className="text-xs text-muted-foreground">No cover letter yet.</p>}
            {app.notes && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.notes}</p>
              </>
            )}
          </>
        )}
      </div>

      {showCoverLetterPdf && app.coverLetter && (
        <CoverLetterPdfDialog
          open={showCoverLetterPdf}
          onOpenChange={setShowCoverLetterPdf}
          coverLetter={app.coverLetter}
          profile={{
            name: app.jobProfile?.name ?? '',
            email: app.jobProfile?.email,
            phone: app.jobProfile?.phone,
            linkedin: app.jobProfile?.linkedin,
            github: app.jobProfile?.github,
            location: app.jobProfile?.location,
          }}
          job={{
            title: app.jobPost.title,
            companyName: app.jobPost.postedBy,
            companyLocation: app.jobPost.locations?.[0],
          }}
          date={format(new Date(), 'MMMM d, yyyy')}
          filename={[
            app.jobProfile?.name,
            app.jobPost.postedBy,
            'coverletter',
            format(new Date(), 'dMMM'),
          ].filter(Boolean).join('_').replace(/\s+/g, '') + '.pdf'}
        />
      )}

      {/* Application Questions */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">Application Questions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Custom Q&amp;As for this application</p>
          </div>
          {!addingQuestion && (
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setAddingQuestion(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Question
            </Button>
          )}
        </div>

        {app.customQuestions.length === 0 && !addingQuestion && (
          <p className="text-xs text-muted-foreground">No questions yet. Add one to track your answers.</p>
        )}

        <div className="space-y-2">
          {app.customQuestions.map((q: any) => (
            <QuestionItem
              key={q.id}
              question={q}
              onSave={saveQuestion}
              onDelete={removeQuestion}
            />
          ))}

          {addingQuestion && (
            <AddQuestionForm
              onSubmit={addQuestion}
              onCancel={() => setAddingQuestion(false)}
            />
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <h2 className="font-semibold text-sm">Job Description</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: app.jobPost.description }} />
      </div>

      {/* Status History Timeline */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Status History</h2>
        <StatusTimeline history={app.statusHistory} />
      </div>
    </div>
  )
}
