import { Metadata } from "next";
import { NewResumeView } from "@/components/profile/NewResumeView";

export const metadata: Metadata = { title: "New Resume | JobSync" };

export default function NewResumePage() {
  return <NewResumeView />;
}
