"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "../types";
import { formatDate } from "@/utils/format-date";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";
import { User } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-12 w-3/4 bg-bg-card/45 rounded-2xl animate-pulse",
              i % 2 === 0 ? "ml-auto bg-primary/20" : "mr-auto"
            )}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-text-secondary">
        <User className="h-6 w-6 text-text-muted mb-2 opacity-50" />
        No messages sent yet in this conversation. Send the first message below.
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[480px] scrollbar-none">
      {messages.map((msg) => {
        const isSelf = user?.id === msg.sender_id;

        return (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%] text-xs leading-relaxed",
              isSelf ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div
              className={cn(
                "px-4 py-2.5 rounded-2xl shadow-sm break-words whitespace-pre-wrap select-text",
                isSelf
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-bg-card border border-border/80 text-text-primary rounded-bl-none"
              )}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-text-muted mt-1 px-1">
              {formatDate(msg.created_at)}
            </span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
