'use client';

import React, { useState, useCallback } from "react";
import { adminAPI } from "@/utils/apiClient";
import AdminNavigation from "@/components/AdminNavigation";
import AdminLoadingSpinner from "@/components/AdminLoadingSpinner";
import { useAdminTable } from "@/hooks/useAdminTable";
import PatentDetailModal from "@/components/admin/PatentDetailModal";

interface Patent {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  status: string;
  createdAt: string;
  modifiedAt?: string;
  favoriteCnt: number;
  authorId: number; 
  authorName?: string; 
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

export default function AdminPatentsPage() {
  const [selectedPatentId, setSelectedPatentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // fetchData 함수를 useCallback으로 감싸서 안정적인 참조 제공
  const fetchPatents = useCallback(async () => {
    const response = await adminAPI.getAllPatents();
    // 백엔드 응답 구조에 맞게 데이터 추출
    // 백엔드 응답: { resultCode: "200-1", msg: "...", data: { content: [...], ... } }
    return response?.data?.content || [];
  }, []);

  const { user, isAuthenticated, loading, data: patents, isLoading, error, refetch } = useAdminTable<Patent>(fetchPatents);

  const handlePatentClick = (patentId: number) => {
    setSelectedPatentId(patentId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPatentId(null);
  };

  const handlePatentUpdated = () => {
    refetch(); // 특허 목록 새로고침
  };

  // 필터링된 특허 목록
  const filteredPatents = patents.filter(patent => {
    const matchesSearch = (patent.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || patent.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 정렬된 특허 목록
  const sortedPatents = [...filteredPatents].sort((a, b) => {
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
      case 'favoriteCnt':
        aValue = a.favoriteCnt;
        bValue = b.favoriteCnt;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        // fallback
        aValue = a[sortBy as keyof Patent] as string;
        bValue = b[sortBy as keyof Patent] as string;
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
            <h1 className="text-2xl font-bold text-white">관리자 - 특허 관리</h1>
          </div>
          
          {/* 관리자 네비게이션 */}
          <AdminNavigation user={user} />

          {/* 특허 목록 카드 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a365d]">특허 목록</h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  총 {sortedPatents.length}개의 특허 (전체 {patents.length}개)
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
                   placeholder="제목으로 검색..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>

              <div className="sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                                     <option value="ALL">전체 카테고리</option>
                   <option value="PRODUCT">물건발명</option>
                   <option value="METHOD">방법발명</option>
                   <option value="USE">용도발명</option>
                   <option value="DESIGN">디자인권</option>
                   <option value="TRADEMARK">상표권</option>
                   <option value="COPYRIGHT">저작권</option>
                   <option value="ETC">기타</option>
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
                <p className="text-gray-600 font-medium">특허 목록을 불러오는 중...</p>
                <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
                {error && (
                  <p className="text-sm text-red-500 mt-2">오류: {error}</p>
                )}
              </div>
            ) : sortedPatents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">
                  {patents.length === 0 ? '📄' : '🔍'}
                </div>
                <p className="text-gray-600">
                  {patents.length === 0 ? '등록된 특허가 없습니다.' : '검색 결과가 없습니다.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {patents.length === 0 
                    ? '백엔드에서 관리자 API가 구현되면 특허 목록이 표시됩니다.'
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
                          if (sortBy === 'title') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('title');
                            setSortOrder('asc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          제목
                          {sortBy === 'title' && (
                            <span className="text-xs">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">카테고리</th>
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
                          가격
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
                          if (sortBy === 'favoriteCnt') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('favoriteCnt');
                            setSortOrder('desc');
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          좋아요
                          {sortBy === 'favoriteCnt' && (
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
                          등록일
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
                    {sortedPatents.map((patent, index) => (
                      <tr key={patent.id} className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-200" onClick={() => handlePatentClick(patent.id)}>
                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{patent.title}</td>
                                                 <td className="py-3 px-4">
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
                         </td>
                        <td className="py-3 px-4 text-gray-900">{patent.price.toLocaleString()}원</td>
                        <td className="py-3 px-4">
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
                        </td>
                        <td className="py-3 px-4 text-gray-900">{patent.favoriteCnt}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(patent.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatentClick(patent.id);
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

      {/* 특허 상세 정보 모달 */}
      {selectedPatentId && (
        <PatentDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          patentId={selectedPatentId}
          onPatentUpdated={handlePatentUpdated}
        />
      )}
    </div>
  );
} 