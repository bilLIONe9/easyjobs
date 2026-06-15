'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, Search, CalendarIcon, X, ChevronsUpDown, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { JobPostCard } from './JobPostCard'
import { JOB_POSTS_QUERY, JOB_POST_INSIGHTS_QUERY, JOB_PROFILES_QUERY } from '@/lib/graphql/queries'
import { getAllJobLocations } from '@/actions/jobLocation.actions'

const DATE_PRESETS = [
  { value: '1d', label: '1 day' },
  { value: '3d', label: '3 days' },
  { value: '1w', label: '1 week' },
] as const

type DatePreset = typeof DATE_PRESETS[number]['value'] | 'custom' | null

const APP_TZ_OFFSET_HOURS = 8
const APP_TZ_OFFSET_MS = APP_TZ_OFFSET_HOURS * 60 * 60 * 1000

function appTZMidnightDaysAgo(daysAgo: number): Date {
  const now = new Date()
  const localNow = new Date(now.getTime() - APP_TZ_OFFSET_MS)
  localNow.setUTCHours(0, 0, 0, 0)
  localNow.setUTCDate(localNow.getUTCDate() - daysAgo)
  return new Date(localNow.getTime() + APP_TZ_OFFSET_MS)
}

function appTZStartOfCalendarDay(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), APP_TZ_OFFSET_HOURS, 0, 0, 0))
}

function getDateFilter(preset: DatePreset, customStart: Date | undefined): { startDate?: string } {
  if (preset === '1d') return { startDate: appTZMidnightDaysAgo(1).toISOString() }
  if (preset === '3d') return { startDate: appTZMidnightDaysAgo(3).toISOString() }
  if (preset === '1w') return { startDate: appTZMidnightDaysAgo(7).toISOString() }
  if (preset === 'custom') return customStart ? { startDate: appTZStartOfCalendarDay(customStart).toISOString() } : {}
  return {}
}

export function JobPostsContainer() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [datePreset, setDatePreset] = useState<DatePreset>(null)
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [excludeProfileIds, setExcludeProfileIds] = useState<string[]>([])
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)

  // Location filter
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [locationOptions, setLocationOptions] = useState<{ id: string; label: string }[]>([])
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false)

  useEffect(() => {
    getAllJobLocations().then((res) => {
      if (Array.isArray(res)) setLocationOptions(res)
    })
  }, [])

  const dateFilter = getDateFilter(datePreset, customStartDate)

  const filter = {
    ...(search ? { search } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...dateFilter,
    ...(excludeProfileIds.length ? { excludeProfileIds } : {}),
    ...(locationFilter ? { location: locationFilter } : {}),
  }

  const { data, loading, refetch } = useQuery(JOB_POSTS_QUERY, {
    variables: { filter, page, limit: 20 },
    fetchPolicy: 'cache-and-network',
  })

  const { data: insightsData } = useQuery(JOB_POST_INSIGHTS_QUERY)
  const { data: profilesData } = useQuery(JOB_PROFILES_QUERY)
  const profiles: Array<{ id: string; name: string }> = (profilesData as any)?.jobProfiles ?? []
  const d = data as any
  const insights = (insightsData as any)?.jobPostInsights

  const posts = d?.jobPosts?.items ?? []
  const totalPages = d?.jobPosts?.totalPages ?? 1

  function toggleExcludeProfile(id: string) {
    setExcludeProfileIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
    setPage(1)
  }

  function handlePresetClick(preset: DatePreset) {
    if (datePreset === preset) {
      setDatePreset(null)
    } else {
      setDatePreset(preset)
      setCustomStartDate(undefined)
    }
    setPage(1)
  }

  function handleCustomDateSelect(date: Date | undefined) {
    setCustomStartDate(date)
    setDatePreset('custom')
    setPage(1)
  }

  function clearDateFilter() {
    setDatePreset(null)
    setCustomStartDate(undefined)
    setPage(1)
  }

  const dateLabel = (() => {
    if (!datePreset) return null
    if (datePreset !== 'custom') return DATE_PRESETS.find((p) => p.value === datePreset)?.label
    if (customStartDate) return `From ${format(customStartDate, 'MMM d')}`
    return 'Custom'
  })()

  return (
    <div className="col-span-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Posts</h1>
          {insights && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {insights.active} active · {insights.closed} closed · {insights.savedToApply} saved to apply
            </p>
          )}
        </div>
        <Link href="/dashboard/job-posts/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="inappropriate">Inappropriate</SelectItem>
          </SelectContent>
        </Select>

        {/* Location filter */}
        {locationOptions.length > 0 && (
          <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={locationFilter ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1.5 h-9"
                role="combobox"
              >
                {locationFilter ?? 'All locations'}
                {locationFilter
                  ? <X className="h-3.5 w-3.5 opacity-50" onClick={(e) => { e.stopPropagation(); setLocationFilter(null); setPage(1) }} />
                  : <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search locations..." />
                <CommandList>
                  <CommandEmpty>No locations found.</CommandEmpty>
                  <CommandGroup>
                    {locationOptions.map((loc) => (
                      <CommandItem
                        key={loc.id}
                        value={loc.label}
                        onSelect={() => {
                          setLocationFilter((prev) => prev === loc.label ? null : loc.label)
                          setPage(1)
                          setLocationPopoverOpen(false)
                        }}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', locationFilter === loc.label ? 'opacity-100' : 'opacity-0')}
                        />
                        {loc.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Exclude by profile */}
        {profiles.length > 0 && (
          <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={excludeProfileIds.length ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1.5 h-9"
                role="combobox"
              >
                {excludeProfileIds.length
                  ? `Exclude ${excludeProfileIds.length} profile${excludeProfileIds.length > 1 ? 's' : ''}`
                  : 'Exclude by profile'}
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search profiles..." />
                <CommandList>
                  <CommandEmpty>No profiles found.</CommandEmpty>
                  <CommandGroup>
                    {profiles.map((profile) => (
                      <CommandItem
                        key={profile.id}
                        value={profile.name}
                        onSelect={() => toggleExcludeProfile(profile.id)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            excludeProfileIds.includes(profile.id) ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {profile.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {excludeProfileIds.length > 0 && (
                <div className="border-t p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs text-muted-foreground"
                    onClick={() => { setExcludeProfileIds([]); setPage(1) }}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Date presets */}
        <div className="flex items-center gap-1">
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={datePreset === preset.value ? 'secondary' : 'outline'}
              size="sm"
              className="h-9 text-xs px-2.5"
              onClick={() => handlePresetClick(preset.value)}
            >
              {preset.label}
            </Button>
          ))}

          {/* Custom date */}
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={datePreset === 'custom' ? 'secondary' : 'outline'}
                size="sm"
                className="h-9 gap-1.5 text-xs px-2.5"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                Custom
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStartDate}
                onSelect={handleCustomDateSelect}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          {dateLabel && (
            <Badge
              variant="secondary"
              className="gap-1 text-xs cursor-pointer hover:bg-muted"
              onClick={clearDateFilter}
            >
              {dateLabel}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No job posts found.</p>
          <Link href="/dashboard/job-posts/new" className="mt-2">
            <Button variant="outline" size="sm">Add your first job post</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post: any) => (
            <JobPostCard key={post.id} post={post} onSaved={() => refetch()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
