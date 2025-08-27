"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { ChatMessage, ChatRoom, webSocketService } from "../utils/websocket";
import { useAuth } from "./AuthContext";
import { getAccessTokenCookie } from "../utils/cookieUtils";
import { chatAPI } from "../utils/apiClient";

// 백엔드에서 받는 메시지 타입 정의
interface BackendMessage {
  id?: string | number;
  senderId: string | number;
  senderName: string;
  content: string;
  timestamp?: string;
  createdAt?: string;
  senderEmail?: string;
  messageType?: string;
}

// WebSocket에서 받는 원본 메시지 타입 정의
interface RawWebSocketMessage {
  id?: string | number;
  senderId: string | number;
  senderName: string;
  content: string;
  timestamp?: string;
  roomId?: number;
  chatRoomId?: number;
  senderEmail?: string;
  messageType?: string;
}

// 상태 구조 변경 - 방별 메시지 저장
interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messagesByRoom: { [roomId: number]: ChatMessage[] }; // 방별 메시지 저장
  unreadCounts: { [roomId: number]: number }; // 읽지 않은 메시지 수
  inactiveRooms: { [roomId: number]: boolean }; // 비활성화된 채팅방 추적
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ChatContextType extends ChatState {
  connectToChat: () => Promise<void>;
  disconnectFromChat: () => void;
  selectRoom: (room: ChatRoom) => void;
  sendMessage: (content: string) => Promise<void>;
  createRoom: (roomName: string, participants: string[]) => Promise<ChatRoom>; // 채팅방 생성 함수
  createTestRoom: () => void;
  ensureConnected: () => Promise<void>;
  getCurrentRoomMessages: () => ChatMessage[]; // 현재 방 메시지 가져오기
  deleteChatRoom: (roomId: number) => Promise<void>; // 채팅방 삭제
  markRoomAsRead: (roomId: number) => void; // 특정 방을 읽음 처리
  getUnreadCount: (roomId: number) => number; // 특정 방의 읽지 않은 메시지 수
  refreshChatRooms: () => Promise<void>; // 채팅방 목록 새로고침
  isRoomInactive: (roomId: number) => boolean; // 채팅방 비활성화 상태 확인
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<ChatState>({
    rooms: [],
    currentRoom: null,
    messagesByRoom: {}, // 🔥 빈 객체로 초기화
    unreadCounts: {}, // 읽지 않은 메시지 수 초기화
    inactiveRooms: {}, // 비활성화된 채팅방 초기화
    isConnected: false,
    isLoading: false,
    error: null,
  });

  // 메시지 로드 함수 추가
  const loadChatRoomMessages = useCallback(async (roomId: number) => {
    try {
      console.log(`채팅방 ${roomId} 메시지 로드 시작`);

      const token = getAccessTokenCookie();
      const response = await fetch(`https://www.devteam10.org/api/chat/rooms/${roomId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`메시지 로드 실패: ${response.status}`);
      }

      const responseData = await response.json();
      const messages = responseData.data || [];

      console.log(`채팅방 ${roomId} 메시지 로드 완료:`, messages.length, '개');
      console.log(`첫 번째 메시지 샘플:`, messages[0]);

      // 메시지 데이터 변환 - 백엔드에서 오는 형식을 프론트엔드 형식으로 변환
      const transformedMessages = messages.map((msg: BackendMessage) => ({
        id: msg.id || String(Date.now() + Math.random()),
        senderId: String(msg.senderId), // 문자열로 변환
        senderName: msg.senderName,
        content: msg.content,
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
        roomId: roomId,
        senderEmail: msg.senderEmail || '',
        messageType: msg.messageType || 'NORMAL'
      }));

      console.log(`변환된 첫 번째 메시지:`, transformedMessages[0]);

      // 방별 메시지 저장
      setState(prev => ({
        ...prev,
        messagesByRoom: {
          ...prev.messagesByRoom,
          [roomId]: transformedMessages
        }
      }));

    } catch (error) {
      console.error(`채팅방 ${roomId} 메시지 로드 실패:`, error);
      // 실패해도 빈 배열로 초기화
      setState(prev => ({
        ...prev,
        messagesByRoom: {
          ...prev.messagesByRoom,
          [roomId]: []
        }
      }));
    }
  }, []);

  // 현재 방의 메시지를 가져오는 함수
  const getCurrentRoomMessages = useCallback(() => {
    return state.currentRoom ? state.messagesByRoom[state.currentRoom.id] || [] : [];
  }, [state.currentRoom, state.messagesByRoom]);

  // 채팅방 목록 새로고침 함수 추가
  const refreshChatRooms = useCallback(async () => {
    if (!user || !isAuthenticated) {
      console.log("채팅방 목록 새로고침 - 인증되지 않은 사용자");
      return;
    }

    try {
      console.log("채팅방 목록 새로고침 시작");
      const token = getAccessTokenCookie();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://www.devteam10.org/api/chat/rooms/my', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`채팅방 목록을 불러올 수 없습니다. (${response.status})`);
      }

      const responseData = await response.json();
      const roomsData = responseData.data;

      // 배열 처리 로직 (기존 connectToChat과 동일)
      let rooms = [];
      if (Array.isArray(roomsData)) {
        rooms = roomsData;
      } else if (roomsData && Array.isArray(roomsData.data)) {
        rooms = roomsData.data;
      } else if (roomsData && roomsData.rooms && Array.isArray(roomsData.rooms)) {
        rooms = roomsData.rooms;
      }

      // 중복 제거
      const uniqueRooms = rooms.reduce((acc: ChatRoom[], current: ChatRoom) => {
        const existing = acc.find(room => room.id === current.id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);

      console.log("새로고침된 채팅방 목록:", uniqueRooms);

      // 기존 구독 중인 채팅방 ID들
      const existingRoomIds = state.rooms.map(room => room.id);

      // 상태 업데이트
      setState(prev => ({
        ...prev,
        rooms: uniqueRooms
      }));

      // 새로운 채팅방들을 WebSocket에 구독
      uniqueRooms.forEach((room: ChatRoom) => {
        // 기존에 구독하지 않은 새로운 방만 구독
        if (!existingRoomIds.includes(room.id)) {
          console.log(`새 채팅방 ${room.id} WebSocket 구독 시작`);
          webSocketService.subscribeToChatRoom(room.id, (message) => {
            const messageRoomId = message.roomId || message.chatRoomId || room.id;
            setState(prevState => {
              // 나가기 알림 메시지인 경우 처리
              if (message.messageType === "LEAVE_NOTIFICATION") {
                console.log(`⚠️ 채팅방 ${messageRoomId} 나가기 알림 수신:`, message.content);

                return {
                  ...prevState,
                  messagesByRoom: {
                    ...prevState.messagesByRoom,
                    [messageRoomId]: [...(prevState.messagesByRoom[messageRoomId] || []), message]
                  },
                  // 채팅방을 비활성화 상태로 표시
                  inactiveRooms: {
                    ...prevState.inactiveRooms,
                    [messageRoomId]: true
                  }
                };
              }

              // 일반 메시지 처리
              const shouldIncrementUnread = prevState.currentRoom?.id !== messageRoomId;

              if (shouldIncrementUnread) {
                console.log(`방 ${messageRoomId} 읽지 않은 메시지 수: ${(prevState.unreadCounts[messageRoomId] || 0)} → ${(prevState.unreadCounts[messageRoomId] || 0) + 1}`);
              }

              return {
                ...prevState,
                messagesByRoom: {
                  ...prevState.messagesByRoom,
                  [messageRoomId]: [...(prevState.messagesByRoom[messageRoomId] || []), message]
                },
                unreadCounts: shouldIncrementUnread ? {
                  ...prevState.unreadCounts,
                  [messageRoomId]: (prevState.unreadCounts[messageRoomId] || 0) + 1
                } : prevState.unreadCounts
              };
            });
          });
        }
      });

      console.log("채팅방 목록 새로고침 완료");
    } catch (error) {
      console.error("채팅방 목록 새로고침 실패:", error);
      throw error;
    }
  }, [user, isAuthenticated, state.rooms]);

  // WebSocket 연결
  const connectToChat = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setState(prev => ({ ...prev, error: "로그인이 필요합니다." }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await webSocketService.connect(user.email);

      // 수동으로 토큰을 헤더에 추가
      const token = getAccessTokenCookie();
      console.log("=== 채팅 연결 디버깅 ===");
      console.log("토큰 존재 여부:", !!token);
      console.log("토큰 앞 20자:", token ? token.substring(0, 20) + "..." : "없음");
      console.log("사용자 정보:", user);
      console.log("전체 쿠키 문자열:", document.cookie);
      console.log("accessToken 쿠키 직접 확인:", document.cookie.includes('accessToken'));

      // 모든 쿠키 파싱해서 보기
      const allCookies = document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        cookies[name] = value;
        return cookies;
      }, {} as Record<string, string>);
      console.log("파싱된 모든 쿠키:", allCookies);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log("요청 헤더:", headers);

      const response = await fetch('https://www.devteam10.org/api/chat/rooms/my', {
        method: 'GET',
        headers,
        credentials: 'include' // 쿠키도 함께 전송
      });

      if (!response.ok) {
        throw new Error(`채팅방 목록을 불러올 수 없습니다. (${response.status})`);
      }

      const responseData = await response.json();
      const roomsData = responseData.data;
      console.log("서버에서 받은 채팅방 데이터:", roomsData);

      // 서버 응답이 배열인지 확인하고 처리
      let rooms = [];
      if (Array.isArray(roomsData)) {
        rooms = roomsData;
      } else if (roomsData && Array.isArray(roomsData.data)) {
        rooms = roomsData.data;
      } else if (roomsData && roomsData.rooms && Array.isArray(roomsData.rooms)) {
        rooms = roomsData.rooms;
      } else {
        console.warn("서버에서 받은 데이터가 배열 형태가 아닙니다:", roomsData);
      }

      // 중복 채팅방 제거 (같은 ID를 가진 방이 여러 개 있을 경우)
      const uniqueRooms = rooms.reduce((acc: ChatRoom[], current: ChatRoom) => {
        const existing = acc.find(room => room.id === current.id);
        if (!existing) {
          acc.push(current);
        } else {
          console.warn(`중복된 채팅방 ID 발견: ${current.id}, 기존 방 유지`);
        }
        return acc;
      }, []);

      console.log("중복 제거 후 채팅방 목록:", uniqueRooms);

      setState(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        rooms: uniqueRooms
      }));

      console.log("=== 모든 채팅방 구독 시작 ===");
      uniqueRooms.forEach((room: ChatRoom) => {
        webSocketService.subscribeToChatRoom(room.id, (rawMessage: RawWebSocketMessage) => {

          // 메시지 변환
          const message: ChatMessage = {
            id: rawMessage.id ? String(rawMessage.id) : String(Date.now() + Math.random()),
            senderId: String(rawMessage.senderId), // 문자열로 변환
            senderName: rawMessage.senderName,
            content: rawMessage.content,
            timestamp: rawMessage.timestamp || new Date().toISOString(),
            roomId: rawMessage.roomId || rawMessage.chatRoomId || room.id,
            senderEmail: rawMessage.senderEmail || '',
            messageType: rawMessage.messageType || 'NORMAL'
          };

          console.log(`채팅방 ${room.id}에서 변환된 메시지:`, message);

          // roomId가 없으면 현재 구독중인 방 ID를 사용
          const messageRoomId = message.roomId;

          setState(prevState => {
            // 나가기 알림 메시지인 경우 처리
            if (message.messageType === "LEAVE_NOTIFICATION") {
              console.log(`⚠️ 채팅방 ${messageRoomId} 나가기 알림 수신:`, message.content);

              return {
                ...prevState,
                messagesByRoom: {
                  ...prevState.messagesByRoom,
                  [messageRoomId]: [...(prevState.messagesByRoom[messageRoomId] || []), message]
                },
                // 채팅방을 비활성화 상태로 표시
                inactiveRooms: {
                  ...prevState.inactiveRooms,
                  [messageRoomId]: true
                }
              };
            }

            // 일반 메시지 처리
            const shouldIncrementUnread = prevState.currentRoom?.id !== messageRoomId;

            if (shouldIncrementUnread) {
              console.log(`방 ${messageRoomId} 읽지 않은 메시지 수: ${(prevState.unreadCounts[messageRoomId] || 0)} → ${(prevState.unreadCounts[messageRoomId] || 0) + 1}`);
            }

            return {
              ...prevState,
              messagesByRoom: {
                ...prevState.messagesByRoom,
                [messageRoomId]: [...(prevState.messagesByRoom[messageRoomId] || []), message]
              },
              // 다른 방의 메시지면 읽지 않은 메시지 수 증가
              unreadCounts: shouldIncrementUnread ? {
                ...prevState.unreadCounts,
                [messageRoomId]: (prevState.unreadCounts[messageRoomId] || 0) + 1
              } : prevState.unreadCounts
            };
          });
        });
      });
      console.log(`총 ${uniqueRooms.length}개 채팅방 구독 완료`);

      console.log("채팅 연결 완료");
    } catch (error) {
      console.error("채팅 연결 실패:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "연결 실패",
        isLoading: false,
        isConnected: false
      }));
    }
  }, [user, isAuthenticated]);

  // 연결 보장 함수 - 필요시 자동 연결
  const ensureConnected = useCallback(async () => {
    console.log("=== WebSocket 연결 확인 ===");
    console.log("현재 연결 상태:", state.isConnected);
    console.log("사용자 인증 상태:", isAuthenticated);
    console.log("로딩 상태:", state.isLoading);

    if (!isAuthenticated || !user) {
      throw new Error("로그인이 필요합니다.");
    }

    if (!state.isConnected && !state.isLoading) {
      console.log("WebSocket 연결되지 않음 - 자동 연결 시도");
      await connectToChat();
    } else if (state.isConnected) {
      console.log("이미 WebSocket에 연결되어 있음");
    } else {
      console.log("연결 중이므로 대기");
    }
  }, [isAuthenticated, user, state.isConnected, state.isLoading, connectToChat]);

  // 채팅 페이지 접속 시 자동 WebSocket 연결
  useEffect(() => {
    if (isAuthenticated && user && !state.isConnected && !state.isLoading && !state.error) {
      console.log("채팅 페이지 접속 - 자동 연결 시도");
      connectToChat();
    }
  }, [isAuthenticated, user, state.isConnected, state.isLoading, state.error, connectToChat]);

  // WebSocket 연결 해제
  const disconnectFromChat = useCallback(() => {
    console.log("=== 채팅 연결 해제 ===");
    webSocketService.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
      currentRoom: null,
      messagesByRoom: {}, // 모든 메시지 캐시 초기화
      inactiveRooms: {} // 비활성화 상태도 초기화
    }));
  }, []);

  //  채팅방 선택 - 구독은 이미 되어있으니 currentRoom만 변경
  const selectRoom = useCallback(async (room: ChatRoom) => {
    console.log("selectRoom 호출:", room.name, "ID:", room.id);

    // 연결 상태 체크
    if (!state.isConnected) {
      console.error("WebSocket이 연결되지 않았습니다.");
      return;
    }

    // 같은 방 체크
    if (state.currentRoom && state.currentRoom.id === room.id) {
      console.log("이미 선택된 방입니다.");
      return;
    }

    console.log(`채팅방 선택: ${room.name} (ID: ${room.id})`);

    // 상태 업데이트
    setState(prev => ({
      ...prev,
      currentRoom: room,
      unreadCounts: {
        ...prev.unreadCounts,
        [room.id]: 0 // 선택한 방의 읽지 않은 메시지 수를 0으로 초기화
      }
    }));

    // 해당 방의 메시지가 없으면 로드
    if (!state.messagesByRoom[room.id]) {
      console.log(`채팅방 ${room.id} 메시지 히스토리 로드 시작`);
      await loadChatRoomMessages(room.id);
    } else {
      console.log(`채팅방 ${room.id} 메시지 캐시 존재 (${state.messagesByRoom[room.id].length}개)`);
    }

  }, [state.isConnected, state.currentRoom, state.messagesByRoom, loadChatRoomMessages]);

  // 메시지 전송 - 방별 메시지에 반영
  const sendMessage = useCallback(async (content: string) => {
    console.log("=== ChatContext sendMessage 호출 ===");
    console.log("content:", content);
    console.log("user:", user);

    if (!user) {
      console.error("❌ 사용자 정보가 없습니다.");
      throw new Error("사용자 정보가 없습니다.");
    }

    // state를 직접 읽어서 조건 확인
    if (!state.currentRoom || !state.isConnected) {
      console.error("❌ 메시지 전송 조건이 맞지 않습니다.");
      console.error("currentRoom:", state.currentRoom);
      console.error("isConnected:", state.isConnected);
      throw new Error("메시지 전송 조건이 맞지 않습니다.");
    }

    try {
      const message: Omit<ChatMessage, "id" | "timestamp"> = {
        senderId: String(user.id), // 문자열로 변환하여 일관성 확보
        senderName: user.name,
        content,
        senderEmail: user.email,
        roomId: state.currentRoom.id,
      };

      console.log("생성된 message 객체:", message);

      // WebSocket으로 메시지 전송 (백엔드에서 저장 및 분배 처리)
      console.log("webSocketService.sendMessage 호출...");
      webSocketService.sendMessage(state.currentRoom.id, message);

      console.log("✅ 메시지 전송 완료");
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
      throw error;
    }
  }, [user, state.currentRoom, state.isConnected]);

  // 채팅방 생성
  const createRoom = useCallback(async (roomName: string, participants: string[]) => {
    try {
      console.log(`채팅방 생성 시작: ${roomName}`, participants);

      // 서버에 채팅방 생성 요청
      const newRoom = await chatAPI.createChatRoom({
        name: roomName,
        participants: participants,
      });

      console.log('새 채팅방 생성 완료:', newRoom);

      // 채팅방 목록 새로고침
      await refreshChatRooms();

      // 새로 생성된 방 선택
      selectRoom(newRoom);

      return newRoom;
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      throw error;
    }
  }, [refreshChatRooms, selectRoom]);

  // 테스트용 방 생성
  const createTestRoom = useCallback(() => {
    if (!user) return;

    const newRoom: ChatRoom = {
      id: Date.now(), // 임시 ID, 실제로는 서버에서 생성된 ID 사용
      name: `새 채팅방 ${new Date().toLocaleTimeString()}`,
      participants: [user.email]
    };

    setState(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  }, [user]);

  // 읽지 않은 메시지 수 관리 함수들
  const markRoomAsRead = useCallback((roomId: number) => {
    setState(prev => ({
      ...prev,
      unreadCounts: {
        ...prev.unreadCounts,
        [roomId]: 0
      }
    }));
  }, []);

  const getUnreadCount = useCallback((roomId: number) => {
    return state.unreadCounts[roomId] || 0;
  }, [state.unreadCounts]);

  // 채팅방 비활성화 상태 확인
  const isRoomInactive = useCallback((roomId: number) => {
    return state.inactiveRooms[roomId] || false;
  }, [state.inactiveRooms]);

  // 채팅방 삭제
  const deleteChatRoom = useCallback(async (roomId: number) => {
    try {
      console.log(`채팅방 삭제 시작: ${roomId}`);

      // 현재 선택된 방이 삭제되는 방인 경우 구독 해제
      if (state.currentRoom && state.currentRoom.id === roomId) {
        webSocketService.unsubscribeFromChatRoom(roomId);
      }

      // 서버에 삭제 요청
      await chatAPI.deleteChatRoom(roomId);

      // 로컬 상태에서 채팅방 제거
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
        // 현재 방이 삭제된 방이면 null로 설정
        currentRoom: prev.currentRoom?.id === roomId ? null : prev.currentRoom,
        // 해당 방의 메시지도 제거
        messagesByRoom: Object.fromEntries(
          Object.entries(prev.messagesByRoom).filter(([id]) => Number(id) !== roomId)
        ),
        // 해당 방의 읽지 않은 메시지 수도 제거
        unreadCounts: Object.fromEntries(
          Object.entries(prev.unreadCounts).filter(([id]) => Number(id) !== roomId)
        ),
        // 해당 방의 비활성화 상태도 제거
        inactiveRooms: Object.fromEntries(
          Object.entries(prev.inactiveRooms).filter(([id]) => Number(id) !== roomId)
        )
      }));

      console.log(`채팅방 삭제 완료: ${roomId}`);
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
      throw error;
    }
  }, [state.currentRoom]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnectFromChat();
    };
  }, [disconnectFromChat]);

  const value: ChatContextType = {
    ...state,
    connectToChat,
    disconnectFromChat,
    selectRoom,
    sendMessage,
    createRoom, // 채팅방 생성 함수 추가
    createTestRoom,
    ensureConnected,
    getCurrentRoomMessages, // 새로운 함수 추가
    deleteChatRoom, // 채팅방 삭제 함수 추가
    markRoomAsRead, // 읽음 처리 함수 추가
    getUnreadCount, // 읽지 않은 메시지 수 조회 함수 추가
    refreshChatRooms, // 채팅방 목록 새로고침 함수 추가
    isRoomInactive, // 채팅방 비활성화 상태 확인 함수 추가
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
