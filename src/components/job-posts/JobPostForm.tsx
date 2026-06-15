'use client'
import { useForm } from 'react-hook-form'
import { useMutation, useLazyQuery } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Combobox } from '@/components/ComboBox'
import { getAllCompanies } from '@/actions/company.actions'
import { getAllJobLocations } from '@/actions/jobLocation.actions'
import { getJobSourceList } from '@/actions/jobSource.actions'
import { JOB_TYPES } from '@/models/job.model'
import { CREATE_JOB_POST, UPDATE_JOB_POST, JOB_POSTS_QUERY, CHECK_DUPLICATE_JOB_POSTS } from '@/lib/graphql/queries'
import TiptapEditor from '@/components/TiptapEditor'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  postedAt: z.string().min(1, 'Posted date is required'),
  salary: z.string().optional(),
  sourceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  jobType: z.string().optional(),
  jobSource: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface JobPostFormProps {
  editPost?: {
    id: string
    title: string
    description: string
    postedBy: string
    postedAt: string
    salary?: string | null
    location?: string | null
    sourceUrl?: string | null
    jobType?: string | null
    jobSource?: string | null
  }
  onSuccess?: () => void
}

export function JobPostForm({ editPost, onSuccess }: JobPostFormProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [jobSources, setJobSources] = useState<any[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editPost
      ? {
          title: editPost.title,
          description: editPost.description,
          postedAt: format(new Date(editPost.postedAt), 'yyyy-MM-dd'),
          salary: editPost.salary ?? '',
          sourceUrl: editPost.sourceUrl ?? '',
          jobType: editPost.jobType ?? '',
          company: '',
          location: '',
          jobSource: '',
        }
      : {
          title: '',
          description: '',
          company: '',
          location: '',
          salary: '',
          sourceUrl: '',
          jobType: '',
          jobSource: '',
          postedAt: format(new Date(), 'yyyy-MM-dd'),
        },
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      const [c, l, s] = await Promise.all([
        getAllCompanies(),
        getAllJobLocations(),
        getJobSourceList(1, 100),
      ])
      if (!active) return
      const companyList: any[] = Array.isArray(c) ? c : []
      const locationList: any[] = Array.isArray(l) ? l : []
      const sourceList: any[] = Array.isArray(s?.data) ? s.data : []

      if (editPost) {
        const matchedCompany = companyList.find((co) => co.label === editPost.postedBy)
        if (matchedCompany) {
          form.setValue('company', matchedCompany.id)
        } else if (editPost.postedBy) {
          const synthetic = { id: `__${editPost.postedBy}__`, label: editPost.postedBy, value: editPost.postedBy }
          companyList.unshift(synthetic)
          form.setValue('company', synthetic.id)
        }

        if (editPost.location) {
          const matchedLocation = locationList.find((lo) => lo.label === editPost.location)
          if (matchedLocation) {
            form.setValue('location', matchedLocation.id)
          } else {
            const synthetic = { id: `__${editPost.location}__`, label: editPost.location, value: editPost.location }
            locationList.unshift(synthetic)
            form.setValue('location', synthetic.id)
          }
        }

        if (editPost.jobSource) {
          const matchedSource = sourceList.find((s) => s.label === editPost.jobSource)
          if (matchedSource) {
            form.setValue('jobSource', matchedSource.id)
          } else {
            const synthetic = { id: `__${editPost.jobSource}__`, label: editPost.jobSource, value: editPost.jobSource }
            sourceList.unshift(synthetic)
            form.setValue('jobSource', synthetic.id)
          }
        }
      }

      setCompanies([...companyList])
      setLocations([...locationList])
      setJobSources([...sourceList])
    })()
    return () => { active = false }
  }, [editPost]) // eslint-disable-line react-hooks/exhaustive-deps

  const [checkDuplicates, { data: duplicateData }] = useLazyQuery<{
    checkDuplicateJobPosts: { id: string; title: string; postedBy: string; postedAt: string; sourceUrl?: string | null; status: string }[]
  }>(CHECK_DUPLICATE_JOB_POSTS)
  const duplicates = duplicateData?.checkDuplicateJobPosts ?? []

  const titleValue = form.watch('title')
  const companyValue = form.watch('company')

  useEffect(() => {
    if (!titleValue || titleValue.length < 2 || !companyValue || companies.length === 0) return
    const companyLabel = companies.find((c) => c.id === companyValue)?.label ?? companyValue
    const timer = setTimeout(() => {
      checkDuplicates({
        variables: { title: titleValue, postedBy: companyLabel, excludeId: editPost?.id ?? undefined },
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [titleValue, companyValue, companies]) // eslint-disable-line react-hooks/exhaustive-deps

  const [createPost] = useMutation(CREATE_JOB_POST, { refetchQueries: [JOB_POSTS_QUERY] })
  const [updatePost] = useMutation(UPDATE_JOB_POST, { refetchQueries: [JOB_POSTS_QUERY] })

  const onSubmit = async (data: FormData) => {
    const selectedCompany = companies.find((c) => c.id === data.company)
    const selectedLocation = locations.find((l) => l.id === data.location)
    const selectedJobSource = jobSources.find((s) => s.id === data.jobSource)

    const input = {
      title: data.title,
      description: data.description,
      postedBy: selectedCompany?.label ?? data.company,
      postedAt: new Date(data.postedAt).toISOString(),
      salary: data.salary || null,
      location: selectedLocation?.label ?? data.location ?? null,
      sourceUrl: data.sourceUrl || null,
      jobType: data.jobType || null,
      jobSource: selectedJobSource?.label ?? data.jobSource || null,
    }

    if (editPost) {
      await updatePost({ variables: { id: editPost.id, input } })
    } else {
      await createPost({ variables: { input } })
    }

    onSuccess ? onSuccess() : router.push('/dashboard/job-posts')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Senior Software Engineer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {duplicates.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
            <p className="text-sm font-semibold text-amber-800">
              Possible duplicate{duplicates.length > 1 ? 's' : ''} found
            </p>
            {duplicates.map((dup) => (
              <div key={dup.id} className="flex items-start justify-between gap-2 text-sm text-amber-700">
                <span>
                  <span className="font-medium">{dup.postedBy}</span> posted &ldquo;{dup.title}&rdquo;{' '}
                  {formatDistanceToNow(new Date(dup.postedAt), { addSuffix: true })}
                  {dup.status !== 'active' && (
                    <span className="ml-1 text-amber-500">({dup.status})</span>
                  )}
                </span>
                {dup.sourceUrl && (
                  <a
                    href={dup.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 underline underline-offset-2 hover:text-amber-900"
                  >
                    View post ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Combobox options={companies} field={field} creatable />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Combobox options={locations} field={field} creatable />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posted Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. $120k–$150k" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jobSource"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Job Source</FormLabel>
                <FormControl>
                  <Combobox options={jobSources} field={field} creatable />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sourceUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source URL (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="jobType"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Job Type</FormLabel>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value ?? ''}
                className="flex gap-4"
              >
                {Object.entries(JOB_TYPES).map(([key, label]) => (
                  <FormItem key={key} className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={key} />
                    </FormControl>
                    <FormLabel className="font-normal">{label}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="job-description-label">Job Description *</FormLabel>
              <FormControl>
                <TiptapEditor field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : editPost ? 'Update Post' : 'Save Job Post'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
