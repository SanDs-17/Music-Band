import { create } from "zustand";
import { Conversation, Message } from "../types";
import { messagingClient } from "../api/client";
import toast from "react-hot-toast";

interface MessagingState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  createConversation: (bookingId: string) => Promise<Conversation | null>;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loadingConversations: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,

  fetchConversations: async () => {
    set({ loadingConversations: true, error: null });
    try {
      const data = await messagingClient.listConversations();
      set({ conversations: data, loadingConversations: false });
      
      // Auto-select first conversation if none selected
      const currentActive = get().activeConversation;
      if (!currentActive && data.length > 0) {
        get().selectConversation(data[0]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to load conversations.";
      set({ error: msg, loadingConversations: false });
    }
  },

  selectConversation: async (conversation: Conversation) => {
    set({ activeConversation: conversation });
    await get().fetchMessages(conversation.id);
  },

  fetchMessages: async (conversationId: string) => {
    set({ loadingMessages: true });
    try {
      const data = await messagingClient.getMessages(conversationId);
      set({ messages: data, loadingMessages: false });
    } catch (err: any) {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (conversationId: string, content: string): Promise<boolean> => {
    if (!content.trim()) return false;
    set({ sendingMessage: true });
    try {
      const newMsg = await messagingClient.sendMessage(conversationId, { content: content.trim() });
      
      // Append message to state
      set((state) => ({
        messages: [...state.messages, newMsg],
        sendingMessage: false,
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, last_message_at: newMsg.created_at } : c
        ),
      }));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to send message.";
      toast.error(msg);
      set({ sendingMessage: false });
      return false;
    }
  },

  createConversation: async (bookingId: string): Promise<Conversation | null> => {
    set({ loadingConversations: true });
    try {
      const conversation = await messagingClient.createConversation({ booking_id: bookingId });
      toast.success("Conversation created.");
      
      // Refresh list and select
      await get().fetchConversations();
      await get().selectConversation(conversation);
      
      return conversation;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to start conversation.";
      // If conversation already exists, try to find and select it
      if (msg.includes("already exists")) {
        const conversations = get().conversations;
        const existing = conversations.find((c) => c.booking_id === bookingId);
        if (existing) {
          await get().selectConversation(existing);
          set({ loadingConversations: false });
          return existing;
        }
      }
      toast.error(msg);
      set({ loadingConversations: false });
      return null;
    }
  },
}));
