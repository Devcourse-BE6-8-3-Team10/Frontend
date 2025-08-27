"use client";

import React, { useState } from "react";
import { useChat } from "@/contexts/ChatContext";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createRoom } = useChat();
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || participants.length === 0) return;

    setIsLoading(true);
    try {
      await createRoom(roomName.trim(), participants);
      handleClose();
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = () => {
    if (
      newParticipant.trim() &&
      !participants.includes(newParticipant.trim())
    ) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant("");
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    setParticipants(participants.filter((p) => p !== participant));
  };

  const handleClose = () => {
    setRoomName("");
    setParticipants([]);
    setNewParticipant("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">새 채팅방 만들기</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              채팅방 이름
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="채팅방 이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              참여자 추가
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddParticipant())
                }
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="사용자 ID 또는 이메일"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                추가
              </button>
            </div>
          </div>

          {participants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                참여자 목록
              </label>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm">{participant}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(participant)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                !roomName.trim() || participants.length === 0 || isLoading
              }
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
