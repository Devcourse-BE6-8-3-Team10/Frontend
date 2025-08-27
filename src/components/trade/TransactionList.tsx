'use client';

import React, { useState, useEffect } from 'react';
import { tradeAPI, TradeDto } from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionListProps {
  onTransactionSelect: (transaction: TradeDto) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onTransactionSelect }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TradeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const statusOptions = [
    { value: 'ALL', label: '전체', color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: '대기중', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'IN_PROGRESS', label: '진행중', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: '완료', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: '취소', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const fetchTransactions = async (page: number = 0, status: string = 'ALL') => {
    try {
      setLoading(true);
      setError(null);

      const response = await tradeAPI.getMyTrades(page, 10);

      let filteredTransactions = response.content;
      if (status !== 'ALL') {
        filteredTransactions = response.content.filter(trade => trade.status === status);
      }

      if (page === 0) {
        setTransactions(filteredTransactions);
      } else {
        setTransactions(prev => [...prev, ...filteredTransactions]);
      }

      setHasMore(!response.last);
      setCurrentPage(page);
    } catch (err) {
      setError('거래 내역을 불러오는데 실패했습니다.');
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(0, selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTransactions(currentPage + 1, selectedStatus);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => fetchTransactions(0, selectedStatus)}
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#1a365d]">거래 내역</h3>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === option.value
                  ? option.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">거래 내역을 불러오는 중...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-gray-600">거래 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => onTransactionSelect(transaction)}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a365d] text-sm mb-1">
                      거래 #{transaction.id}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      {transaction.buyerId === Number(user?.id) ? '구매' : '판매'} • {formatDate(transaction.createdAt)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      게시글 ID: {transaction.postId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#1a365d] text-sm mb-1">
                    ₩{formatPrice(transaction.price)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
