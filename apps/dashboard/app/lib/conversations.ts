/**
 * Serializers shared by the conversations/messages API routes. Keeping them in
 * one place means the REST shape stays consistent between list, detail and
 * create responses (and is easy to unit test).
 */

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  isRFTeam: boolean;
  content: string;
  createdAt: Date;
  sender: {
    name: string;
    avatarInitials: string;
    role: string;
    isRFTeam: boolean;
  };
}

export interface ConversationSummaryRow {
  id: string;
  topic: string;
  contextLabel: string;
  rfLead: string;
  unread: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{ content: string; createdAt: Date }>;
  _count: { messages: number };
}

export interface SerializedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderRole: string;
  isRFTeam: boolean;
  content: string;
  createdAt: Date;
}

function senderRole(message: MessageWithSender): string {
  if (message.sender.isRFTeam) return "RF Operations";
  return message.sender.role === "ADMIN" ? "Admin" : "Member";
}

export function serializeMessage(message: MessageWithSender): SerializedMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: message.sender.name,
    senderInitials: message.sender.avatarInitials,
    senderRole: senderRole(message),
    isRFTeam: message.isRFTeam,
    content: message.content,
    createdAt: message.createdAt,
  };
}

export function serializeConversationSummary(row: ConversationSummaryRow) {
  return {
    id: row.id,
    topic: row.topic,
    contextLabel: row.contextLabel,
    rfLead: row.rfLead,
    unread: row.unread,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastMessageAt: row.messages[0]?.createdAt ?? null,
    lastMessagePreview: row.messages[0]?.content ?? null,
    messageCount: row._count.messages,
  };
}
