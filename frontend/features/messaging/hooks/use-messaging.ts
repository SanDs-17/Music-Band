import { useEffect } from "react";
import { useMessagingStore } from "../store/messaging-store";

export function useMessaging() {
  const {
    conversations,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    error,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendMessage,
    createConversation,
  } = useMessagingStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    error,
    fetchConversations,
    selectConversation,
    fetchMessages,
    sendMessage,
    createConversation,
  };
}
