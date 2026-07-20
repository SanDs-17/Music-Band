"use client";

import React from "react";
import { useMessaging } from "../hooks/use-messaging";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessagingView() {
  const {
    conversations,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    fetchConversations,
    selectConversation,
    sendMessage,
  } = useMessaging();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Messages & Conversations
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Booking-centric messaging for active event agreements.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchConversations()}
          disabled={loadingConversations}
          className="h-8 text-xs font-bold gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingConversations ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
        {/* Left Column: Conversations List */}
        <Card className="md:col-span-4 bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <CardHeader className="border-b border-border/60 bg-bg-card/40 py-3 px-4">
            <CardTitle className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Conversations ({conversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelect={selectConversation}
              loading={loadingConversations}
            />
          </CardContent>
        </Card>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-8 h-full">
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            loadingMessages={loadingMessages}
            sendingMessage={sendingMessage}
            onSendMessage={(content) =>
              activeConversation ? sendMessage(activeConversation.id, content) : Promise.resolve(false)
            }
          />
        </div>
      </div>
    </div>
  );
}
