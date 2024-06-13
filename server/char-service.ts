import type { ChatMessage } from './types';

const messages: ChatMessage[] = [];
const users = new Map<string, { online: boolean }>();

export const ChatService = {
  open(userName: string) {
    users.set(userName, { online: true });

    return {
      userName,
      stats: ChatService.getStats(),
    };
  },

  close(userName: string) {
    users.set(userName, { online: false });
  },

  getStats() {
    const online = Array.from(users.values()).filter((u) => u.online).length;
    return { online, total: users.size };
  },

  async addMessage(userName: string, text: string) {
    const newMessage = { userName, text, timestamp: new Date() };
    messages.push(newMessage);

    if (Math.random() < 0.01) ChatService.garbageCollect();

    return newMessage;
  },

  getMessages(life: number = 5 * 60 * 1000) {
    if (Math.random() < 0.01) ChatService.garbageCollect();

    return messages.filter((m) => m.timestamp > new Date(Date.now() - life));
  },

  garbageCollect() {
    const newMessages = ChatService.getMessages();

    messages.length = 0;
    messages.push(...newMessages);
  },
};
