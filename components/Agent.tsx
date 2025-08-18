"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { vapi } from "@/lib/vapi.sdk";

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
    const saveTranscript = async () => {
      if (callStatus === CallStatus.FINISHED && messages.length > 0) {
        try {
          // await fetch("/api/vapi/generate", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     type,
          //     userid: userId,
          //     transcript: messages,
          //   }),
          // });
          console.log(messages);
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    saveTranscript();
    if (callStatus === CallStatus.FINISHED) {
      router.push(`/`);
    }
  }, [messages, callStatus, type, userId]);

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
      <div className="call-view">

        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Avatar"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            {!isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>{userName}</h3>
        </div>

      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
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

      <div className="w-full flex justify-center">
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
    </>
  );
};

export default Agent;
