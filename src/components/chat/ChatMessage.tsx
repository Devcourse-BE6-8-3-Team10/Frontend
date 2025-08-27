"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/utils/websocket";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isOwnMessage = message.senderId === userData.id;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1 ml-1">
            {message.senderName}
          </div>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-900 border border-gray-200"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
