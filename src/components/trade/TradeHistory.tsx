'use client';

import React, { useState, useEffect } from 'react';
import { tradeAPI, TradeDto } from '@/utils/apiClient';

interface TradeHistoryProps {
  onTradeSelect: (tradeId: number) => void;
}

export default function TradeHistory({ onTradeSelect }: TradeHistoryProps) {
  const [trades, setTrades] = useState<TradeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTrades = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await tradeAPI.getMyTrades(page, 10);
      setTrades(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError('거래내역을 불러오는데 실패했습니다.');
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

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
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-[#1a365d] mb-4">거래내역</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">거래내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-[#1a365d] mb-4">거래내역</h3>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchTrades()}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-[#1a365d] mb-4">거래내역</h3>
      
      {trades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">거래내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {trades.map((trade) => (
              <div 
                key={trade.id}
                className="border border-gray-200 rounded-xl p-4 bg-white/50 hover:bg-white/70 transition-colors cursor-pointer"
                onClick={() => onTradeSelect(trade.id)}
              >
                                 <div className="flex justify-between items-start mb-2">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-sm text-gray-500">거래 #{trade.id}</span>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                         {getStatusText(trade.status)}
                       </span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-lg text-[#1a365d]">₩{formatPrice(trade.price)}</p>
                   </div>
                 </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>판매자: {trade.sellerId}</span>
                  <span>구매자: {trade.buyerId}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(trade.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => fetchTrades(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => fetchTrades(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 