"use client";

import { Suspense } from "react";
import ChatRoom from "@/components/chat/ChatRoom";
import ChatRoomWithParams from "@/components/chat/ChatRoomWithParams";

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅을 로딩하는 중...</p>
        </div>
      </div>
    }>
      <ChatRoomWithParams />
    </Suspense>
  );
}
