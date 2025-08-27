"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import ChatRoom from "./ChatRoom";

export default function ChatRoomWithParams() {
  const searchParams = useSearchParams();
  const { rooms, isConnected, currentRoom, selectRoom } = useChat();

  // URL 파라미터로 전달된 roomId 처리
  useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');

    // 조건: roomId가 있고, 방 목록이 로드되고, 연결되었고, 현재 선택된 방이 없을 때
    if (roomIdFromUrl && rooms.length > 0 && isConnected && !currentRoom) {
      const targetRoom = rooms.find(room => room.id === Number(roomIdFromUrl));
      if (targetRoom) {
        console.log("URL 파라미터로 채팅방 자동 선택:", targetRoom.name);
        selectRoom(targetRoom);
      }
    }
  }, [searchParams, rooms, isConnected, currentRoom, selectRoom]);

  return <ChatRoom />;
}
