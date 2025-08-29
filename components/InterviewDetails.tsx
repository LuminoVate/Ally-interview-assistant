import React from "react";
import Image from "next/image";
import DisplayTechIcons from "@/components/DisplayTechIcons";

interface InterviewDetailsProps {
  coverImage: string;
  createdAt: string;
  finalized: boolean;
  level: string;
  role: string;
  techstack: string[];
  transcript: { content: string; role: string }[];
  type: string;
}

const InterviewDetails: React.FC<InterviewDetailsProps> = ({
  coverImage,
  createdAt,
  finalized,
  level,
  role,
  techstack,
  transcript,
  type,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={coverImage}
          alt="cover"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <h2 className="text-2xl font-bold capitalize">{role} Interview</h2>
          <div className="flex gap-2 mt-1">
            <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {type}
            </span>
            <span className="badge bg-green-100 text-green-800 px-2 py-1 rounded">
              {level}
            </span>
            <span className="badge bg-gray-100 text-gray-800 px-2 py-1 rounded">
              {finalized ? "Finalized" : "In Progress"}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {new Date(createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <DisplayTechIcons techStack={techstack} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Transcript</h3>
        <div className="space-y-2">
          {transcript.map((msg, idx) => (
            <div key={idx} className="text-sm text-gray-700">
              <span
                className={`font-semibold capitalize ${
                  msg.role === "assistant" ? "text-blue-700" : "text-green-700"
                }`}
              >
                {msg.role}:
              </span>{" "}
              {msg.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetails;
