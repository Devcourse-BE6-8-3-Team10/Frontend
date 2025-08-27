'use client';

import React, { useState, useCallback } from "react";
import { adminAPI } from "@/utils/apiClient";
import AdminNavigation from "@/components/AdminNavigation";
import AdminLoadingSpinner from "@/components/AdminLoadingSpinner";
import { useAdminTable } from "@/hooks/useAdminTable";
import MemberDetailModal from "@/components/admin/MemberDetailModal";

interface Member {
  id: number;
  email: string;
  name: string;
  role: string;
  profileUrl?: string;
  status: string;
  createdAt: string;
  modifiedAt?: string;
  deletedAt?: string;
}

export default function AdminMembersPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // fetchData 함수를 useCallback으로 감싸서 안정적인 참조 제공
  const fetchMembers = useCallback(async () => {
    const response = await adminAPI.getAllMembers();
    // 백엔드 응답 구조에 맞게 데이터 추출
    // 백엔드 응답: { resultCode: "200-1", msg: "...", data: { content: [...], ... } }
    return response?.data?.content || [];
  }, []);

  const { user, isAuthenticated, loading, data: members, isLoading, error, refetch } = useAdminTable<Member>(fetchMembers);

  const handleMemberClick = (memberId: number) => {
    setSelectedMemberId(memberId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMemberId(null);
  };

  const handleMemberUpdated = () => {
    refetch(); // 회원 목록 새로고침
  };

  // 필터링된 회원 목록
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 정렬된 회원 목록
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: string | number | undefined;
    let bValue: string | number | undefined;
    
    if (sortBy === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (sortBy === 'modifiedAt') {
      aValue = a.modifiedAt ? new Date(a.modifiedAt).getTime() : 0;
      bValue = b.modifiedAt ? new Date(b.modifiedAt).getTime() : 0;
    } else {
      aValue = a[sortBy as keyof Member] as string;
      bValue = b[sortBy as keyof Member] as string;
    }
  
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !isAuthenticated || user?.role !== 'ADMIN') {
    return <AdminLoadingSpinner />;
  }

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">관리자 - 회원 관리</h1>
          </div>
          
          {/* 관리자 네비게이션 */}
          <AdminNavigation user={user} />

          {/* 회원 목록 카드 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a365d]">회원 목록</h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  총 {sortedMembers.length}명의 회원 (전체 {members.length}명)
                </div>
                <button
                  onClick={refetch}
                  disabled={isLoading}
                  className="px-3 py-1 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  새로고침
                </button>
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:w-48">
                                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="ALL">전체 상태</option>
                   <option value="ACTIVE">활성중</option>
                   <option value="BLOCKED">차단됨</option>
                   <option value="DELETED">삭제됨</option>
                 </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <div className="font-bold mb-2">오류가 발생했습니다:</div>
                <div>{error}</div>
                <div className="mt-2 text-sm text-red-600">
                  관리자 권한이 있는 계정으로 로그인했는지 확인해주세요.
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">회원 목록을 불러오는 중...</p>
                <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
                {error && (
                  <p className="text-sm text-red-500 mt-2">오류: {error}</p>
                )}
              </div>
            ) : sortedMembers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">
                  {members.length === 0 ? '👥' : '🔍'}
                </div>
                <p className="text-gray-600">
                  {members.length === 0 ? '등록된 회원이 없습니다.' : '검색 결과가 없습니다.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {members.length === 0 
                    ? '백엔드에서 관리자 API가 구현되면 회원 목록이 표시됩니다.'
                    : '다른 검색어나 필터를 시도해보세요.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                                     <thead>
                     <tr className="border-b border-gray-200">
                       <th className="text-left py-3 px-4 font-medium text-gray-700">번호</th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (sortBy === 'name') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('name');
                            setSortOrder('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          이름
                          {sortBy === 'name' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (sortBy === 'email') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('email');
                            setSortOrder('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          이메일
                          {sortBy === 'email' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">권한</th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (sortBy === 'status') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('status');
                            setSortOrder('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          상태
                          {sortBy === 'status' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                                             <th 
                         className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                         onClick={() => {
                           if (sortBy === 'createdAt') {
                             setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                           } else {
                             setSortBy('createdAt');
                             setSortOrder('desc');
                           }
                         }}
                       >
                         <div className="flex items-center gap-1">
                           가입일
                           {sortBy === 'createdAt' && (
                             <span className="text-xs">
                               {sortOrder === 'asc' ? '↑' : '↓'}
                             </span>
                           )}
                         </div>
                       </th>
                       <th 
                         className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                         onClick={() => {
                           if (sortBy === 'modifiedAt') {
                             setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                           } else {
                             setSortBy('modifiedAt');
                             setSortOrder('desc');
                           }
                         }}
                       >
                         <div className="flex items-center gap-1">
                           수정일
                           {sortBy === 'modifiedAt' && (
                             <span className="text-xs">
                               {sortOrder === 'asc' ? '↑' : '↓'}
                             </span>
                           )}
                         </div>
                       </th>
                                               <th className="text-center py-3 px-4 font-medium text-gray-700">관리</th>
                    </tr>
                  </thead>
                                     <tbody>
                     {sortedMembers.map((member, index) => (
                       <tr key={member.id} className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-200" onClick={() => handleMemberClick(member.id)}>
                         <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 text-gray-900">{member.name}</td>
                        <td className="py-3 px-4 text-gray-900">{member.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             member.status === 'ACTIVE' 
                               ? 'bg-green-100 text-green-800 border border-green-200' 
                               : member.status === 'DELETED'
                               ? 'bg-red-100 text-red-800 border border-red-200'
                               : member.status === 'BLOCKED'
                               ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                               : 'bg-gray-100 text-gray-800 border border-gray-200'
                           }`}>
                             {member.status === 'ACTIVE' ? '활성중' :
                              member.status === 'BLOCKED' ? '차단됨' :
                              member.status === 'DELETED' ? '삭제됨' : member.status}
                           </span>
                        </td>
                                                 <td className="py-3 px-4 text-gray-500">
                           {new Date(member.createdAt).toLocaleDateString()}
                         </td>
                                                   <td className="py-3 px-4 text-gray-500">
                            {member.modifiedAt ? new Date(member.modifiedAt).toLocaleDateString() : '-'}
                          </td>
                                                   <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMemberClick(member.id);
                                }}
                                className="text-blue-600 cursor-pointer hover:text-blue-700 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                              >
                                상세보기
                              </button>
                            </div>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 회원 상세 정보 모달 */}
      {selectedMemberId && (
        <MemberDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          memberId={selectedMemberId}
          onMemberUpdated={handleMemberUpdated}
        />
      )}
    </div>
  );
} 