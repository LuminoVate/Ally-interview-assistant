"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { db } from "@/firebase/Client";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { mappings, interviewCovers } from "@/constants";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "assistant";
  content: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [callStatus, setCallStatus] = React.useState(CallStatus.INACTIVE);
  const [messages, setMessages] = React.useState<SavedMessage[]>([]);
  const [role, setRole] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [techstack, setTechstack] = React.useState("");
  // Removed amount field
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [coverImage, setCoverImage] = React.useState<string>("");
  // Helper to get cover image based on techstack
  const getCoverForTech = (tech: string) => {
    // Try to match tech to a cover image (by normalized name)
    const normalized = tech.toLowerCase().replace(/\s+/g, "");
    // Try to find a cover that includes the tech name
    const found = interviewCovers.find((cover) => cover.includes(normalized));
    if (found) return `/covers${found}`;
    // fallback to random
    return `/covers${
      interviewCovers[Math.floor(Math.random() * interviewCovers.length)]
    }`;
  };
  const router = useRouter();
  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;
  const isCallConnecting = callStatus === CallStatus.CONNECTING;

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        if (message.role === "user" || message.role === "assistant") {
          const newMessage: SavedMessage = {
            role: message.role,
            content: message.transcript,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Error occurred:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup function (optional, but recommended)
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    const saveTranscriptToFirebase = async () => {
      if (
        callStatus === CallStatus.FINISHED &&
        messages.length > 0 &&
        formSubmitted
      ) {
        try {
          // Log the transcript to the console
          console.log("Transcript:", messages);

          // Prepare Q&A pairs: each user message and the next assistant message
          const qaPairs = [];
          let i = 0;
          while (i < messages.length) {
            if (messages[i].role === "user") {
              const question = messages[i].content;
              let answer = "";
              // Find the next assistant message
              let j = i + 1;
              while (j < messages.length) {
                if (messages[j].role === "assistant") {
                  answer = messages[j].content;
                  break;
                }
                j++;
              }
              qaPairs.push({ question, answer });
            }
            i++;
          }

          // Prepare techstack as array (single select for now)
          const techArr = techstack ? [techstack] : [];

          // Pick cover image based on techstack
          const cover =
            coverImage ||
            (techstack
              ? getCoverForTech(techstack)
              : `/covers${
                  interviewCovers[
                    Math.floor(Math.random() * interviewCovers.length)
                  ]
                }`);
          setCoverImage(cover);

          // Prepare interview object
          const interview = {
            type: "generate",
            userId,
            role,
            level,
            techstack: techArr,
            // amount removed
            coverImage: cover,
            createdAt: new Date().toISOString(),
            finalized: true,
            qaPairs, // Save Q&A pairs
            transcript: messages,
          };

          // Save to Firestore via API route
          await fetch("/api/interview/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(interview),
          });
        } catch (e) {
          console.error("Error saving to Firestore:", e);
        }
      }
    };
    saveTranscriptToFirebase();
    if (callStatus === CallStatus.FINISHED && formSubmitted) {
      router.push(`/`);
    }
  }, [
    messages,
    callStatus,
    type,
    userId,
    role,
    level,
    techstack,
    formSubmitted,
    coverImage,
  ]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
        },
      });
      // Do not setCallStatus(ACTIVE) here; rely on call-start event
    } catch (error) {
      setCallStatus(CallStatus.INACTIVE);
      console.error("Failed to start call:", error);
    }
  };
  const handleDisconnect = () => {
    setIsSpeaking(false);
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      {/* INTERVIEW FORM */}
      {!formSubmitted && (
        <div className="mt-10 flex justify-center">
          <div className="card-border w-full max-w-lg">
            <div className="card px-8 py-10 flex flex-col gap-7">
              <h3 className="text-center text-2xl font-bold text-primary-100 mb-2">
                Interview Details
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Pick a cover image for this interview based on techstack
                  setCoverImage(
                    techstack
                      ? getCoverForTech(techstack)
                      : `/covers${
                          interviewCovers[
                            Math.floor(Math.random() * interviewCovers.length)
                          ]
                        }`
                  );
                  setFormSubmitted(true);
                }}
                className="form flex flex-col gap-5"
              >
                <div>
                  <label className="label mb-1">Role</label>
                  <input
                    className="input w-full"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                <div>
                  <label className="label mb-1">Level</label>
                  <input
                    className="input w-full"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="e.g. Junior, Mid, Senior"
                    required
                  />
                </div>
                <div>
                  <label className="label mb-1">Tech Stack</label>
                  <select
                    className="bg-gray-800 w-full px-2 py-4"
                    value={techstack}
                    onChange={(e) => setTechstack(e.target.value)}
                    required
                    size={6}
                    style={{ overflowY: "auto" }}
                  >
                    <option value="" disabled>
                      Select a tech stack
                    </option>
                    {Array.from(new Set(Object.keys(mappings)))
                      .sort()
                      .map((tech) => (
                        <option key={tech} value={tech}>
                          {tech}
                        </option>
                      ))}
                  </select>
                </div>
                {/* amount field removed */}
                <button
                  type="submit"
                  className="btn"
                  disabled={!role || !level || !techstack}
                >
                  Start Interview
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW CALL VIEW */}
      {formSubmitted && (
        <div className="flex flex-col gap-8 items-center w-full mt-8">
          <div className="call-view w-full">
            <div className="card-interviewer">
              <div className="avatar">
                <Image
                  src="/ai-avatar.png"
                  alt="AI Avatar"
                  width={120}
                  height={120}
                  className="object-cover rounded-full"
                  style={{ height: "auto" }}
                />
                {isSpeaking && <span className="animate-speak" />}
              </div>
              <h3 className="text-primary-100 mt-3">AI Interviewer</h3>
            </div>
            <div className="card-interviewer">
              <div className="avatar">
                <Image
                  src="/user-avatar.png"
                  alt="user avatar"
                  width={120}
                  height={120}
                  className="object-cover rounded-full"
                />
                {!isSpeaking && <span className="animate-speak" />}
              </div>
              <h3 className="text-primary-100 mt-3">{userName}</h3>
            </div>
          </div>

          {/* TRANSCRIPT */}
          {messages.length > 0 && (
            <div className="transcript-border w-full max-w-2xl">
              <div className="transcript">
                <p
                  className={cn(
                    `transition-opacity duration-500 opacity-0`,
                    `animate-fadeIn opacity-100`
                  )}
                  key={latestMessage}
                >
                  {latestMessage}
                </p>
              </div>
            </div>
          )}

          {/* CALL BUTTONS */}
          <div className="w-full flex justify-center mt-4">
            {callStatus !== "ACTIVE" ? (
              <button
                className="btn-call relative"
                onClick={handleCall}
                disabled={isCallConnecting}
                aria-disabled={isCallConnecting}
              >
                <span
                  className={cn(
                    `absolute animate-ping rounded-full opacity-75`,
                    !isCallConnecting && "hidden"
                  )}
                />
                <span>{isCallInactiveOrFinished ? "CALL" : "......"}</span>
              </button>
            ) : (
              <button onClick={handleDisconnect} className="btn-disconnect">
                End Call
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Agent;
