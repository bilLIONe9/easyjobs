"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { getResumeList } from "@/actions/profile.actions";
import { Resume } from "@/models/profile.model";
import { APP_CONSTANTS } from "@/lib/constants";
import Loading from "../Loading";
import ResumeTable from "./ResumeTable";
import CreateResume from "./CreateResume";
import { RecordsPerPageSelector } from "../RecordsPerPageSelector";
import { RecordsCount } from "../RecordsCount";
import { toast } from "../ui/use-toast";

const ProfileContainer = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [totalResumes, setTotalResumes] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(APP_CONSTANTS.RECORDS_PER_PAGE);

  // Rename dialog state — create is now handled by the /resume/new page
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [resumeToRename, setResumeToRename] = useState<Resume | null>(null);

  const loadResumes = useCallback(
    async (p: number) => {
      setLoading(true);
      const { data, total, success, message } = await getResumeList(p, recordsPerPage);
      setLoading(false);
      if (success && data) {
        setResumes((prev) => (p === 1 ? data : [...prev, ...data]));
        setTotalResumes(total);
        setPage(p);
      } else {
        toast({ variant: "destructive", title: "Error!", description: message });
      }
    },
    [recordsPerPage],
  );

  const reloadResumes = useCallback(() => loadResumes(1), [loadResumes]);

  useEffect(() => {
    loadResumes(1);
  }, [loadResumes, recordsPerPage]);

  const openRenameDialog = (resume: Resume) => {
    setResumeToRename(resume);
    setRenameDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle>Profile</CardTitle>

        {/* New Resume navigates to the full editor page */}
        <Link href="/dashboard/profile/resume/new">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">New Resume</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {loading && <Loading />}

        {resumes.length > 0 && (
          <>
            <ResumeTable
              resumes={resumes}
              onEditResume={openRenameDialog}
              reloadResumes={reloadResumes}
            />
            <div className="flex items-center justify-between mt-4">
              <RecordsCount count={resumes.length} total={totalResumes} label="resumes" />
              {totalResumes > APP_CONSTANTS.RECORDS_PER_PAGE && (
                <RecordsPerPageSelector value={recordsPerPage} onChange={setRecordsPerPage} />
              )}
            </div>
          </>
        )}

        {resumes.length < totalResumes && (
          <div className="flex justify-center p-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadResumes(page + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Rename dialog — only opened from the table's Rename action */}
      <CreateResume
        resumeDialogOpen={renameDialogOpen}
        setResumeDialogOpen={setRenameDialogOpen}
        resumeToEdit={resumeToRename}
        reloadResumes={reloadResumes}
        setNewResumeId={() => {}}
      />
    </Card>
  );
};

export default ProfileContainer;
