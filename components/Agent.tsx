import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type AgentProps = {
  userName: string;
};
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const page = ({ userName }: AgentProps) => {
  const callStatus = CallStatus.ACTIVE;
  const isSpeaking = true;
  const messages=[
    'What is your name?',
    'My Name Is Minul, Nice to meet you!'
  ]
  const lastMessage = messages[messages.length - 1]; 

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
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p className={cn(`transition-opacity duration-500 opacity-0`,`animate-fadeIn opacity-100`)} key={lastMessage}>{lastMessage}</p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="btn-call relative">
            <span
              className={cn(
                `absolute animate-ping rounded-full opacity-75`,
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "CALL"
                : "......"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect">End Call</button>
        )}
      </div>
    </>
  );
};

export default page;
