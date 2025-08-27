'use client';

import Image from "next/image";
import Link from "next/link"; // Import the Link component
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { patentAPI } from "@/utils/apiClient";
import apiClient from "@/utils/apiClient";

// 특허 데이터 타입 정의
interface Patent {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  category: string;
  createdAt: string;
  imageUrl?: string; // 이미지 URL 필드
}

// URL을 처리하는 헬퍼 함수
const getFullImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // 이미 절대 URL인 경우 그대로 반환
  }
  return `${apiClient.defaults.baseURL}${url}`; // 상대 URL인 경우 baseURL 추가
};

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [popularPatents, setPopularPatents] = useState<Patent[]>([]);
  const [recentPatents, setRecentPatents] = useState<Patent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchPatents = async () => {
      try {
        setDataLoading(true);
        const [popularResponse, recentResponse] = await Promise.all([
          patentAPI.getPopularPatents(),
          patentAPI.getRecentPatents(),
        ]);

        // 백엔드에서 받은 데이터에 완전한 이미지 URL 생성
        const processPatents = (patents: Patent[]) => {
          return patents.map(p => ({
            ...p,
            imageUrl: getFullImageUrl(p.imageUrl)
          }));
        };

        setPopularPatents(processPatents(popularResponse));
        setRecentPatents(processPatents(recentResponse));

      } catch (error) {
        console.error("특허 정보를 불러오는 데 실패했습니다.", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchPatents();
  }, []);


  // 로딩 중일 때는 스켈레톤 UI 표시
  if (loading || dataLoading) {
    return (
      <>
        {/* Hero Section Skeleton */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 text-center max-w-5xl mx-auto shadow-xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4 mx-auto w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-full"></div>
                <div className="h-4 bg-gray-300 rounded mb-2 mx-auto w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded mb-6 mx-auto w-4/6"></div>
                <div className="flex justify-center gap-4">
                  <div className="w-24 h-10 bg-gray-300 rounded"></div>
                  <div className="w-24 h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section Skeleton */}
        <section className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="w-32 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="w-20 h-10 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Patents Section Skeleton */}
        <section className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white/50">
                    <div className="animate-pulse">
                      <div className="w-full h-32 bg-gray-300 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-3"></div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="w-20 h-4 bg-gray-300 rounded"></div>
                        <div className="w-16 h-4 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-3 bg-gray-300 rounded mb-3"></div>
                      <div className="flex gap-2">
                        <div className="w-6 h-4 bg-gray-300 rounded"></div>
                        <div className="w-6 h-4 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 text-center max-w-5xl mx-auto shadow-xl">
            <h1 className="text-3xl font-bold text-[#1a365d] mb-4">특허 거래의 새로운 경험</h1>
            <p className="text-base text-[#1a365d] leading-relaxed">
              {isAuthenticated 
                ? `${user?.name}님을 위한 맞춤 특허를 찾아보세요.` 
                : '혁신적인 특허와 무형자산을 안전하고 편리하게 거래하세요. 전문가들이 인증한 고품질 특허만을 제공합니다.'
              }
            </p>
            {!isAuthenticated && (
              <div className="mt-6">
                <Link 
                  href="/login" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium mr-4"
                >
                  로그인
                </Link>
                <Link 
                  href="/register" 
                  className="bg-transparent border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex gap-3 mb-4">
              <input type="text" placeholder="특허명, 키워드, 발명자명으로 검색하세요..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                <option>전체 카테고리</option>
              </select>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">검색</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#인기특허</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#신규등록</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#가격대별</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#기술분야별</button>
              <button className="bg-blue-100 text-[#1a365d] px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors">#판매중</button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Patents Section */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-yellow-400 text-lg">🔥</span>
              ◆인기 특허
            </h2>
            <Link href="/patents" className="text-white hover:text-gray-300 transition-colors text-sm">전체보기 →</Link>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularPatents.map((patent) => (
                  <Link key={patent.id} href={`/patents/${patent.id}`} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50 flex flex-col">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                      {patent.imageUrl ? (
                        <Image src={patent.imageUrl} alt={patent.title} width={300} height={200} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-bold text-[#1a365d] mb-2 text-sm flex-grow">{patent.title}</h3>
                      <p className="text-gray-600 text-xs mb-3">{patent.description}</p>
                      <div className="flex justify-between items-center mb-2 mt-auto">
                        <span className="font-bold text-base text-[#1a365d]">₩{patent.price.toLocaleString()}</span>
                        <span className={`bg-${patent.status === '판매중' ? 'green' : patent.status === '예약중' ? 'yellow' : 'red'}-100 text-${patent.status === '판매중' ? 'green' : patent.status === '예약중' ? 'yellow' : 'red'}-800 px-2 py-1 rounded-full text-xs`}>{patent.status}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recently Registered Patents Section */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">NEW</span>
              최근 등록된 특허
            </h2>
            <Link href="/patents" className="text-white hover:text-gray-300 transition-colors text-sm">전체보기 →</Link>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPatents.map((patent) => (
                <Link key={patent.id} href={`/patents/${patent.id}`} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/50 flex flex-col">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    {patent.imageUrl ? (
                      <Image src={patent.imageUrl} alt={patent.title} width={300} height={200} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-bold text-[#1a365d] mb-2 text-sm flex-grow">{patent.title}</h3>
                    <p className="text-gray-600 text-xs mb-3">{patent.description}</p>
                    <div className="flex justify-between items-center mb-2 mt-auto">
                      <span className="font-bold text-base text-[#1a365d]">₩{patent.price.toLocaleString()}</span>
                      <span className={`bg-${patent.status === '판매중' ? 'green' : patent.status === '예약중' ? 'yellow' : 'red'}-100 text-${patent.status === '판매중' ? 'green' : patent.status === '예약중' ? 'yellow' : 'red'}-800 px-2 py-1 rounded-full text-xs`}>{patent.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-red-500 transition-colors text-sm">❤️</button>
                      <button className="text-gray-400 hover:text-blue-500 transition-colors text-sm">📤</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
