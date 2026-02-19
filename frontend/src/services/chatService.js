import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class ChatService {
    constructor() {
        this.client = null;
        this.subscriptions = {};
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            this.client = new Client({
                webSocketFactory: () => new SockJS(`${WS_URL}?token=${token}`),
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,
                onConnect: () => {
                    console.log('[Chat] Connected to WebSocket');
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('[Chat] STOMP error:', frame);
                    reject(new Error(frame.body));
                },
                onDisconnect: () => {
                    console.log('[Chat] Disconnected');
                },
            });
            this.client.activate();
        });
    }

    subscribe(groupId, callback) {
        if (!this.client || !this.client.connected) {
            console.warn('[Chat] Not connected — cannot subscribe');
            return null;
        }

        const sub = this.client.subscribe(`/topic/chat/${groupId}`, (message) => {
            try {
                const parsed = JSON.parse(message.body);
                callback(parsed);
            } catch (e) {
                callback({ content: message.body });
            }
        });

        this.subscriptions[groupId] = sub;
        return sub;
    }

    unsubscribe(groupId) {
        if (this.subscriptions[groupId]) {
            this.subscriptions[groupId].unsubscribe();
            delete this.subscriptions[groupId];
        }
    }

    sendMessage(groupId, content) {
        if (!this.client || !this.client.connected) {
            console.warn('[Chat] Not connected — cannot send');
            return;
        }

        this.client.publish({
            destination: `/app/chat.send/${groupId}`,
            body: JSON.stringify({ content }),
        });
    }

    disconnect() {
        if (this.client) {
            Object.keys(this.subscriptions).forEach((key) => {
                this.subscriptions[key].unsubscribe();
            });
            this.subscriptions = {};
            this.client.deactivate();
            this.client = null;
        }
    }

    get isConnected() {
        return this.client?.connected ?? false;
    }
}

export const chatService = new ChatService();
