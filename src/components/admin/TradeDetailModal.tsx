'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/utils/apiClient';

interface Trade {
  id: number;
  postId: number;
  postTitle: string;
  postCategory: string;
  price: number;
  status: string;
  createdAt: string;
  sellerEmail: string;
  buyerEmail: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// 거래 상태를 한글로 변환하는 함수
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'REQUEST':
      return '거래 요청';
    case 'ACCEPT':
      return '거래 수락';
    case 'CANCELED':
      return '거래 취소';
    case 'COMPLETED':
      return '거래 완료';
    default:
      return status;
  }
};

// 거래 상태에 따른 색상 클래스
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'REQUEST':
      return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPT':
      return 'bg-blue-100 text-blue-800';
    case 'CANCELED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface TradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: number;
  onTradeUpdated: () => void;
}

export default function TradeDetailModal({ 
  isOpen, 
  onClose, 
  tradeId, 
  onTradeUpdated 
}: TradeDetailModalProps) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 거래 상세 정보 조회
  const fetchTradeDetail = useCallback(async () => {
    if (!tradeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminAPI.getTradeDetail(tradeId);
      const tradeData = response.data;
      setTrade(tradeData);
    } catch (err) {
      console.error('거래 상세 정보 조회 실패:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || '거래 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [tradeId]);

  // 모달이 열릴 때마다 거래 정보 조회
  useEffect(() => {
    if (isOpen && tradeId) {
      fetchTradeDetail();
    }
  }, [isOpen, tradeId, fetchTradeDetail]);

  // 모달 닫기
  const handleClose = () => {
    setTrade(null);
    setError(null);
    onClose();
  };

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">거래 상세 정보</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">거래 정보를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium mb-2">오류가 발생했습니다</p>
              <p className="text-gray-600 text-sm">{error}</p>
              <button
                onClick={fetchTradeDetail}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : trade ? (
            <div className="space-y-6">
              {/* 거래 기본 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">거래 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">거래 ID</label>
                    <p className="text-gray-900 font-medium">{trade.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">거래 상태</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trade.status)}`}>
                      {getStatusLabel(trade.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">거래 금액</label>
                    <p className="text-gray-900 font-semibold text-lg">{trade.price.toLocaleString()}원</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">거래일시</label>
                    <p className="text-gray-900">
                      {new Date(trade.createdAt).toLocaleDateString()} {new Date(trade.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* 게시글 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">게시글 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">게시글 ID</label>
                    <p className="text-gray-900 font-medium">{trade.postId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">제목</label>
                    <p className="text-gray-900 font-medium">{trade.postTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">카테고리</label>
                    <p className="text-gray-900">{trade.postCategory}</p>
                  </div>
                </div>
              </div>

              {/* 거래자 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">거래자 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">판매자 이메일</label>
                    <p className="text-gray-900 font-medium">{trade.sellerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">구매자 이메일</label>
                    <p className="text-gray-900 font-medium">{trade.buyerEmail}</p>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
