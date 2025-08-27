import SockJS from "sockjs-client";
import { Client, StompSubscription } from "@stomp/stompjs";

export interface ChatMessage {
  id?: string;
  senderId: string | number; // 백엔드에서 number로 오고, 프론트에서 비교할 때 타입 혼동 방지
  senderName: string;
  content: string;
  timestamp: string;
  roomId: number;
  chatRoomId?: number; // WebSocket에서 사용하는 추가 속성
  senderEmail : string;
  messageType?: string; // 메시지 타입 추가 (일반, 나가기 알림 등)
}

export interface ChatRoom {
  id: number;
  name: string;
  participants: string[];
  lastMessage?: ChatMessage;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<number, StompSubscription> = new Map();
  private isConnected: boolean = false;

  // WebSocket 연결
  public connect(userEmail: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log("WebSocket 연결 시도...");

        this.client = new Client({
          webSocketFactory: () => new SockJS("https://www.devteam10.org/chat"),
          connectHeaders: {
            "user-email": userEmail
          },
          // debug: process.env.NODE_ENV === "development" ? console.log : undefined,
          reconnectDelay: 0,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
          console.log("WebSocket 연결 성공");
          this.isConnected = true;
          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error("STOMP 에러:", frame);
          reject(new Error(frame.headers.message || "STOMP 연결 에러"));
        };

        this.client.onWebSocketError = (error) => {
          console.error("WebSocket 에러:", error);
          reject(error);
        };

        this.client.onWebSocketClose = () => {
          console.log("WebSocket 연결 종료");
          this.isConnected = false;
          this.subscriptions.clear();
        };

        this.client.activate();
      } catch (error) {
        console.error("WebSocket 연결 중 에러:", error);
        reject(error);
      }
    });
  }

  // 연결 해제
  public disconnect(): void {
    console.log("=== WebSocket 연결 해제 시작 ===");
    console.log("현재 구독 중인 채팅방 수:", this.subscriptions.size);

    if (this.client) {
      this.subscriptions.forEach((subscription, roomId) => {
        console.log(`채팅방 ${roomId} 구독 해제`);
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      console.log("모든 구독 해제 완료");

      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      console.log("WebSocket 클라이언트 해제 완료");
    }
  }

  // 채팅방 구독
  public subscribeToChatRoom(
    roomId: number,
    onMessage: (message: ChatMessage) => void
  ): void {
    console.log(`=== 채팅방 ${roomId} 구독 시도 ===`);

    if (!this.client || !this.isConnected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return;
    }

    // 기존 구독이 있으면 해제
    const existingSubscription = this.subscriptions.get(roomId);
    if (existingSubscription) {
      console.log(`기존 채팅방 ${roomId} 구독 해제`);
      existingSubscription.unsubscribe();
      this.subscriptions.delete(roomId);
    }

    console.log(`채팅방 ${roomId} 새 구독 생성`);
    const subscription = this.client.subscribe(
      `/topic/chat/${roomId}`,
      (message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          console.log(`채팅방 ${roomId}에서 메시지 수신:`, chatMessage);
          onMessage(chatMessage);
        } catch (error) {
          console.error("메시지 파싱 에러:", error);
        }
      }
    );

    this.subscriptions.set(roomId, subscription);
    console.log(`✅ 채팅방 ${roomId} 구독 완료, 총 구독 수: ${this.subscriptions.size}`);

    // 현재 구독 중인 채팅방 목록 출력
    console.log("현재 구독 중인 채팅방들:", Array.from(this.subscriptions.keys()));
  }

  // 채팅방 구독 해제
  public unsubscribeFromChatRoom(roomId: number): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      console.log(`채팅방 ${roomId} 구독 해제`);
    }
  }

  // 메시지 전송
  public sendMessage(
    roomId: number,
    message: Omit<ChatMessage, "id" | "timestamp">
  ): void {
    console.log("=== WebSocket sendMessage 호출 ===");
    console.log("client 상태:", this.client);
    console.log("isConnected:", this.isConnected);
    console.log("roomId:", roomId);
    console.log("message:", message);

    if (!this.client || !this.isConnected) {
      console.error("❌ WebSocket이 연결되지 않았습니다.");
      console.error("client:", this.client);
      console.error("isConnected:", this.isConnected);
      return;
    }

    // 백엔드 MessageDto 형식에 맞춰서 전송
    const messageDto = {
      senderId: Number(message.senderId),
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      content: message.content,
      chatRoomId: roomId
    };

    console.log("전송할 messageDto:", messageDto);
    console.log("destination:", `/app/sendMessage`);

    try {
      this.client.publish({
        destination: `/app/sendMessage`, // 백엔드 @MessageMapping과 일치
        body: JSON.stringify(messageDto),
      });

      console.log("✅ 메시지 전송 완료:", messageDto);
    } catch (error) {
      console.error("❌ 메시지 전송 중 에러:", error);
    }
  }

  // 연결 상태 확인
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService();
export default webSocketService;
