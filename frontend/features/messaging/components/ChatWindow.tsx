"use client";

import React from "react";
import { Conversation, Message } from "../types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyChatState } from "./EmptyChatState";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield } from "lucide-react";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  loadingMessages: boolean;
  sendingMessage: boolean;
  onSendMessage: (content: string) => Promise<boolean>;
}

export function ChatWindow({
  conversation,
  messages,
  loadingMessages,
  sendingMessage,
  onSendMessage,
}: ChatWindowProps) {
  if (!conversation) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex flex-col h-full bg-bg-card/20 rounded-2xl border border-border/60 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-border/60 bg-bg-card/40 flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <h2 className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            {conversation.event_name || `Booking ${conversation.booking_id.slice(0, 8)}`}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-text-secondary">
            <span className="font-mono text-[10px] text-text-muted">
              Booking Ref: {conversation.booking_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={conversation.status === "ACTIVE" ? "default" : "outline"}
            className="text-[10px] uppercase font-bold"
          >
            {conversation.status}
          </Badge>
        </div>
      </div>

      {/* Message List */}
      <MessageList messages={messages} loading={loadingMessages} />

      {/* Input */}
      <MessageInput
        onSend={(content) => onSendMessage(content)}
        disabled={conversation.status === "CLOSED"}
        sending={sendingMessage}
      />
    </div>
  );
}
