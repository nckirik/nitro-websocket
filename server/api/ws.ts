import { defineWebSocketHandler } from 'h3';
import { getQuery } from 'ufo';
import type { Peer } from 'crossws';

import type { ChatMessage } from '../types';
import { ChatService } from '../char-service';

const getUserName = (peer: Peer) => getQuery(peer.url)['userName'] as string;

export default defineWebSocketHandler({
  async upgrade(req) {
    console.log('hello', req);

    return { headers: { 'x-powered-by': 'epmr' } };
  },

  async open(peer) {
    console.log(peer.ctx);

    console.log(`[ws] open ${peer}`);

    const userName = getUserName(peer);

    const { stats } = ChatService.open(userName);

    const serverMsg = { userName: 'Server', text: '', timestamp: new Date() } as ChatMessage;
    const welcomeMsg = { ...serverMsg, text: `Hello ${userName}! There are currently ${stats.online} users online` } as ChatMessage;
    const joinedMsg = { ...serverMsg, text: `${peer} joined!` } as ChatMessage;

    peer.send(welcomeMsg);
    peer.subscribe('chat');
    peer.publish('chat', joinedMsg);
  },

  async message(peer, payload) {
    const rawMessage = payload.text();
    console.log(`[ws] message ${peer} ${rawMessage}`);

    const userName = getUserName(peer);

    if (rawMessage === 'ping') {
      peer.send({ userName: 'Server', text: 'pong', timestamp: new Date() });
      return;
    }

    // Store message in database
    const response = await ChatService.addMessage(userName, rawMessage);
    if (!response) return;

    const { text, timestamp } = response;

    const _message = { userName, text, timestamp };
    peer.send(_message); // echo back
    peer.publish('chat', _message);
  },

  async close(peer, details) {
    console.log(`[ws] close ${peer}`, details);

    const userName = getUserName(peer);
    ChatService.close(userName);
  },

  async error(peer, error) {
    console.log(`[ws] error ${peer}`, error);
  },
});
