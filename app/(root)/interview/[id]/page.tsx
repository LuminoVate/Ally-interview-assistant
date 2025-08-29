import React from "react";
import InterviewDetails from "@/components/InterviewDetails";
import { getInterviewById } from "@/lib/actions/auth.action";

interface PageProps {
  params: { id: string };
}

const Page = async ({ params }: PageProps) => {
  const interview = await getInterviewById(params.id);
  if (!interview) {
    return (
      <div className="text-center mt-10 text-lg">Interview not found.</div>
    );
  }

  // Map Firestore data to InterviewDetailsProps
  const mapped = {
    coverImage: interview.coverImage || "/covers/hostinger.png",
    createdAt: interview.createdAt || new Date().toISOString(),
    finalized: interview.finalized ?? false,
    level: interview.level || "Unknown",
    role: interview.role || "Unknown",
    techstack: interview.techstack || [],
    transcript: interview.transcript || [],
    type: interview.type || "Unknown",
  };

  return <InterviewDetails {...mapped} />;
};

export default Page;
