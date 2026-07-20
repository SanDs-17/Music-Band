export interface Conversation {
  id: string;
  booking_id: string;
  client_id: string;
  band_id: string;
  venue_owner_id?: string | null;
  status: "ACTIVE" | "CLOSED";
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
  event_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: "TEXT";
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationPayload {
  booking_id: string;
}

export interface SendMessagePayload {
  content: string;
}
