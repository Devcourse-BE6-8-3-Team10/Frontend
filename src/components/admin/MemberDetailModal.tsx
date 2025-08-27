'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { adminAPI } from '@/utils/apiClient';

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

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: number;
  onMemberUpdated: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function MemberDetailModal({ 
  isOpen, 
  onClose, 
  memberId, 
  onMemberUpdated 
}: MemberDetailModalProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    profileUrl: '' as string | null
  });
  const [isProfileUrlCleared, setIsProfileUrlCleared] = useState(false);
  const [shouldClearProfileUrl, setShouldClearProfileUrl] = useState(false);

  // 회원 상세 정보 조회
  const fetchMemberDetail = useCallback(async () => {
    if (!memberId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminAPI.getMemberDetail(memberId);
      const memberData = response.data;
      setMember(memberData);
      setFormData({
        name: memberData.name || '',
        status: memberData.status || '',
        profileUrl: memberData.profileUrl || ''
      });
      setIsProfileUrlCleared(false);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || '회원 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  // 회원 정보 수정
  const handleUpdateMember = async () => {
    if (!memberId) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    // 프로필 이미지 처리: 초기화가 체크되었거나 빈 값인 경우 null로 설정
    let profileUrl = formData.profileUrl;
    
    if (isProfileUrlCleared || shouldClearProfileUrl || (profileUrl !== null && profileUrl !== undefined && profileUrl.trim() === '')) {
      profileUrl = null;
    }
    
    const updateData = {
      ...formData,
      profileUrl: profileUrl
    };
    
    console.log('백엔드로 전송되는 데이터:', updateData);
    
    try {
      await adminAPI.updateMemberByAdmin(memberId, updateData);
      setSuccessMessage('회원 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);
      await fetchMemberDetail(); // 수정된 정보 다시 조회
      onMemberUpdated(); // 부모 컴포넌트에 업데이트 알림
      
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || '회원 정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 탈퇴 처리
  const handleDeleteMember = async () => {
    if (!memberId) return;
    
    if (!confirm('정말로 이 회원을 탈퇴시키시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await adminAPI.deleteMemberByAdmin(memberId);
      setSuccessMessage('회원이 성공적으로 탈퇴되었습니다.');
      onMemberUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberDetail();
    }
  }, [isOpen, memberId, fetchMemberDetail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">회원 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : member ? (
          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">기본 정보</h3>
              <div className="flex gap-6">
                {/* 프로필 이미지 썸네일 */}
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
                  {member.profileUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20">
                        <Image 
                          src={`${member.profileUrl.startsWith('http') ? member.profileUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${member.profileUrl}`}`}
                          alt="프로필 이미지" 
                          fill
                          className="rounded-full object-cover border border-gray-200"
                          onError={() => {
                            // 에러 처리
                            setError('프로필 이미지를 불러올 수 없습니다.');
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">이미지 로드 실패</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500">이미지 없음</span>
                    </div>
                  )}
                </div>
                
                {/* 기본 정보들 */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회원 ID</label>
                    <p className="text-gray-900">{member.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <p className="text-gray-900">{member.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
                    <p className="text-gray-900">
                      {new Date(member.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {member.modifiedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">수정일</label>
                      <p className="text-gray-900">
                        {new Date(member.modifiedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {member.deletedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">탈퇴일</label>
                      <p className="text-red-600">
                        {new Date(member.deletedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

                         {/* 수정 가능한 정보 섹션 */}
             <div className="bg-blue-50 p-4 rounded-lg">
               <h3 className="text-lg font-semibold mb-4 text-gray-700">수정 가능한 정보</h3>
               
               {member.status === 'DELETED' && (
                 <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                   <p className="text-sm">
                     <strong>탈퇴된 회원입니다.</strong> 탈퇴된 회원의 정보는 수정할 수 없습니다.
                   </p>
                 </div>
               )}
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">프로필 이미지</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.profileUrl || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, profileUrl: e.target.value });
                          setIsProfileUrlCleared(false);
                          setShouldClearProfileUrl(false);
                        }}
                        className="flex-1 px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, profileUrl: '' });
                          setIsProfileUrlCleared(true);
                          setShouldClearProfileUrl(true);
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        초기화
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">초기화 버튼을 누르면 프로필 이미지가 제거됩니다</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="ACTIVE"
                          checked={formData.status === 'ACTIVE'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">사용중</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="BLOCKED"
                          checked={formData.status === 'BLOCKED'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">차단</span>
                      </label>
                    </div>
                  </div>
                  
                                     <div className="flex gap-2 pt-4">
                     <button
                       onClick={handleUpdateMember}
                       disabled={isLoading || member.status === 'DELETED'}
                       className={`px-4 py-2 rounded-md ${
                         member.status === 'DELETED'
                           ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                           : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                       } disabled:opacity-50`}
                     >
                       {isLoading ? '저장 중...' : 
                        member.status === 'DELETED' ? '저장 불가' : '저장'}
                     </button>
                     <button
                       onClick={() => setIsEditing(false)}
                       className="px-4 py-2 cursor-pointer bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                     >
                       취소
                     </button>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                      <p className="text-gray-900">{member.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : member.status === 'BLOCKED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : member.status === 'DELETED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status === 'ACTIVE' ? '사용중' :
                         member.status === 'BLOCKED' ? '차단됨' :
                         member.status === 'DELETED' ? '탈퇴됨' : member.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">프로필 이미지 경로</label>
                      <p className="text-gray-900 text-sm break-all">
                        {member.profileUrl || '설정되지 않음'}
                      </p>
                    </div>
                  </div>
                  
                                     <div className="flex justify-between items-center pt-4">
                     <div className="flex gap-2">
                       <button
                         onClick={() => setIsEditing(true)}
                         disabled={member.status === 'DELETED' || isLoading}
                         className={`px-4 py-2 rounded-md ${
                           member.status === 'DELETED'
                             ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                             : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                         } disabled:opacity-50`}
                       >
                         {member.status === 'DELETED' ? '수정 불가' : '수정'}
                       </button>
                       <button
                         onClick={onClose}
                         className="px-4 py-2 bg-gray-300 cursor-pointer text-gray-700 rounded-md hover:bg-gray-400"
                       >
                         닫기
                       </button>
                     </div>
                     <button
                       onClick={handleDeleteMember}
                       disabled={isLoading || member.status === 'DELETED'}
                       className={`px-4 py-2 rounded-md ${
                         member.status === 'DELETED'
                           ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                           : 'bg-red-600 text-white cursor-pointer hover:bg-red-700'
                       } disabled:opacity-50`}
                     >
                       {isLoading ? '탈퇴 중...' : 
                        member.status === 'DELETED' ? '이미 탈퇴됨' : '회원탈퇴'}
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">회원 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 