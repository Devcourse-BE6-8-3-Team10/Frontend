'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/utils/apiClient';

interface Patent {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  status: string;
  createdAt: string;
  modifiedAt?: string;
  favoriteCnt: number; // 좋아요 수 추가
  authorId: number; // 작성자 ID 추가
  authorName?: string; // 작성자 정보 추가
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// 카테고리를 한글로 변환하는 함수
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'PRODUCT':
      return '물건발명';
    case 'METHOD':
      return '방법발명';
    case 'USE':
      return '용도발명';
    case 'DESIGN':
      return '디자인권';
    case 'TRADEMARK':
      return '상표권';
    case 'COPYRIGHT':
      return '저작권';
    case 'ETC':
      return '기타';
    default:
      return category;
  }
};

// 상태를 한글로 변환하는 함수
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'SALE':
      return '판매중';
    case 'SOLD_OUT':
      return '판매완료';
    case 'SUSPENDED':
      return '판매중단';
    default:
      return status;
  }
};

interface PatentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patentId: number;
  onPatentUpdated: () => void;
}

export default function PatentDetailModal({ 
  isOpen, 
  onClose, 
  patentId, 
  onPatentUpdated 
}: PatentDetailModalProps) {
  const [patent, setPatent] = useState<Patent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    status: 'SALE' // 상태 초기값 설정
  });

  // 특허 상세 정보 조회
  const fetchPatentDetail = useCallback(async () => {
    if (!patentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminAPI.getPatentDetail(patentId);
      const patentData = response.data;
      setPatent(patentData);
      setFormData({
        title: patentData.title || '',
        description: patentData.description || '',
        category: patentData.category || '',
        price: patentData.price || 0,
        status: patentData.status || 'SALE' // 상태 데이터 포함
      });
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || '특허 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [patentId]);

  // 특허 정보 수정
  const handleUpdatePatent = async () => {
    if (!patentId) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const updateData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      status: formData.status // 상태 포함
    };
    
    console.log('백엔드로 전송되는 데이터:', updateData);
    
    try {
      await adminAPI.updatePatentByAdmin(patentId, updateData);
      setSuccessMessage('특허 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);
      await fetchPatentDetail(); // 수정된 정보 다시 조회
      onPatentUpdated(); // 부모 컴포넌트에 업데이트 알림
      
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || '특허 정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };



  // 특허 삭제
  const handleDeletePatent = async () => {
    if (!patentId) return;
    
    if (!confirm('정말로 이 특허를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await adminAPI.deletePatentByAdmin(patentId);
      setSuccessMessage('특허가 성공적으로 삭제되었습니다.');
      onPatentUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.response?.data?.message || '특허 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patentId) {
      fetchPatentDetail();
    }
  }, [isOpen, patentId, fetchPatentDetail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">특허 상세 정보</h2>
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
        ) : patent ? (
          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">특허 ID</label>
                  <p className="text-gray-900">{patent.id}</p>
                </div>
                {patent.authorName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작성자</label>
                    <p className="text-gray-900">{patent.authorName}</p>
                  </div>
                )}
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                   <p className="text-gray-900">
                     {new Date(patent.createdAt).toLocaleDateString('ko-KR', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
                   </p>
                 </div>
                 {patent.modifiedAt && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">수정일</label>
                     <p className="text-gray-900">
                       {new Date(patent.modifiedAt).toLocaleDateString('ko-KR', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </p>
                   </div>
                 )}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">좋아요 수</label>
                   <p className="text-gray-900">{patent.favoriteCnt}</p>
                 </div>
                
              </div>
            </div>

            {/* 수정 가능한 정보 섹션 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">수정 가능한 정보</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PRODUCT">물건발명</option>
                      <option value="METHOD">방법발명</option>
                      <option value="USE">용도발명</option>
                      <option value="DESIGN">디자인권</option>
                      <option value="TRADEMARK">상표권</option>
                      <option value="COPYRIGHT">저작권</option>
                      <option value="ETC">기타</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                     <select
                       value={formData.status}
                       onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                       className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="SALE">판매중</option>
                       <option value="SOLD_OUT">판매완료</option>
                       <option value="SUSPENDED">판매중단</option>
                     </select>
                   </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleUpdatePatent}
                      disabled={isLoading}
                      className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? '저장 중...' : '저장'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                      <p className="text-gray-900 font-medium">{patent.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patent.category === 'PRODUCT' 
                          ? 'bg-blue-100 text-blue-800' 
                          : patent.category === 'METHOD'
                          ? 'bg-green-100 text-green-800'
                          : patent.category === 'USE'
                          ? 'bg-purple-100 text-purple-800'
                          : patent.category === 'DESIGN'
                          ? 'bg-orange-100 text-orange-800'
                          : patent.category === 'TRADEMARK'
                          ? 'bg-red-100 text-red-800'
                          : patent.category === 'COPYRIGHT'
                          ? 'bg-indigo-100 text-indigo-800'
                          : patent.category === 'ETC'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getCategoryLabel(patent.category)}
                      </span>
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                       <p className="text-gray-900">{patent.price.toLocaleString()}원</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                       <span className={`px-2 py-1 rounded-full text-xs ${
                         patent.status === 'SALE'
                           ? 'bg-green-100 text-green-800'
                           : patent.status === 'SOLD_OUT'
                           ? 'bg-red-100 text-red-800'
                           : patent.status === 'SUSPENDED'
                           ? 'bg-yellow-100 text-yellow-800'
                           : 'bg-gray-100 text-gray-800'
                       }`}>
                         {getStatusLabel(patent.status)}
                       </span>
                     </div>

                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{patent.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 cursor-pointer text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        닫기
                      </button>
                    </div>
                    <button
                      onClick={handleDeletePatent}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">특허 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 