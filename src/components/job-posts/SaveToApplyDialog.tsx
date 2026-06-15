'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JOB_PROFILES_QUERY, SAVE_JOB_POST_TO_APPLY } from '@/lib/graphql/queries'

interface SaveToApplyDialogProps {
  jobPostId: string
  jobPostTitle: string
  savedProfileIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function SaveToApplyDialog({
  jobPostId,
  jobPostTitle,
  savedProfileIds,
  open,
  onOpenChange,
  onSaved,
}: SaveToApplyDialogProps) {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string>('none')

  const { data: profilesData, loading: profilesLoading } = useQuery(JOB_PROFILES_QUERY, {
    skip: !open,
  })

  const [saveToApply, { loading: saving }] = useMutation(SAVE_JOB_POST_TO_APPLY, {
    onCompleted: (data: any) => {
      const id = data.saveJobPostToApply.id
      onOpenChange(false)
      setProfileId('none')
      onSaved?.()
      router.push(`/dashboard/applications/${id}`)
    },
  })

  const allProfiles = (profilesData as any)?.jobProfiles ?? []
  const profiles = allProfiles.filter((p: any) => !savedProfileIds.includes(p.id))

  const handleSave = () => {
    const selectedProfileId = profileId === 'none' ? undefined : profileId
    saveToApply({ variables: { jobPostId, profileId: selectedProfileId } })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save to Apply</DialogTitle>
          <DialogDescription className="text-xs">
            {jobPostTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">Job Profile</Label>
            <Select
              value={profileId}
              onValueChange={setProfileId}
              disabled={profilesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a profile..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No profile (skip CV generation)</SelectItem>
                {profiles.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{p.isDefault ? ' ★' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {profileId !== 'none' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3" />
                You can generate or manually draft a CV after saving.
              </p>
            )}
            {allProfiles.length === 0 && !profilesLoading && (
              <p className="text-xs text-muted-foreground">
                No profiles yet.{' '}
                <a href="/dashboard/job-profiles" className="underline">Create one</a> to enable CV generation.
              </p>
            )}
            {allProfiles.length > 0 && profiles.length === 0 && !profilesLoading && (
              <p className="text-xs text-muted-foreground">
                All profiles have already saved this job.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || profilesLoading}>
            {saving ? 'Saving...' : 'Save to Apply'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
