'use client'
import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UPDATE_APPLICATION, DELETE_APPLICATION_QUESTION } from '@/lib/graphql/queries'

const QUESTION_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'cover_letter', label: 'Cover letter' },
  { value: 'essay', label: 'Essay / long answer' },
]

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Question {
  id: string
  question: string
  answer?: string | null
  questionType?: string | null
  sortOrder: number
}

// ─── Question item ─────────────────────────────────────────────────────────────

function QuestionItem({
  question,
  onSave,
  onDelete,
}: {
  question: Question
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
        {question.answer
          ? <p className="text-xs whitespace-pre-wrap">{question.answer}</p>
          : <p className="text-xs text-muted-foreground italic">No answer yet — click edit to add one.</p>}
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
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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

// ─── Add question form ─────────────────────────────────────────────────────────

function AddQuestionForm({ onSubmit, onCancel }: {
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
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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

// ─── Card ──────────────────────────────────────────────────────────────────────

interface Props {
  id: string
  customQuestions: Question[]
}

export function ApplicationQuestionsCard({ id, customQuestions: initial }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initial)
  const [adding, setAdding] = useState(false)

  const [updateApplication] = useMutation(UPDATE_APPLICATION, {
    onCompleted: (data: any) => {
      const result = data?.updateApplication
      if (result?.customQuestions) {
        setQuestions(result.customQuestions)
      }
      setAdding(false)
    },
  })

  const [deleteQuestion] = useMutation(DELETE_APPLICATION_QUESTION)

  const handleSave = (questionId: string, data: { question: string; answer: string; questionType: string }) => {
    updateApplication({ variables: { id, input: { customQuestions: [{ id: questionId, ...data }] } } })
  }

  const handleAdd = (data: { question: string; answer: string; questionType: string }) => {
    updateApplication({ variables: { id, input: { customQuestions: [data] } } })
  }

  const handleDelete = (questionId: string) => {
    deleteQuestion({
      variables: { id: questionId },
      onCompleted: () => setQuestions((prev) => prev.filter((q) => q.id !== questionId)),
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">Application Questions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Custom Q&amp;As for this application</p>
        </div>
        {!adding && (
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5" />Add Question
          </Button>
        )}
      </div>

      {questions.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No questions yet. Add one to track your answers.</p>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <QuestionItem key={q.id} question={q} onSave={handleSave} onDelete={handleDelete} />
        ))}
        {adding && (
          <AddQuestionForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
        )}
      </div>
    </div>
  )
}
