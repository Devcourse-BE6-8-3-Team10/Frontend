import React from 'react';
import { useChat } from '../../contexts/ChatContext';

export default function ChatRoomList() {
  const { rooms, currentRoom, selectRoom, getUnreadCount } = useChat();

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">채팅방 목록</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            채팅방이 없습니다
          </div>
        ) : (
          <div>
            {rooms.map((room) => {
              const unreadCount = getUnreadCount(room.id);
              const isActive = currentRoom?.id === room.id;
              
              return (
                <div
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                        {room.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        참여자: {room.participants.join(', ')}
                      </p>
                    </div>
                    
                    {/* 읽지 않은 메시지 개수 표시 */}
                    {unreadCount > 0 && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
