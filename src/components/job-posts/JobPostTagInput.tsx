'use client'
import { useState } from 'react'
import { X, Plus, CirclePlus, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check } from 'lucide-react'

export interface JobPostTagOption {
  id: string
  label: string
  value: string
}

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
]

export function getTagColor(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

interface JobPostTagInputProps {
  value: string[]
  onChange: (ids: string[]) => void
  tags: JobPostTagOption[]
  onCreateTag: (label: string) => Promise<JobPostTagOption | null>
}

export function JobPostTagInput({ value, onChange, tags, onCreateTag }: JobPostTagInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const selectedTags = value.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as JobPostTagOption[]
  const unselectedTags = tags.filter((t) => !value.includes(t.id))

  async function handleCreate() {
    const label = search.trim()
    if (!label) return
    setCreating(true)
    try {
      const tag = await onCreateTag(label)
      if (tag) {
        onChange([...value, tag.id])
        setSearch('')
        setOpen(false)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-1.5">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className={`gap-1 pr-1 border-0 ${getTagColor(tag.value)}`}
            >
              {tag.label}
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== tag.id))}
                className="rounded-full hover:bg-black/10 p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch('') }}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" type="button">
            <Plus className="h-3 w-3" />
            Add tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {search.trim() ? (
                  <button
                    type="button"
                    disabled={creating}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 text-sm italic cursor-pointer hover:bg-accent"
                    onClick={handleCreate}
                  >
                    {creating
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                      : <CirclePlus className="h-3.5 w-3.5 shrink-0" />
                    }
                    <span>Create &ldquo;<span className="font-semibold not-italic text-foreground">{search}</span>&rdquo;</span>
                  </button>
                ) : (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">No tags found.</p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {unselectedTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.value}
                    onSelect={() => {
                      onChange([...value, tag.id])
                      setSearch('')
                      setOpen(false)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTagColor(tag.value)}`}>
                      {tag.label}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
