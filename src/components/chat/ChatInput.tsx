"use client";

import React, { useState, KeyboardEvent } from "react";
import { useChat } from "@/contexts/ChatContext";

const ChatInput: React.FC = () => {
  const { sendMessage, currentRoom } = useChat();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    try {
      await sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  if (!currentRoom) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={1}
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
      >
        전송
      </button>
    </form>
  );
};

export default ChatInput;
