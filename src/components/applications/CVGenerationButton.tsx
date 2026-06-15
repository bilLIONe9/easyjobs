'use client'
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CVGenerationButtonProps {
  applicationId: string
  initialStatus?: string | null
}

export function CVGenerationButton({ initialStatus }: CVGenerationButtonProps) {
  if (initialStatus === 'done') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        CV Ready
      </div>
    )
  }

  if (initialStatus === 'failed') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
        onClick={() => {}}
      >
        <XCircle className="h-4 w-4" />
        Retry CV Generation
      </Button>
    )
  }

  if (initialStatus === 'pending' || initialStatus === 'generating') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {initialStatus === 'generating' ? 'Generating CV...' : 'Queued...'}
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {}}>
      <Sparkles className="h-4 w-4" />
      Generate CV
    </Button>
  )
}
