'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import type { TypedDocumentNode } from '@apollo/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, MapPin, CheckCircle2, Loader2, ChevronsUpDown, Check, CalendarIcon, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { JOB_APPLICATIONS_QUERY, JOB_PROFILES_QUERY, UPDATE_APPLICATION_STATUS, DELETE_APPLICATION } from '@/lib/graphql/queries'
import { getAllCompanies } from '@/actions/company.actions'

const APPLICATION_STATUSES = [
  'saved', 'applied', 'phone_screen', 'interview', 'technical_test', 'offer', 'rejected', 'withdrawn',
]

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-800',
  applied: 'bg-indigo-100 text-indigo-800',
  phone_screen: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-orange-100 text-orange-800',
  technical_test: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-600',
}

const CV_STATUS_ICONS: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  generating: <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />,
  pending: <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />,
}

const DATE_PRESETS = [
  { value: '1d', label: '1 day' },
  { value: '3d', label: '3 days' },
  { value: '1w', label: '1 week' },
] as const

type DatePreset = typeof DATE_PRESETS[number]['value'] | 'custom' | null

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function appTZMidnightDaysAgo(daysAgo: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return d
}

function appTZStartOfCalendarDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDateRangeFromPreset(preset: DatePreset, customStart: Date | undefined): { startDate?: string } {
  if (preset === '1d') return { startDate: appTZMidnightDaysAgo(1).toISOString() }
  if (preset === '3d') return { startDate: appTZMidnightDaysAgo(3).toISOString() }
  if (preset === '1w') return { startDate: appTZMidnightDaysAgo(7).toISOString() }
  if (preset === 'custom') {
    return customStart ? { startDate: appTZStartOfCalendarDay(customStart).toISOString() } : {}
  }
  return {}
}

export function ApplicationsContainer() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [cvReady, setCvReady] = useState(false)
  const [page, setPage] = useState(1)

  // Company filter
  const [company, setCompany] = useState<string | null>(null)
  const [companies, setCompanies] = useState<{ id: string; label: string }[]>([])
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false)

  useEffect(() => {
    getAllCompanies().then((res) => {
      if (Array.isArray(res)) setCompanies(res)
    })
  }, [])

  // Profile multi-select
  const [profileIds, setProfileIds] = useState<string[]>([])
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)

  // Date range
  const [datePreset, setDatePreset] = useState<DatePreset>(null)
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  const { data: profilesData } = useQuery(
    JOB_PROFILES_QUERY as TypedDocumentNode<{ jobProfiles: Array<{ id: string; name: string }> }>
  )
  const profiles = profilesData?.jobProfiles ?? []

  const dateRangeFilter = getDateRangeFromPreset(datePreset, customStartDate)

  const filter = {
    ...(search ? { search } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(cvReady ? { cvReady: true } : {}),
    ...(profileIds.length ? { profileIds } : {}),
    ...(company ? { company } : {}),
    ...dateRangeFilter,
  }

  const { data, loading } = useQuery(JOB_APPLICATIONS_QUERY, {
    variables: { filter, page, limit: 20 },
    fetchPolicy: 'cache-and-network',
  })

  const [updateStatus] = useMutation(UPDATE_APPLICATION_STATUS, {
    refetchQueries: [JOB_APPLICATIONS_QUERY],
  })
  const [deleteApp] = useMutation(DELETE_APPLICATION, {
    refetchQueries: [JOB_APPLICATIONS_QUERY],
  })

  const applications = (data as any)?.jobApplications?.items ?? []
  const totalPages = (data as any)?.jobApplications?.totalPages ?? 1
  const total = (data as any)?.jobApplications?.total ?? 0

  function toggleProfile(id: string) {
    setProfileIds((prev) =>
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

  function handleCustomRangeSelect(date: Date | undefined) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Application Hub</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} application{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Status */}
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPLICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{formatLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company filter */}
        {companies.length > 0 && (
          <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={company ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1.5 h-9"
                role="combobox"
              >
                {company ?? 'All companies'}
                {company
                  ? <X className="h-3.5 w-3.5 opacity-50" onClick={(e) => { e.stopPropagation(); setCompany(null); setPage(1) }} />
                  : <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search company..." />
                <CommandList>
                  <CommandEmpty>No companies found.</CommandEmpty>
                  <CommandGroup>
                    {companies.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.label}
                        onSelect={() => {
                          setCompany((prev) => prev === c.label ? null : c.label)
                          setPage(1)
                          setCompanyPopoverOpen(false)
                        }}
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', company === c.label ? 'opacity-100' : 'opacity-0')}
                        />
                        {c.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Profile multi-select */}
        {profiles.length > 0 && (
          <Popover open={profilePopoverOpen} onOpenChange={setProfilePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={profileIds.length ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1.5 h-9"
                role="combobox"
              >
                {profileIds.length
                  ? `${profileIds.length} profile${profileIds.length > 1 ? 's' : ''}`
                  : 'All profiles'}
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search profiles..." />
                <CommandList>
                  <CommandEmpty>No profiles found.</CommandEmpty>
                  <CommandGroup>
                    {profiles.map((profile) => (
                      <CommandItem
                        key={profile.id}
                        value={profile.name}
                        onSelect={() => toggleProfile(profile.id)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            profileIds.includes(profile.id) ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {profile.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {profileIds.length > 0 && (
                <div className="border-t p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs text-muted-foreground"
                    onClick={() => { setProfileIds([]); setPage(1) }}
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

          {/* Custom date range */}
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
                onSelect={handleCustomRangeSelect}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          {/* Clear date filter */}
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

        {/* CV Ready */}
        <Button
          variant={cvReady ? 'secondary' : 'outline'}
          size="sm"
          className="gap-1.5 h-9"
          onClick={() => { setCvReady((v) => !v); setPage(1) }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          CV Ready
        </Button>
      </div>

      {/* List */}
      {loading && applications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No applications yet.</p>
          <Link href="/dashboard/job-posts" className="mt-2">
            <Button variant="outline" size="sm">Browse Job Posts</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div key={app.id} className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/applications/${app.id}`} className="hover:underline">
                    <h3 className="font-medium text-sm leading-tight">{app.jobPost.title}</h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span>{app.jobPost.postedBy}</span>
                    {app.jobPost.locations?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {app.jobPost.locations.join(' · ')}
                      </span>
                    )}
                    {app.jobProfile && <span>Profile: {app.jobProfile.name}</span>}
                    <span>Saved {format(new Date(app.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {app.cvGenerationStatus && CV_STATUS_ICONS[app.cvGenerationStatus]}
                  <Badge
                    className={`text-xs ${STATUS_COLORS[app.currentStatus] ?? 'bg-muted'}`}
                    variant="outline"
                  >
                    {formatLabel(app.currentStatus)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {APPLICATION_STATUSES.filter((s) => s !== app.currentStatus).slice(0, 3).map((s) => (
                  <Button
                    key={s}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => updateStatus({ variables: { id: app.id, status: s } })}
                  >
                    → {formatLabel(s)}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2 text-destructive ml-auto"
                  onClick={() => deleteApp({ variables: { id: app.id } })}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
