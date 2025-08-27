"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatRoom() {
  const {
    rooms,
    currentRoom,
    isConnected,
    error,
    selectRoom,
    sendMessage,
    getCurrentRoomMessages,
    deleteChatRoom,
    getUnreadCount,
    isRoomInactive // 새로 추가된 함수
  } = useChat();

  const { user, isAuthenticated } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = getCurrentRoomMessages();
  const isCurrentRoomInactive = currentRoom ? isRoomInactive(currentRoom.id) : false;

  // 채팅방 삭제 함수
  const handleDeleteRoom = async (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 채팅방 선택 이벤트 방지

    if (confirm('채팅방에서 나가시겠습니까? 채팅 기록이 모두 사라집니다.')) {
      try {
        await deleteChatRoom(roomId);
      } catch (error) {
        console.error('채팅방 삭제 실패:', error);
        alert('채팅방 삭제에 실패했습니다.');
      }
    }
  };

  // 메시지 목록 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (messageInput.trim()) {
      console.log("sendMessage 호출 중...");
      const inputElement = e.currentTarget.querySelector('input[type="text"]') as HTMLInputElement;

      sendMessage(messageInput.trim()).then(() => {
        console.log("sendMessage 완료");
        setMessageInput("");
        // 포커스 유지
        if (inputElement) {
          setTimeout(() => {
            inputElement.focus();
          }, 0);
        }
      }).catch((error) => {
        console.error("sendMessage 에러:", error);
        // 에러 시에도 포커스 유지
        if (inputElement) {
          setTimeout(() => {
            inputElement.focus();
          }, 0);
        }
      });
    } else {
      console.log("메시지가 비어있음");
    }
  };

  // 로그인하지 않은 경우
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">채팅을 이용하려면 로그인이 필요합니다</h2>
          <p className="text-gray-600">로그인 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 - 채팅방 목록 */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">채팅방</h2>
          <p className="text-sm text-gray-600">안녕하세요, {user.name}님!</p>
        </div>

        {/* 연결 상태 표시 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? '연결됨' : '연결 안됨'}
            </span>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 채팅방 목록 */}
        <div className="flex-1 overflow-y-auto">
          {Array.isArray(rooms) && rooms.map((room) => {
            const unreadCount = getUnreadCount(room.id);
            const roomInactive = isRoomInactive(room.id);

            return (
              <div
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 relative group ${
                  currentRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                } ${roomInactive ? 'opacity-60 bg-gray-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${roomInactive ? 'text-gray-500' : 'text-gray-800'}`}>
                      {room.name}
                      {roomInactive && <span className="text-red-500 text-sm ml-2">(비활성)</span>}
                    </h3>
                  </div>

                  {/* 읽지 않은 메시지 개수 표시 */}
                  {unreadCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full"
                        title={`읽지 않은 메시지 ${unreadCount}개`}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </div>
                  )}

                  {/* 삭제 버튼 - 인라인 스타일로 확실히 보이게 */}
                  <button
                    onClick={(e) => handleDeleteRoom(room.id, e)}
                    style={{
                      padding: '4px',
                      color: '#999',
                      backgroundColor: 'transparent',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#999';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                    title="채팅방 나가기"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          {(!Array.isArray(rooms) || rooms.length === 0) && isConnected && (
            <div className="p-4 text-center text-gray-500">
              <p>채팅방이 없습니다.</p>
              <p className="text-sm">방 생성 버튼을 눌러보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* 채팅방 헤더 */}
            <div className={`p-4 border-b border-gray-200 ${isCurrentRoomInactive ? 'bg-red-50' : 'bg-white'}`}>
              <h1 className={`text-xl font-bold ${isCurrentRoomInactive ? 'text-red-700' : 'text-gray-800'}`}>
                {currentRoom.name}
                {isCurrentRoomInactive && <span className="text-red-500 text-sm ml-2">(상대방이 나갔습니다)</span>}
              </h1>
              <p className="text-sm text-gray-600">방 ID: {currentRoom.id}</p>
              {isCurrentRoomInactive && (
                <p className="text-sm text-red-600 mt-1">이 채팅방은 더 이상 사용할 수 없습니다.</p>
              )}
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                // 나가기 알림 메시지인 경우 특별한 스타일 적용
                if (message.messageType === "LEAVE_NOTIFICATION") {
                  return (
                    <div key={`${message.id || index}`} className="flex justify-center">
                      <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm border border-red-200">
                        <p className="text-center">{message.content}</p>
                        <p className="text-xs text-red-500 text-center mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${message.id || index}`}
                    className={`flex ${String(message.senderId) === String(user.id) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        String(message.senderId) === String(user.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {String(message.senderId) !== String(user.id) && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {message.senderName}
                        </p>
                      )}
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        String(message.senderId) === String(user.id) ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className={`p-4 border-t border-gray-200 ${isCurrentRoomInactive ? 'bg-gray-100' : 'bg-white'}`}>
              {isCurrentRoomInactive ? (
                <div className="text-center text-gray-500">
                  <p>상대방이 채팅방을 나가서 더 이상 메시지를 보낼 수 없습니다.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!isConnected || !messageInput.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    전송
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-400 mb-2">채팅방을 선택해주세요</h2>
              <p className="text-gray-500">
                {isConnected
                  ? "왼쪽에서 채팅방을 선택하거나 새 방을 만들어보세요"
                  : "먼저 채팅에 연결해주세요"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
