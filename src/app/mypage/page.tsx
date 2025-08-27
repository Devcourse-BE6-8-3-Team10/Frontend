'use client';

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import TradeHistory from "@/components/trade/TradeHistory";
import TradeDetail from "@/components/trade/TradeDetail";

// 내가 등록/찜한 특허 목록 타입
interface PostListDTO {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  thumbnailImageUrl: string;
  favoriteCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  memberId: number;
  memberName: string;
  memberProfileImageUrl: string;
  isFavorite: boolean;
}

// 거래 내역 타입 정의
interface Trade {
  id: number;
  status: string;
  // API 응답에 따라 필요한 다른 속성들을 추가할 수 있습니다.
  // 예: postTitle: string;
}

export default function MyPage() {
  const { user, isAuthenticated, loading, refreshUserInfo, userUpdateTimestamp, accessToken } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);

  const [myPatents, setMyPatents] = useState<PostListDTO[]>([]);
  const [likedPatents, setLikedPatents] = useState<PostListDTO[]>([]);
  const [myPatentsLoading, setMyPatentsLoading] = useState(true);
  const [likedPatentsLoading, setLikedPatentsLoading] = useState(true);
  const [myPatentsError, setMyPatentsError] = useState<string | null>(null);
  const [likedPatentsError, setLikedPatentsError] = useState<string | null>(null);
  const [completedTradesCount, setCompletedTradesCount] = useState(0);
  const [completedTradesLoading, setCompletedTradesLoading] = useState(true);
  const [completedTradesError, setCompletedTradesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedTrades = async () => {
      if (!isAuthenticated) return;
      try {
        console.log('Fetching completed trades...');
        setCompletedTradesLoading(true);
        setCompletedTradesError(null);
        
        const response = await apiClient.get<{ data: { content: Trade[] } }>('/api/trades');
        console.log('Completed trades response:', response.data);
        
        const completed = (response.data.data?.content || []).filter((trade: Trade) => trade.status === 'COMPLETED');
        setCompletedTradesCount(completed.length);
        console.log('Completed trades count:', completed.length);
      } catch (error) {
        console.error('Failed to fetch completed trades:', error);
        setCompletedTradesError('거래 완료 내역을 불러오는 데 실패했습니다.');
      } finally {
        setCompletedTradesLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCompletedTrades();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchMyPatents = async () => {
      if (!isAuthenticated) return;
      try {
        console.log('Fetching my patents...');
        setMyPatentsLoading(true);
        setMyPatentsError(null);
        
        const response = await apiClient.get<{data: PostListDTO[]}>('/api/posts/me');
        console.log('My patents response:', response.data);
        
        setMyPatents(response.data.data || response.data || []);
        console.log('My patents count:', (response.data.data || response.data || []).length);
      } catch (error) {
        console.error('Failed to fetch my patents:', error);
        setMyPatentsError('내 특허를 불러오는 데 실패했습니다.');
      } finally {
        setMyPatentsLoading(false);
      }
    };

    const fetchLikedPatents = async () => {
      if (!isAuthenticated) return;
      try {
        console.log('Fetching liked patents...');
        setLikedPatentsLoading(true);
        setLikedPatentsError(null);
        
        const response = await apiClient.get<{data: PostListDTO[]}>('/api/likes/me');
        console.log('Liked patents response:', response.data);
        
        setLikedPatents(response.data.data || response.data || []);
        console.log('Liked patents count:', (response.data.data || response.data || []).length);
      } catch (error) {
        console.error('Failed to fetch liked patents:', error);
        setLikedPatentsError('찜한 특허를 불러오는 데 실패했습니다.');
      } finally {
        setLikedPatentsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMyPatents();
      fetchLikedPatents();
    }
  }, [isAuthenticated]);

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // AuthContext의 사용자 정보 로깅
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      loading,
      accessToken: accessToken ? 'present' : 'missing'
    });
  }, [isAuthenticated, user, loading, accessToken]);

  const handleImageChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post(`/api/members/${user?.id}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshUserInfo();

    } catch (error) {
      console.error('Failed to upload profile image:', error);
      setUploadError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !isAuthenticated) {
    return (
      <div className="pb-10">
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {loading ? '로딩 중...' : '인증 확인 중...'}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Debug: loading={loading.toString()}, isAuthenticated={isAuthenticated.toString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">마이페이지</h1>

          {/* User Info Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Profile Image Section: <img>를 <Image>로 수정 */}
                <div className="relative">
                  {user?.profileUrl ? (
                    <div className="relative w-24 h-24">
                      <Image
                        src={`${user.profileUrl.startsWith('http') ? user.profileUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${user.profileUrl}`}?t=${userUpdateTimestamp}`}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-4xl">
                        {user?.name?.charAt(0) || '👤'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleImageChangeClick}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Change profile image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    aria-label="프로필 이미지 업로드"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a365d]">{user?.name || '사용자'}</h2>
                  <p className="text-gray-600 text-sm">{user?.email || '이메일 없음'}</p>
                  {isUploading && <p className="text-sm text-purple-600">이미지 업로드 중...</p>}
                  {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                </div>
              </div>
              <button
                onClick={() => router.push('/mypage/edit')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-sm"
              >
                개인정보 수정
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#1a365d]">
                  {myPatentsLoading ? '...' : myPatentsError ? '오류' : myPatents.length}
                </div>
                <div className="text-sm text-gray-600">내 특허</div>
                {myPatentsError && <div className="text-xs text-red-500 mt-1">{myPatentsError}</div>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#1a365d]">
                  {likedPatentsLoading ? '...' : likedPatentsError ? '오류' : likedPatents.length}
                </div>
                <div className="text-sm text-gray-600">찜한 특허</div>
                {likedPatentsError && <div className="text-xs text-red-500 mt-1">{likedPatentsError}</div>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#1a365d]">
                  {completedTradesLoading ? '...' : completedTradesError ? '오류' : completedTradesCount}
                </div>
                <div className="text-sm text-gray-600">거래 완료</div>
                {completedTradesError && <div className="text-xs text-red-500 mt-1">{completedTradesError}</div>}
              </div>
            </div>
          </div>

          {/* My Patents Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">내 특허</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPatentsLoading ? (
                <p>내 특허를 불러오는 중...</p>
              ) : myPatentsError ? (
                <p className="text-red-600">{myPatentsError}</p>
              ) : myPatents.length === 0 ? (
                <p>등록된 특허가 없습니다.</p>
              ) : (
                myPatents.map((patent) => (
                  <div key={patent.id} className="border border-gray-200 rounded-xl p-4 bg-white/50">
                    <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <span className="text-blue-600 text-lg">🔋</span>
                    </div>
                    <h4 className="font-bold text-[#1a365d] mb-2 text-sm">{patent.title}</h4>
                    <p className="text-gray-600 text-xs mb-3">{patent.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base text-[#1a365d]">₩{patent.price.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patent.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                        patent.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patent.status === 'RESERVED' ? '예약중' :
                         patent.status === 'SOLD' ? '판매완료' :
                         '판매중'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-purple-600 hover:text-purple-700 text-sm">수정</button>
                      <button className="text-red-600 hover:text-red-700 text-sm">삭제</button>
                    </div>
                  </div>
                ))
              )}
              {/* Add New Patent */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center bg-white/30">
                <button
                  onClick={() => router.push('/patents/register')}
                  className="text-gray-500 hover:text-purple-600 transition-colors"
                >
                  <div className="text-2xl mb-2">+</div>
                  <div className="text-sm">새 특허 등록</div>
                </button>
              </div>
            </div>
          </div>
          {/* Liked Patents Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">찜한 특허</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {likedPatentsLoading ? (
                <p>찜한 특허를 불러오는 중...</p>
              ) : likedPatentsError ? (
                <p className="text-red-600">{likedPatentsError}</p>
              ) : likedPatents.length === 0 ? (
                <p>찜한 특허가 없습니다.</p>
              ) : (
                likedPatents.map((patent) => (
                  <div key={patent.id} className="border border-gray-200 rounded-xl p-4 bg-white/50">
                    <div className="bg-pink-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                      <span className="text-pink-600 text-lg">🔊</span>
                    </div>
                    <h4 className="font-bold text-[#1a365d] mb-2 text-sm">{patent.title}</h4>
                    <p className="text-gray-600 text-xs mb-3">{patent.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base text-[#1a365d]">₩{patent.price.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patent.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                        patent.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patent.status === 'RESERVED' ? '예약중' :
                         patent.status === 'SOLD' ? '판매완료' :
                         '판매중'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-purple-600 hover:text-purple-700 text-sm">구매문의</button>
                      <button className="text-red-600 hover:text-red-700 text-sm">찜해제</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trade History Section */}
          <TradeHistory onTradeSelect={setSelectedTradeId} />
        </div>
      </section>

      {/* Trade Detail Modal */}
      {selectedTradeId && (
        <TradeDetail
          tradeId={selectedTradeId}
          onClose={() => setSelectedTradeId(null)}
        />
      )}
    </div>
  );
}
