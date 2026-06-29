'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useMutation } from '@apollo/client/react'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { UPDATE_APPLICATION } from '@/lib/graphql/queries'

const CoverLetterPdfDialog = dynamic(
  () => import('./CoverLetterPdfDialog').then((m) => ({ default: m.CoverLetterPdfDialog })),
  { ssr: false },
)

interface Props {
  id: string
  coverLetter: string
  notes: string
  jobProfile: {
    name: string
    email: string
    phone?: string | null
    linkedin?: string | null
    github?: string | null
    address?: string | null
  } | null
  jobPost: {
    title: string
    postedBy: string
    locations: string[]
  }
}

export function ApplicationInfoCard({ id, coverLetter: init, notes: initNotes, jobProfile, jobPost }: Props) {
  const [coverLetter, setCoverLetter] = useState(init)
  const [notes, setNotes] = useState(initNotes)
  const [editing, setEditing] = useState(false)
  const [showPdf, setShowPdf] = useState(false)

  const [updateApplication, { loading: saving }] = useMutation(UPDATE_APPLICATION, {
    onCompleted: (data: any) => {
      const result = data?.updateApplication
      if (result) {
        setCoverLetter(result.coverLetter ?? '')
        setNotes(result.notes ?? '')
      }
      setEditing(false)
    },
  })

  const handleSave = () => {
    updateApplication({ variables: { id, input: { coverLetter, notes } } })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Cover Letter &amp; Notes</h2>
        {!editing ? (
          <div className="flex items-center gap-1">
            {coverLetter && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowPdf(true)}>
                <Download className="h-3.5 w-3.5" />PDF
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <>
          <div className="grid gap-1.5">
            <Label className="text-xs">Cover Letter</Label>
            <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={6} placeholder="Write your cover letter..." />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Personal notes about this application..." />
          </div>
        </>
      ) : (
        <>
          {coverLetter
            ? <p className="text-sm whitespace-pre-wrap">{coverLetter}</p>
            : <p className="text-xs text-muted-foreground">No cover letter yet.</p>}
          {notes && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
            </>
          )}
        </>
      )}

      {showPdf && coverLetter && (
        <CoverLetterPdfDialog
          open={showPdf}
          onOpenChange={setShowPdf}
          coverLetter={coverLetter}
          profile={{
            name: jobProfile?.name ?? '',
            email: jobProfile?.email,
            phone: jobProfile?.phone ?? undefined,
            linkedin: jobProfile?.linkedin ?? undefined,
            github: jobProfile?.github ?? undefined,
            location: jobProfile?.address ?? undefined,
          }}
          job={{
            title: jobPost.title,
            companyName: jobPost.postedBy,
            companyLocation: jobPost.locations?.[0],
          }}
          date={format(new Date(), 'MMMM d, yyyy')}
          filename={[
            jobProfile?.name,
            jobPost.postedBy,
            'coverletter',
            format(new Date(), 'dMMM'),
          ].filter(Boolean).join('_').replace(/\s+/g, '') + '.pdf'}
        />
      )}
    </div>
  )
}
