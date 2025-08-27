'use client';

import React, { useState, useEffect } from 'react';
import { tradeAPI, TradeDetailDto } from '@/utils/apiClient';

interface TradeDetailProps {
  tradeId: number | null;
  onClose: () => void;
}

export default function TradeDetail({ tradeId, onClose }: TradeDetailProps) {
  const [tradeDetail, setTradeDetail] = useState<TradeDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tradeId) {
      fetchTradeDetail(tradeId);
    }
  }, [tradeId]);

  const fetchTradeDetail = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const detail = await tradeAPI.getTradeDetail(id);
      setTradeDetail(detail);
    } catch (err) {
      setError('거래 상세 정보를 불러오는데 실패했습니다.');
      console.error('Error fetching trade detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '완료';
      case 'PENDING':
        return '진행중';
      case 'CANCELLED':
        return '취소됨';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (!tradeId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">거래 상세 내역</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">거래 정보를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchTradeDetail(tradeId)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {tradeDetail && !loading && (
          <div className="space-y-6">
            {/* 거래 기본 정보 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">거래 정보</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">거래 ID:</span>
                  <p className="font-medium text-gray-900">#{tradeDetail.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">거래 상태:</span>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tradeDetail.status)}`}>
                      {getStatusText(tradeDetail.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">거래 금액:</span>
                  <p className="font-bold text-lg text-purple-600">₩{formatPrice(tradeDetail.price)}</p>
                </div>
                <div>
                  <span className="text-gray-600">거래 일시:</span>
                  <p className="font-medium text-gray-900">{formatDate(tradeDetail.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* 게시글 정보 */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">게시글 정보</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">제목:</span>
                  <p className="font-medium text-lg text-gray-900">{tradeDetail.postTitle}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">카테고리:</span>
                  <p className="font-medium text-gray-900">{tradeDetail.postCategory}</p>
                </div>
              </div>
            </div>

            {/* 거래 당사자 정보 */}
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">거래 당사자</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">판매자:</span>
                  <p className="font-medium text-gray-900">{tradeDetail.sellerEmail}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">구매자:</span>
                  <p className="font-medium text-gray-900">{tradeDetail.buyerEmail}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
} 