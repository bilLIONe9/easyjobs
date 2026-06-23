import { getResumeByShareToken } from "@/actions/profile.actions";
import { PublicResumeView } from "@/components/profile/PublicResumeView";
import { notFound } from "next/navigation";

export default async function PublicCvPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getResumeByShareToken(token);
  if (!result?.success || !result.data) notFound();
  return <PublicResumeView resume={result.data} />;
}
