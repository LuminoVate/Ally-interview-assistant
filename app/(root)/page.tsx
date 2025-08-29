import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { dummyInterviews } from "@/constants";
import React from "react";
import InterviewCard from "@/components/InterviewCard";
import {
  getCurrentUser,
  getInterviewByUserId,
  getLatestInterviews,
} from "@/lib/actions/auth.action";

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews, allInterviews] = await Promise.all([
    await getInterviewByUserId(user?.id!),
    await getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = (userInterviews ?? []).length > 0;
  const hasLatestInterviews = (allInterviews?.length ?? 0) > 0;

  return (
    <>
      <section className="card-cta ">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practise & Feedback</h2>
          <p className="text-lg">
            {" "}
            Practice on real interview & get instant feedback
          </p>
          <Button asChild className="btn-primary sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="Robot"
          width={500}
          height={500}
          className="max-md:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interview-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p className="">You haven't taken any interviews yet.</p>
          )}
        </div>

        {/* <p className="">You haven't taken any interviews yet.</p> */}
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interview-section">
          <div className="interview-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasLatestInterviews ? (
              allInterviews?.map((interview) => (
                <InterviewCard {...interview} key={interview.id} />
              ))
            ) : (
              <p>No latest interviews available.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default page;
