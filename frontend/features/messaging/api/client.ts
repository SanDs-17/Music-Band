import { api } from "@/services/api";
import {
  Conversation,
  Message,
  CreateConversationPayload,
  SendMessagePayload,
} from "../types";

export const messagingClient = {
  listConversations: async (): Promise<Conversation[]> => {
    const response = await api.get("/conversations");
    return response.data.data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/conversations/${id}`);
    return response.data.data;
  },

  createConversation: async (payload: CreateConversationPayload): Promise<Conversation> => {
    const response = await api.post("/conversations", payload);
    return response.data.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<Message[]> => {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  sendMessage: async (conversationId: string, payload: SendMessagePayload): Promise<Message> => {
    const response = await api.post(`/conversations/${conversationId}/messages`, payload);
    return response.data.data;
  },
};
