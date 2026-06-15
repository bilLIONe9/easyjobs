'use client'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, XCircle, ChevronDown, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CVActionButtonProps {
  applicationId: string
  initialStatus?: string | null
  hasCvData: boolean
}

export function CVActionButton({ applicationId, initialStatus, hasCvData }: CVActionButtonProps) {
  const router = useRouter()
  const goToEditCv = () => router.push(`/dashboard/applications/${applicationId}/edit-cv`)

  if (initialStatus === 'pending' || initialStatus === 'generating') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {initialStatus === 'generating' ? 'Generating CV...' : 'Queued...'}
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={goToEditCv}>
          <Pencil className="h-3.5 w-3.5" />
          Edit Manually
        </Button>
      </div>
    )
  }

  if (initialStatus === 'done' || hasCvData) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          CV Ready
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={goToEditCv}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Manually
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerate with AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  if (initialStatus === 'failed') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-destructive">CV generation failed.</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => {}}
          >
            <XCircle className="h-4 w-4" />
            Retry AI Generation
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={goToEditCv}>
            <Pencil className="h-3.5 w-3.5" />
            Edit Manually
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          Create CV
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => {}}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={goToEditCv}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Manually
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
