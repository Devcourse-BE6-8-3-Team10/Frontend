'use client';

import React, { useState, useCallback, useEffect } from "react";
import { adminAPI } from "@/utils/apiClient";
import AdminNavigation from "@/components/AdminNavigation";
import AdminLoadingSpinner from "@/components/AdminLoadingSpinner";
import { useAdminTable } from "@/hooks/useAdminTable";
import TradeDetailModal from "@/components/admin/TradeDetailModal";

interface Trade {
  id: number;
  postId: number;
  sellerId: number;
  buyerId: number;
  price: number;
  status: string;
  createdAt: string;
}

interface TradeWithPostInfo extends Trade {
  postTitle?: string;
  postCategory?: string;
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

// 게시글 카테고리를 한글 라벨로 변환하는 함수
const getCategoryLabel = (category: string): string => {
  // 이미 한글인 경우 그대로 반환
  const koreanCategories = ["물건발명", "방법발명", "용도발명", "디자인권", "상표권", "저작권"];
  if (koreanCategories.includes(category)) {
    return category;
  }
  
  // 영어인 경우 한글로 변환
  switch (category) {
    case "PRODUCT":
      return "물건발명";
    case "METHOD":
      return "방법발명";
    case "USAGE":
      return "용도발명";
    case "DESIGN":
      return "디자인권";
    case "TRADEMARK":
      return "상표권";
    case "COPYRIGHT":
      return "저작권";
    default:
      return category || "기타"; // 빈 값이면 "기타"로 표시
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

export default function AdminTradesPage() {
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tradesWithPostInfo, setTradesWithPostInfo] = useState<TradeWithPostInfo[]>([]);

  // fetchData 함수를 useCallback으로 감싸서 안정적인 참조 제공
  const fetchTrades = useCallback(async () => {
    const response = await adminAPI.getAllTrades();
    // 백엔드 응답 구조에 맞게 데이터 추출
    // 백엔드 응답: { resultCode: "200-1", msg: "...", data: { content: [...], ... } }
    return response?.data?.content || [];
  }, []);

  const { user, isAuthenticated, loading, data: trades, isLoading, error, refetch } = useAdminTable<Trade>(fetchTrades);

  // 거래 목록이 변경될 때마다 게시글 정보를 가져오기
  useEffect(() => {
    if (trades.length > 0) {
      fetchPostInfoForTrades(trades);
    } else {
      setTradesWithPostInfo([]);
    }
  }, [trades]);

  // 각 거래에 대해 게시글 정보를 가져오는 함수
  const fetchPostInfoForTrades = async (trades: Trade[]) => {
    const results = await Promise.all(
      trades.map(async (trade) => {
        try {
          const { data } = await adminAPI.getTradeDetail(trade.id);
          return {
            ...trade,
            postTitle: data?.postTitle ?? '제목 없음',
            // 원본 카테고리를 한글 라벨로 변환하여 UI/검색/배지 색상과 일치
            postCategory: data?.postCategory
              ? getCategoryLabel(data.postCategory)
              : '카테고리 없음',
          } as TradeWithPostInfo;
        } catch (error) {
          console.error(`거래 ${trade.id} 상세 정보 조회 실패:`, error);
          return {
            ...trade,
            postTitle: '제목 없음',
            postCategory: '카테고리 없음',
          } as TradeWithPostInfo;
        }
      })
    );
    setTradesWithPostInfo(results);
  };

  const handleTradeClick = (tradeId: number) => {
    setSelectedTradeId(tradeId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTradeId(null);
  };

  const handleTradeUpdated = () => {
    refetch(); // 거래 목록 새로고침
  };

  // 필터링된 거래 목록
  const filteredTrades = tradesWithPostInfo.filter(trade => {
    const matchesSearch = trade.id.toString().includes(searchTerm) ||
                         (trade.postTitle && trade.postTitle.includes(searchTerm)) ||
                         (trade.postCategory && trade.postCategory.includes(searchTerm)) ||
                         trade.price.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 정렬된 거래 목록
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'postTitle':
        aValue = a.postTitle || '';
        bValue = b.postTitle || '';
        break;
      case 'postCategory':
        aValue = a.postCategory || '';
        bValue = b.postCategory || '';
        break;
      default:
        // fallback
        aValue = a[sortBy as keyof TradeWithPostInfo] as string;
        bValue = b[sortBy as keyof TradeWithPostInfo] as string;
        break;
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
            <h1 className="text-2xl font-bold text-white">관리자 - 거래 내역 관리</h1>
          </div>
          
          {/* 관리자 네비게이션 */}
          <AdminNavigation user={user} />

          {/* 거래 목록 카드 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a365d]">거래 내역 목록</h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  총 {sortedTrades.length}개의 거래 (전체 {trades.length}개)
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
                  placeholder="거래 ID, 특허 제목, 카테고리, 거래금액으로 검색..."
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
                  <option value="REQUEST">거래 요청</option>
                  <option value="ACCEPT">거래 수락</option>
                  <option value="CANCELED">거래 취소</option>
                  <option value="COMPLETED">거래 완료</option>
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
                <p className="text-gray-600 font-medium">거래 내역을 불러오는 중...</p>
                <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
                {error && (
                  <p className="text-sm text-red-500 mt-2">오류: {error}</p>
                )}
              </div>
            ) : sortedTrades.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">
                  {trades.length === 0 ? '💰' : '🔍'}
                </div>
                <p className="text-gray-600">
                  {trades.length === 0 ? '등록된 거래가 없습니다.' : '검색 결과가 없습니다.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  다른 검색어나 필터를 시도해보세요.
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
                          if (sortBy === 'postTitle') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('postTitle');
                            setSortOrder('desc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          특허 제목
                          {sortBy === 'postTitle' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (sortBy === 'postCategory') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('postCategory');
                            setSortOrder('desc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          카테고리
                          {sortBy === 'postCategory' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          if (sortBy === 'price') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('price');
                            setSortOrder('desc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          거래금액
                          {sortBy === 'price' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
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
                          거래일시
                          {sortBy === 'createdAt' && (
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
                    {sortedTrades.map((trade, index) => (
                      <tr key={trade.id} className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-200" onClick={() => handleTradeClick(trade.id)}>
                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 text-gray-900">{trade.postTitle || '제목 없음'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              trade.postCategory === '물건발명'
                                ? 'bg-blue-100 text-blue-800'
                                : trade.postCategory === '방법발명'
                                ? 'bg-green-100 text-green-800'
                                : trade.postCategory === '용도발명'
                                ? 'bg-purple-100 text-purple-800'
                                : trade.postCategory === '디자인권'
                                ? 'bg-orange-100 text-orange-800'
                                : trade.postCategory === '상표권'
                                ? 'bg-red-100 text-red-800'
                                : trade.postCategory === '저작권'
                                ? 'bg-indigo-100 text-indigo-800'
                                : trade.postCategory === '기타'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-100 text-gray-800' // 기본 회색
                            }`}
                          >
                            {trade.postCategory || '카테고리 없음'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{trade.price.toLocaleString()}원</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(trade.status)}`}>
                            {getStatusLabel(trade.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(trade.createdAt).toLocaleDateString()} {new Date(trade.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTradeClick(trade.id);
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

      {/* 거래 상세 정보 모달 */}
      {selectedTradeId && (
        <TradeDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          tradeId={selectedTradeId}
          onTradeUpdated={handleTradeUpdated}
        />
      )}
    </div>
  );
}